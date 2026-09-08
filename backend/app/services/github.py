import logging
import urllib.request
import urllib.error
import json
import re
import base64
from typing import Dict, Any, List, Optional, Tuple
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Ingestion limits
# ---------------------------------------------------------------------------
MAX_FILES = 40
MAX_FILE_BYTES = 100_000     # 100 KB per file
MAX_TOTAL_BYTES = 500_000    # ~500 KB total extracted text

# Directories/prefixes to skip entirely
IGNORE_PREFIXES = (
    ".git/",
    "node_modules/",
    "venv/",
    ".venv/",
    "__pycache__/",
    "dist/",
    "build/",
    "target/",
    ".eggs/",
    "*.egg-info/",
    "coverage/",
    ".nyc_output/",
    ".tox/",
)

# Individual filenames to skip
IGNORE_FILES = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.example",
    "package-lock.json",
    "yarn.lock",
    "poetry.lock",
    "Pipfile.lock",
    "Cargo.lock",
    "composer.lock",
    "Gemfile.lock",
    ".DS_Store",
    "Thumbs.db",
}

# Binary / media extensions to skip
BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg", ".webp",
    ".pdf", ".zip", ".tar", ".gz", ".bz2", ".xz", ".rar", ".7z",
    ".whl", ".jar", ".war", ".ear", ".class",
    ".mp3", ".mp4", ".avi", ".mov", ".mkv", ".wav", ".flac",
    ".ttf", ".woff", ".woff2", ".eot", ".otf",
    ".pyc", ".pyo", ".so", ".dll", ".dylib", ".exe", ".bin",
    ".db", ".sqlite", ".sqlite3",
    ".min.js", ".min.css",
}

# Priority groups (lower index = higher priority)
_PRIORITY_MAP: List[Tuple[int, Any]] = [
    # exact filename matches
    (0, {"README.md", "README.rst", "README.txt", "README"}),
    # documentation markdown / rst
    (1, lambda path: path.endswith(".md") or path.endswith(".rst")),
    # key config/manifest files
    (2, {
        "requirements.txt", "requirements-dev.txt", "pyproject.toml", "setup.py",
        "setup.cfg", "Pipfile",
        "package.json", "tsconfig.json",
        "pom.xml", "build.gradle", "build.gradle.kts",
        "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
        ".github/workflows",
    }),
    # YAML / TOML config
    (3, lambda path: path.endswith(".yml") or path.endswith(".yaml") or path.endswith(".toml")),
    # primary source languages
    (4, lambda path: any(path.endswith(ext) for ext in (
        ".py", ".ts", ".js", ".tsx", ".jsx",
        ".java", ".go", ".rs", ".cpp", ".c", ".h", ".rb",
        ".cs", ".swift", ".kt", ".scala",
    ))),
    # Jupyter notebooks
    (5, lambda path: path.endswith(".ipynb")),
    # any remaining text files
    (6, lambda path: any(path.endswith(ext) for ext in (
        ".txt", ".cfg", ".ini", ".env.example", ".sh", ".bash",
        ".xml", ".json", ".graphql",
    ))),
]


def _file_priority(path: str) -> int:
    """Return priority score (lower = more important) for a file path."""
    name = path.split("/")[-1]
    for score, matcher in _PRIORITY_MAP:
        if isinstance(matcher, set):
            if name in matcher or path in matcher:
                return score
        elif callable(matcher):
            if matcher(path):
                return score
    return 99  # unmatched


def _should_ignore(path: str) -> bool:
    """Return True if the file should be skipped entirely."""
    name = path.split("/")[-1]

    # Check ignored filenames
    if name in IGNORE_FILES:
        return True

    # Check ignored directory prefixes
    for prefix in IGNORE_PREFIXES:
        if prefix.endswith("/"):
            if path.startswith(prefix) or ("/" + prefix) in path:
                return True
        elif name == prefix:
            return True

    # Check binary / image extensions
    for ext in BINARY_EXTENSIONS:
        if name.endswith(ext):
            return True
        # handle .min.js etc.
        if path.endswith(ext):
            return True

    return False


