import logging
import urllib.request
import urllib.error
import json
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

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