# ---------------------------------------------------------------------------
# Original GitHubService (unchanged — used by resume/profile pipeline)
# ---------------------------------------------------------------------------

class GitHubService:
    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Opportunity-DNA-App"
        }
        if self.token:
            headers["Authorization"] = f"token {self.token}"
        return headers

    def extract_username(self, github_url: str) -> Optional[str]:
        """
        Extracts username from standard GitHub URLs.
        E.g., https://github.com/octocat -> octocat
        """
        if not github_url:
            return None
        parts = github_url.rstrip("/").split("/")
        if len(parts) >= 4 and "github.com" in parts[2]:
            return parts[3]
        elif len(parts) == 1:
            return parts[0]
        return None

    def fetch_user_repos(self, github_url: str) -> List[Dict[str, Any]]:
        """
        Fetches repository details for the candidate.
        Returns repository objects listing languages, descriptions, and stars.
        Returns an empty list if API fails or rate limit is hit.
        """
        username = self.extract_username(github_url)
        if not username:
            logger.warning(f"Could not parse username from URL: {github_url}")
            return []

        url = f"https://api.github.com/users/{username}/repos?per_page=50&sort=updated"
        req = urllib.request.Request(url, headers=self._get_headers())

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    return json.loads(response.read().decode())
        except urllib.error.HTTPError as e:
            logger.error(f"GitHub API HTTP error for user '{username}': {e.code} - {e.reason}")
        except urllib.error.URLError as e:
            logger.error(f"GitHub network connection error: {e.reason}")
        except Exception as e:
            logger.error(f"Unexpected error fetching GitHub details: {e}")

        return []

    def extract_repo_evidence(self, github_url: str) -> List[Dict[str, Any]]:
        """
        Translates raw GitHub repository payloads into Evidence objects.
        Returns a list of dictionaries structured like Evidence schemas.
        """
        repos = self.fetch_user_repos(github_url)
        evidence_list = []

        for repo in repos:
            if repo.get("fork"):
                continue  # focus on original projects for core capability evidence

            evidence_list.append({
                "type": "github",
                "title": repo.get("name", "GitHub Repository"),
                "description": repo.get("description"),
                "source": "GitHub",
                "source_url": repo.get("html_url"),
                "date": repo.get("updated_at"),
                "raw_content": json.dumps({
                    "language": repo.get("language"),
                    "stars": repo.get("stargazers_count"),
                    "open_issues": repo.get("open_issues_count"),
                    "topics": repo.get("topics", [])
                })
            })

        return evidence_list


# ---------------------------------------------------------------------------
# GitHubRepoIngestionService — Phase 3 deep single-repo ingestion
# ---------------------------------------------------------------------------

class GitHubIngestionError(Exception):
    """Raised for known GitHub API errors with an HTTP status hint."""
    def __init__(self, message: str, status_hint: int = 500):
        super().__init__(message)
        self.status_hint = status_hint


class GitHubRepoIngestionService:
    """
    Fetches a bounded evidence bundle from a single public GitHub repository
    without cloning. Uses the GitHub REST API only.
    """

    _REPO_URL_RE = re.compile(
        r"^https?://github\.com/(?P<owner>[A-Za-z0-9_.-]+)/(?P<repo>[A-Za-z0-9_.-]+?)(?:\.git)?/?$"
    )

    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN

    def _headers(self) -> Dict[str, str]:
        h = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "SkillForge-OpportunityDNA",
        }
        if self.token:
            h["Authorization"] = f"token {self.token}"
        return h

    def _get(self, url: str, timeout: int = 15) -> Any:
        """Execute a GET request and return parsed JSON. Raises GitHubIngestionError on failure."""
        req = urllib.request.Request(url, headers=self._headers())
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode("utf-8", errors="ignore")
            except Exception:
                pass
            if e.code == 404:
                raise GitHubIngestionError(
                    "Repository not found or is private. Only public repositories can be analyzed.",
                    status_hint=404
                )
            if e.code in (403, 429):
                raise GitHubIngestionError(
                    "GitHub API rate limit exceeded. Please wait a few minutes and try again.",
                    status_hint=429
                )
            raise GitHubIngestionError(
                f"GitHub API error {e.code}: {e.reason}. {body[:200]}",
                status_hint=502
            )
        except urllib.error.URLError as e:
            raise GitHubIngestionError(
                f"Network error reaching GitHub API: {e.reason}",
                status_hint=502
            )
        except Exception as e:
            raise GitHubIngestionError(
                f"Unexpected error fetching GitHub data: {str(e)}",
                status_hint=502
            )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @classmethod
    def validate_repo_url(cls, url: str) -> Tuple[str, str]:
        """
        Validate that ``url`` is a public GitHub repository URL.
        Returns (owner, repo) on success.
        Raises ValueError with a user-friendly message on failure.
        """
        if not url or not isinstance(url, str):
            raise ValueError("Repository URL is required.")
        url = url.strip()
        if not url.startswith("https://github.com/") and not url.startswith("http://github.com/"):
            raise ValueError(
                "Only public GitHub repository URLs are supported "
                "(e.g. https://github.com/owner/repository)."
            )
        m = cls._REPO_URL_RE.match(url)
        if not m:
            raise ValueError(
                "Invalid GitHub repository URL. Expected format: "
                "https://github.com/<owner>/<repository>"
            )
        return m.group("owner"), m.group("repo")

    def fetch_repo_metadata(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch repository metadata from the GitHub API."""
        url = f"https://api.github.com/repos/{owner}/{repo}"
        logger.info(f"[GitHubIngestion] Fetching metadata for {owner}/{repo}")
        return self._get(url)

    def fetch_repo_tree(self, owner: str, repo: str, default_branch: str) -> List[Dict[str, Any]]:
        """
        Fetch the full recursive file tree for the given branch.
        Returns a flat list of tree node dicts.
        """
        # First get the commit SHA for the branch
        branch_url = f"https://api.github.com/repos/{owner}/{repo}/branches/{default_branch}"
        branch_data = self._get(branch_url)
        sha = branch_data["commit"]["sha"]

        tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{sha}?recursive=1"
        tree_data = self._get(tree_url)
        return tree_data.get("tree", [])

    def prioritize_and_filter_files(self, tree: List[Dict[str, Any]]) -> List[str]:
        """
        From the repo tree, select at most MAX_FILES paths to fetch,
        ordered by priority and excluding ignored paths.
        """
        blobs = [node for node in tree if node.get("type") == "blob"]

        # Filter out ignored files
        candidates = [
            node["path"] for node in blobs
            if not _should_ignore(node["path"])
        ]

        # Sort by priority (ascending = higher priority first)
        candidates.sort(key=_file_priority)

        return candidates[:MAX_FILES]

    def fetch_file_content(self, owner: str, repo: str, path: str) -> Optional[str]:
        """
        Fetch a single file's content via the GitHub Contents API.
        Returns decoded UTF-8 text, or None if the file is binary/too large/undecodable.
        Respects MAX_FILE_BYTES limit.
        """
        url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
        try:
            data = self._get(url)
        except GitHubIngestionError as e:
            logger.warning(f"[GitHubIngestion] Skipping {path}: {e}")
            return None

        if data.get("type") != "file":
            return None

        size = data.get("size", 0)
        if size > MAX_FILE_BYTES:
            logger.debug(f"[GitHubIngestion] Skipping {path}: size {size} > {MAX_FILE_BYTES}")
            return None

        encoded = data.get("content", "")
        encoding = data.get("encoding", "base64")
        if encoding != "base64" or not encoded:
            return None

        try:
            raw_bytes = base64.b64decode(encoded)
            return raw_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.debug(f"[GitHubIngestion] Skipping {path}: decode error {e}")
            return None

    def build_evidence_bundle(
        self,
        repo_url: str,
        metadata: Dict[str, Any],
        file_contents: List[Tuple[str, str]],
    ) -> Dict[str, Any]:
        """
        Assemble a bounded evidence bundle with provenance attribution.

        Returns a dict with:
          - repository_url
          - metadata summary
          - list of {path, content, source_url} items
          - total_text_bytes
        """
        html_url = metadata.get("html_url", repo_url)
        bundle_files = []
        for path, content in file_contents:
            file_url = f"{html_url}/blob/{metadata.get('default_branch', 'main')}/{path}"
            bundle_files.append({
                "path": path,
                "content": content,
                "source_url": file_url,
                "bytes": len(content.encode("utf-8")),
            })

        total_bytes = sum(f["bytes"] for f in bundle_files)

        return {
            "repository_url": repo_url,
            "owner": metadata.get("owner", {}).get("login", ""),
            "repo_name": metadata.get("name", ""),
            "description": metadata.get("description"),
            "primary_language": metadata.get("language"),
            "topics": metadata.get("topics", []),
            "stars": metadata.get("stargazers_count", 0),
            "default_branch": metadata.get("default_branch", "main"),
            "html_url": html_url,
            "files": bundle_files,
            "total_text_bytes": total_bytes,
        }

    def ingest_repository(self, repo_url: str) -> Dict[str, Any]:
        """
        Full ingestion pipeline for a single public GitHub repository.
        Returns the evidence bundle dict ready to pass to the AI pipeline.

        Raises:
          ValueError — invalid/non-GitHub URL
          GitHubIngestionError — GitHub API failures
        """
        owner, repo = self.validate_repo_url(repo_url)
        metadata = self.fetch_repo_metadata(owner, repo)

        default_branch = metadata.get("default_branch", "main")

        # Fetch tree; if branch fetch fails try 'main' then 'master'
        try:
            tree = self.fetch_repo_tree(owner, repo, default_branch)
        except GitHubIngestionError:
            logger.warning(f"[GitHubIngestion] Tree fetch failed for branch {default_branch}, trying 'main'")
            try:
                tree = self.fetch_repo_tree(owner, repo, "main")
            except GitHubIngestionError:
                tree = self.fetch_repo_tree(owner, repo, "master")

        if not tree:
            raise GitHubIngestionError(
                "The repository appears to be empty or has no accessible file tree.",
                status_hint=400
            )

        selected_paths = self.prioritize_and_filter_files(tree)
        if not selected_paths:
            raise GitHubIngestionError(
                "No analyzable source files found in this repository "
                "(all files are binary, generated, or ignored).",
                status_hint=400
            )

        # Fetch file contents with total size cap
        file_contents: List[Tuple[str, str]] = []
        total_bytes = 0

        for path in selected_paths:
            if total_bytes >= MAX_TOTAL_BYTES:
                logger.info(f"[GitHubIngestion] Total text limit reached after {len(file_contents)} files")
                break
            content = self.fetch_file_content(owner, repo, path)
            if content is None:
                continue
            content_bytes = len(content.encode("utf-8"))
            if total_bytes + content_bytes > MAX_TOTAL_BYTES:
                # Truncate to fit
                remaining = MAX_TOTAL_BYTES - total_bytes
                content = content.encode("utf-8")[:remaining].decode("utf-8", errors="ignore")
                content_bytes = len(content.encode("utf-8"))
            file_contents.append((path, content))
            total_bytes += content_bytes

        if not file_contents:
            raise GitHubIngestionError(
                "Could not retrieve any file contents from the repository. "
                "The repository may only contain binary or empty files.",
                status_hint=400
            )

        logger.info(
            f"[GitHubIngestion] Ingested {len(file_contents)} files "
            f"({total_bytes:,} bytes) from {owner}/{repo}"
        )
        return self.build_evidence_bundle(repo_url, metadata, file_contents)
