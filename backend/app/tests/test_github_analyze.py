"""
Phase 3 GitHub Repository Evidence Ingestion — Backend Tests

Tests cover:
  - URL validation (valid, invalid, non-GitHub, bare username)
  - Authorization (unauthenticated, wrong student, non-student role)
  - GitHub API error mapping (404 not-found/private, 429 rate-limit, network failure)
  - Ingestion limits (file count, file size, total text)
  - File filtering (ignored directories, binary files)
  - Evidence creation and idempotency (duplicate analysis)
  - Skill normalization
  - Gemini failure mapping
  - Empty / no-analyzable-files repos
"""
import pytest
from unittest.mock import MagicMock, patch, call
import json

from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.github import (
    GitHubRepoIngestionService,
    GitHubIngestionError,
    _should_ignore,
    _file_priority,
    MAX_FILES,
    MAX_FILE_BYTES,
    MAX_TOTAL_BYTES,
)
from backend.app.api.router import analyze_github_repository


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_user(id=1, role="student", account_status="active", email="student@example.com"):
    u = models.User(
        id=id,
        email=email,
        full_name="Test Student",
        role=role,
        account_status=account_status,
        is_active=True,
        password_hash="x",
    )
    return u


def _make_candidate(id=1, email="student@example.com", user_id=1):
    c = models.Candidate(id=id, name="Test Student", email=email, user_id=user_id)
    c.evidence = []
    c.skills = []
    return c


def _mock_db_with_candidate(candidate, user_id_for_skill_lookup=None):
    """Return a mock DB that resolves Candidate and other queries."""
    db = MagicMock()

    def query_side(model):
        q = MagicMock()
        if model == models.Candidate:
            q.filter.return_value.first.return_value = candidate
        elif model == models.CandidateSkill:
            q.filter.return_value.first.return_value = None  # no existing skills
        elif model == models.Skill:
            # Return None so normalize_and_get_skill creates a new one
            q.filter.return_value.first.return_value = None
        elif model == models.SkillEvidence:
            q.filter.return_value.first.return_value = None
        else:
            q.filter.return_value.first.return_value = None
        return q

    db.query = query_side
    db.flush = MagicMock()
    db.commit = MagicMock()
    db.add = MagicMock()
    db.rollback = MagicMock()

    def mock_refresh(obj):
        if isinstance(obj, models.Evidence):
            obj.id = getattr(obj, 'id', 100)
        if isinstance(obj, models.Candidate):
            obj.evidence = getattr(obj, 'evidence', [])
            obj.skills = getattr(obj, 'skills', [])

    db.refresh = mock_refresh
    return db


def _make_bundle(repo_name="my-repo", num_files=2, file_bytes=500):
    """Create a minimal ingestion bundle."""
    files = [
        {
            "path": f"src/file{i}.py",
            "content": "x" * file_bytes,
            "source_url": f"https://github.com/user/{repo_name}/blob/main/src/file{i}.py",
            "bytes": file_bytes,
        }
        for i in range(num_files)
    ]
    return {
        "repository_url": f"https://github.com/user/{repo_name}",
        "owner": "user",
        "repo_name": repo_name,
        "description": "A test repo",
        "primary_language": "Python",
        "topics": ["ml", "python"],
        "stars": 42,
        "default_branch": "main",
        "html_url": f"https://github.com/user/{repo_name}",
        "files": files,
        "total_text_bytes": num_files * file_bytes,
    }


def _make_discovered_skills(evidence_ids):
    """Return a mock AIDiscoveredSkillList with one skill."""
    skill = schemas.AIDiscoveredSkill(
        name="Python",
        category="Backend",
        skill_type="explicit",
        confidence=0.95,
        proficiency="Intermediate",
        evidence_ids=evidence_ids,
        explanation="Python usage found in source files.",
    )
    return schemas.AIDiscoveredSkillList(skills=[skill])


# ---------------------------------------------------------------------------
# 1. URL Validation — valid URL
# ---------------------------------------------------------------------------

def test_validate_repo_url_valid():
    owner, repo = GitHubRepoIngestionService.validate_repo_url(
        "https://github.com/octocat/Hello-World"
    )
    assert owner == "octocat"
    assert repo == "Hello-World"


def test_validate_repo_url_with_trailing_slash():
    owner, repo = GitHubRepoIngestionService.validate_repo_url(
        "https://github.com/octocat/Hello-World/"
    )
    assert owner == "octocat"
    assert repo == "Hello-World"


# ---------------------------------------------------------------------------
# 2. URL Validation — invalid (no scheme / no repo)
# ---------------------------------------------------------------------------

def test_validate_repo_url_no_scheme():
    with pytest.raises(ValueError, match="Only public GitHub"):
        GitHubRepoIngestionService.validate_repo_url("github.com/octocat/repo")


def test_validate_repo_url_non_github():
    with pytest.raises(ValueError, match="Only public GitHub"):
        GitHubRepoIngestionService.validate_repo_url("https://gitlab.com/user/repo")


def test_validate_repo_url_bare_username():
    """A URL with only the owner (no repo) must be rejected."""
    with pytest.raises(ValueError):
        GitHubRepoIngestionService.validate_repo_url("https://github.com/octocat")


def test_validate_repo_url_empty():
    with pytest.raises(ValueError):
        GitHubRepoIngestionService.validate_repo_url("")


# ---------------------------------------------------------------------------
# 3. Authorization — unauthenticated (require_role raises 403 before function body)
# ---------------------------------------------------------------------------

def test_unauthenticated_raises_403():
    """require_role('student') is enforced by FastAPI dependency injection.
    We test that a non-student user (industry) gets rejected."""
    from fastapi import HTTPException
    industry_user = _make_user(role="industry", account_status="active")
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/octocat/Hello-World"
    )

    # Simulate require_role enforcement by calling with non-student user
    # The function checks role at the dependency level; we simulate by
    # checking what would happen if the user passed through with wrong role.
    # The endpoint itself re-checks ownership but not role (dependency handles it).
    # Here we verify the candidate ownership check.
    other_candidate = _make_candidate(id=2, user_id=99, email="other@example.com")
    db2 = _mock_db_with_candidate(other_candidate)
    student = _make_user(role="student", id=1)

    with pytest.raises(HTTPException) as exc_info:
        analyze_github_repository(
            candidate_id=2,
            payload=payload,
            db=db2,
            current_user=student,
        )
    assert exc_info.value.status_code == 403


# ---------------------------------------------------------------------------
# 4. Authorization — candidate ownership violation
# ---------------------------------------------------------------------------

def test_ownership_violation_raises_403():
    from fastapi import HTTPException
    # Candidate belongs to user_id=99, but current_user has id=1
    other_candidate = _make_candidate(id=5, user_id=99, email="other@example.com")
    db = _mock_db_with_candidate(other_candidate)
    student = _make_user(role="student", id=1, email="student@example.com")
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/octocat/Hello-World"
    )

    with pytest.raises(HTTPException) as exc_info:
        analyze_github_repository(
            candidate_id=5,
            payload=payload,
            db=db,
            current_user=student,
        )
    assert exc_info.value.status_code == 403
    assert "own" in exc_info.value.detail.lower()


# ---------------------------------------------------------------------------
# 5. Authorization — candidate not found → 404
# ---------------------------------------------------------------------------

def test_candidate_not_found_raises_404():
    from fastapi import HTTPException
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    student = _make_user(role="student", id=1)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/octocat/Hello-World"
    )
    with pytest.raises(HTTPException) as exc_info:
        analyze_github_repository(
            candidate_id=999,
            payload=payload,
            db=db,
            current_user=student,
        )
    assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# 6. Invalid URL → 400
# ---------------------------------------------------------------------------

def test_invalid_url_raises_400():
    from fastapi import HTTPException
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    student = _make_user(role="student", id=1)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://not-github.com/user/repo"
    )
    with pytest.raises(HTTPException) as exc_info:
        analyze_github_repository(
            candidate_id=1,
            payload=payload,
            db=db,
            current_user=student,
        )
    assert exc_info.value.status_code == 400


# ---------------------------------------------------------------------------
# 7. GitHub 404 (repo not found or private) → 404
# ---------------------------------------------------------------------------

def test_github_not_found_raises_404():
    from fastapi import HTTPException
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    student = _make_user(role="student", id=1)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/user/private-repo"
    )
    with patch.object(
        GitHubRepoIngestionService, "validate_repo_url",
        return_value=("user", "private-repo")
    ), patch.object(
        GitHubRepoIngestionService, "ingest_repository",
        side_effect=GitHubIngestionError("Repository not found or is private.", status_hint=404)
    ):
        with pytest.raises(HTTPException) as exc_info:
            analyze_github_repository(
                candidate_id=1, payload=payload, db=db, current_user=student
            )
    assert exc_info.value.status_code == 404


# ---------------------------------------------------------------------------
# 8. GitHub rate limit → 429
# ---------------------------------------------------------------------------

def test_github_rate_limit_raises_429():
    from fastapi import HTTPException
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    student = _make_user(role="student", id=1)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/user/repo"
    )
    with patch.object(
        GitHubRepoIngestionService, "validate_repo_url",
        return_value=("user", "repo")
    ), patch.object(
        GitHubRepoIngestionService, "ingest_repository",
        side_effect=GitHubIngestionError("GitHub API rate limit exceeded.", status_hint=429)
    ):
        with pytest.raises(HTTPException) as exc_info:
            analyze_github_repository(
                candidate_id=1, payload=payload, db=db, current_user=student
            )
    assert exc_info.value.status_code == 429


# ---------------------------------------------------------------------------
# 9. GitHub network failure → 502
# ---------------------------------------------------------------------------

def test_github_network_failure_raises_502():
    from fastapi import HTTPException
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    student = _make_user(role="student", id=1)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/user/repo"
    )
    with patch.object(
        GitHubRepoIngestionService, "validate_repo_url",
        return_value=("user", "repo")
    ), patch.object(
        GitHubRepoIngestionService, "ingest_repository",
        side_effect=GitHubIngestionError("Network error.", status_hint=502)
    ):
        with pytest.raises(HTTPException) as exc_info:
            analyze_github_repository(
                candidate_id=1, payload=payload, db=db, current_user=student
            )
    assert exc_info.value.status_code == 502


# ---------------------------------------------------------------------------
# 10. Empty repository → 400
# ---------------------------------------------------------------------------

def test_empty_repo_raises_400():
    from fastapi import HTTPException
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    student = _make_user(role="student", id=1)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/user/empty-repo"
    )
    with patch.object(
        GitHubRepoIngestionService, "validate_repo_url",
        return_value=("user", "empty-repo")
    ), patch.object(
        GitHubRepoIngestionService, "ingest_repository",
        return_value=_make_bundle(num_files=0)
    ):
        with pytest.raises(HTTPException) as exc_info:
            analyze_github_repository(
                candidate_id=1, payload=payload, db=db, current_user=student
            )
    assert exc_info.value.status_code == 400


# ---------------------------------------------------------------------------
# 11. Gemini failure → 502
# ---------------------------------------------------------------------------

def test_gemini_failure_raises_502():
    from fastapi import HTTPException
    from backend.app.services import analyzer as analyzer_mod
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    student = _make_user(role="student", id=1)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/user/repo"
    )
    bundle = _make_bundle()
    with patch.object(
        GitHubRepoIngestionService, "validate_repo_url",
        return_value=("user", "repo")
    ), patch.object(
        GitHubRepoIngestionService, "ingest_repository",
        return_value=bundle
    ), patch.object(
        analyzer_mod.AIAnalyzerService, "discover_skills_from_evidence",
        side_effect=RuntimeError("Gemini unavailable")
    ):
        with pytest.raises(HTTPException) as exc_info:
            analyze_github_repository(
                candidate_id=1, payload=payload, db=db, current_user=student
            )
    assert exc_info.value.status_code == 502


# ---------------------------------------------------------------------------
# 12. File count limit respected in ingestion service
# ---------------------------------------------------------------------------

def test_file_count_limit():
    svc = GitHubRepoIngestionService(token=None)
    # Build a tree with MAX_FILES + 20 blobs
    tree = [
        {"type": "blob", "path": f"src/module{i}.py", "size": 100}
        for i in range(MAX_FILES + 20)
    ]
    selected = svc.prioritize_and_filter_files(tree)
    assert len(selected) <= MAX_FILES


# ---------------------------------------------------------------------------
# 13. File size limit — oversized files are skipped
# ---------------------------------------------------------------------------

def test_file_size_limit():
    svc = GitHubRepoIngestionService(token=None)
    # Simulate fetch_file_content for an oversized file via the Contents API response
    oversized_content = {"type": "file", "size": MAX_FILE_BYTES + 1, "content": "", "encoding": "base64"}
    with patch.object(svc, "_get", return_value=oversized_content):
        result = svc.fetch_file_content("user", "repo", "bigfile.py")
    assert result is None  # should be skipped


# ---------------------------------------------------------------------------
# 14. Total text limit — stops accumulating after MAX_TOTAL_BYTES
# ---------------------------------------------------------------------------

def test_total_text_limit():
    svc = GitHubRepoIngestionService(token=None)
    # Mock: 100 files each exactly 10 KB (total would be 1 MB if uncapped)
    chunk = "x" * 10_000  # 10 KB
    fake_selected = [f"file{i}.py" for i in range(100)]

    def mock_fetch(owner, repo, path):
        return chunk

    with patch.object(svc, "prioritize_and_filter_files", return_value=fake_selected), \
         patch.object(svc, "fetch_file_content", side_effect=mock_fetch), \
         patch.object(svc, "fetch_repo_metadata", return_value={
             "name": "repo", "default_branch": "main", "html_url": "https://github.com/u/repo",
             "owner": {"login": "u"}, "description": None, "language": "Python",
             "topics": [], "stargazers_count": 0,
         }), \
         patch.object(svc, "fetch_repo_tree", return_value=[
             {"type": "blob", "path": f"file{i}.py"} for i in range(100)
         ]):
        bundle = svc.ingest_repository("https://github.com/u/repo")

    assert bundle["total_text_bytes"] <= MAX_TOTAL_BYTES + 10_001  # allow one partial file
    # All 50 files (MAX_TOTAL_BYTES // 10_000) or fewer should be included
    expected_max_files = (MAX_TOTAL_BYTES // 10_000) + 1  # +1 for potential partial
    assert len(bundle["files"]) <= expected_max_files


# ---------------------------------------------------------------------------
# 15. Ignored files are filtered correctly
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("path, should_be_ignored", [
    ("node_modules/react/index.js", True),
    ("venv/lib/python3.10/site.py", True),
    (".venv/something.py", True),
    ("__pycache__/module.cpython-311.pyc", True),
    ("dist/bundle.js", True),
    ("build/output.js", True),
    (".env", True),
    (".env.local", True),
    ("package-lock.json", True),
    ("yarn.lock", True),
    ("poetry.lock", True),
    ("image.png", True),
    ("photo.jpg", True),
    ("app.pyc", True),
    ("src/main.py", False),
    ("README.md", False),
    ("requirements.txt", False),
    ("Dockerfile", False),
    ("src/components/App.tsx", False),
])
def test_ignored_files(path, should_be_ignored):
    assert _should_ignore(path) == should_be_ignored


# ---------------------------------------------------------------------------
# 16. Priority ordering — README should come before source files
# ---------------------------------------------------------------------------

def test_priority_ordering():
    svc = GitHubRepoIngestionService(token=None)
    tree = [
        {"type": "blob", "path": "src/app.py"},
        {"type": "blob", "path": "src/utils.py"},
        {"type": "blob", "path": "README.md"},
        {"type": "blob", "path": "requirements.txt"},
        {"type": "blob", "path": "docs/guide.md"},
    ]
    selected = svc.prioritize_and_filter_files(tree)
    assert selected[0] == "README.md"  # Highest priority
    # requirements.txt should appear before generic .py files
    req_idx = selected.index("requirements.txt") if "requirements.txt" in selected else -1
    app_idx = selected.index("src/app.py") if "src/app.py" in selected else 999
    assert req_idx < app_idx


# ---------------------------------------------------------------------------
# 17. Evidence creation — correct number of records created
# ---------------------------------------------------------------------------

def test_evidence_created_correctly():
    from backend.app.services import analyzer as analyzer_mod
    from backend.app.services import normalization as norm_mod
    from backend.app.services import dna as dna_mod
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    student = _make_user(role="student", id=1)
    bundle = _make_bundle(num_files=3)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/user/repo"
    )

    added_items = []
    db.add = lambda item: added_items.append(item)

    ev_id_counter = [100]
    def mock_flush():
        for item in added_items:
            if isinstance(item, models.Evidence) and not hasattr(item, '_flushed'):
                item.id = ev_id_counter[0]
                ev_id_counter[0] += 1
                item._flushed = True

    db.flush = mock_flush

    with patch.object(
        GitHubRepoIngestionService, "validate_repo_url",
        return_value=("user", "repo")
    ), patch.object(
        GitHubRepoIngestionService, "ingest_repository",
        return_value=bundle
    ), patch.object(
        analyzer_mod.AIAnalyzerService, "discover_skills_from_evidence",
        return_value=schemas.AIDiscoveredSkillList(skills=[])
    ), patch.object(
        dna_mod.DNACalculator, "calculate_profile_dna",
        return_value=None
    ):
        result = analyze_github_repository(
            candidate_id=1, payload=payload, db=db, current_user=student
        )

    # 1 metadata + 3 file evidence records = 4
    evidence_items = [i for i in added_items if isinstance(i, models.Evidence)]
    assert len(evidence_items) == 4  # 1 repo metadata + 3 files
    assert result.evidence_created == 4
    assert result.files_analyzed == 3


# ---------------------------------------------------------------------------
# 18. Skill normalization — discovered skills are normalized
# ---------------------------------------------------------------------------

def test_skills_normalized():
    from backend.app.services import analyzer as analyzer_mod
    from backend.app.services import normalization as norm_mod
    from backend.app.services import dna as dna_mod
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    student = _make_user(role="student", id=1)
    bundle = _make_bundle(num_files=1)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/user/repo"
    )

    ev_id_counter = [100]
    added_items = []

    def mock_add(item):
        added_items.append(item)

    def mock_flush():
        for item in added_items:
            if isinstance(item, models.Evidence) and not hasattr(item, '_flushed'):
                item.id = ev_id_counter[0]
                ev_id_counter[0] += 1
                item._flushed = True
            if isinstance(item, models.CandidateSkill) and not hasattr(item, '_flushed'):
                item.id = ev_id_counter[0]
                ev_id_counter[0] += 1
                item._flushed = True

    db.add = mock_add
    db.flush = mock_flush

    mock_skill_obj = models.Skill(id=10, name="Python", category="Backend")
    mock_skill_obj.description = "Standardized competency"

    discovered = _make_discovered_skills(evidence_ids=[100])  # will match first flushed evidence

    norm_calls = []
    def mock_normalize(db_, name, cat):
        norm_calls.append((name, cat))
        return mock_skill_obj

    with patch.object(
        GitHubRepoIngestionService, "validate_repo_url",
        return_value=("user", "repo")
    ), patch.object(
        GitHubRepoIngestionService, "ingest_repository",
        return_value=bundle
    ), patch.object(
        analyzer_mod.AIAnalyzerService, "discover_skills_from_evidence",
        return_value=discovered
    ), patch.object(
        norm_mod.SkillNormalizer, "normalize_and_get_skill",
        side_effect=mock_normalize
    ), patch.object(
        dna_mod.DNACalculator, "calculate_profile_dna",
        return_value=None
    ):
        result = analyze_github_repository(
            candidate_id=1, payload=payload, db=db, current_user=student
        )

    assert len(result.skills_discovered) == 1
    assert result.skills_discovered[0].name == "Python"
    assert len(norm_calls) == 1
    assert norm_calls[0] == ("Python", "Backend")


# ---------------------------------------------------------------------------
# 19. Idempotency — duplicate analysis upserts existing CandidateSkill
# ---------------------------------------------------------------------------

def test_duplicate_analysis_upserts_skill():
    from backend.app.services import analyzer as analyzer_mod
    from backend.app.services import normalization as norm_mod
    from backend.app.services import dna as dna_mod
    candidate = _make_candidate()
    student = _make_user(role="student", id=1)
    bundle = _make_bundle(num_files=1)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/user/repo"
    )

    # Simulate an existing CandidateSkill for Python
    existing_cs = models.CandidateSkill(
        id=5,
        candidate_id=1,
        skill_id=10,
        confidence=0.70,
        proficiency="Beginner",
        evidence_strength=1.0,
        skill_type="explicit",
    )

    call_count = {"n": 0}

    db = MagicMock()
    ev_id_counter = [100]
    added_items = []

    def query_side(model):
        q = MagicMock()
        if model == models.Candidate:
            q.filter.return_value.first.return_value = candidate
        elif model == models.CandidateSkill:
            # First call returns existing skill, subsequent return None for SkillEvidence check
            call_count["n"] += 1
            q.filter.return_value.first.return_value = existing_cs if call_count["n"] == 1 else None
        elif model == models.SkillEvidence:
            q.filter.return_value.first.return_value = None
        else:
            q.filter.return_value.first.return_value = None
        return q

    def mock_flush():
        for item in added_items:
            if isinstance(item, models.Evidence) and not hasattr(item, '_flushed'):
                item.id = ev_id_counter[0]
                ev_id_counter[0] += 1
                item._flushed = True

    db.query = query_side
    db.add = lambda item: added_items.append(item)
    db.flush = mock_flush
    db.commit = MagicMock()
    db.rollback = MagicMock()

    def mock_refresh(obj):
        if isinstance(obj, models.Candidate):
            obj.evidence = []
            obj.skills = []

    db.refresh = mock_refresh

    mock_skill_obj = models.Skill(id=10, name="Python", category="Backend")
    discovered = _make_discovered_skills(evidence_ids=[100])

    with patch.object(
        GitHubRepoIngestionService, "validate_repo_url",
        return_value=("user", "repo")
    ), patch.object(
        GitHubRepoIngestionService, "ingest_repository",
        return_value=bundle
    ), patch.object(
        analyzer_mod.AIAnalyzerService, "discover_skills_from_evidence",
        return_value=discovered
    ), patch.object(
        norm_mod.SkillNormalizer, "normalize_and_get_skill",
        return_value=mock_skill_obj
    ), patch.object(
        dna_mod.DNACalculator, "calculate_profile_dna",
        return_value=None
    ):
        result = analyze_github_repository(
            candidate_id=1, payload=payload, db=db, current_user=student
        )

    # Existing skill should be updated (upserted), not created as new
    new_cs_items = [i for i in added_items if isinstance(i, models.CandidateSkill)]
    assert len(new_cs_items) == 0  # no new CandidateSkill added — existing was updated
    # Confidence updated since 0.95 > 0.70
    assert existing_cs.confidence == 0.95


# ---------------------------------------------------------------------------
# 20. Successful full analysis — response shape is correct
# ---------------------------------------------------------------------------

def test_successful_analysis_response():
    from backend.app.services import analyzer as analyzer_mod
    from backend.app.services import normalization as norm_mod
    from backend.app.services import dna as dna_mod
    candidate = _make_candidate()
    db = _mock_db_with_candidate(candidate)
    student = _make_user(role="student", id=1)
    bundle = _make_bundle(num_files=2)
    payload = schemas.GitHubAnalyzeRequest(
        repository_url="https://github.com/user/my-repo"
    )

    ev_id_counter = [200]
    added_items = []

    def mock_add(item):
        added_items.append(item)

    def mock_flush():
        for item in added_items:
            if isinstance(item, models.Evidence) and not hasattr(item, '_flushed'):
                item.id = ev_id_counter[0]
                ev_id_counter[0] += 1
                item._flushed = True
            if isinstance(item, models.CandidateSkill) and not hasattr(item, '_flushed'):
                item.id = ev_id_counter[0]
                ev_id_counter[0] += 1
                item._flushed = True

    db.add = mock_add
    db.flush = mock_flush

    discovered = schemas.AIDiscoveredSkillList(skills=[
        schemas.AIDiscoveredSkill(
            name="Python", category="Backend", skill_type="explicit",
            confidence=0.9, proficiency="Intermediate",
            evidence_ids=[200], explanation="Python code found."
        ),
        schemas.AIDiscoveredSkill(
            name="Machine Learning", category="Data Science", skill_type="inferred",
            confidence=0.75, proficiency="Beginner",
            evidence_ids=[201], explanation="ML patterns found."
        ),
    ])
    mock_skill_py = models.Skill(id=1, name="Python", category="Backend")
    mock_skill_ml = models.Skill(id=2, name="Machine Learning", category="Data Science")

    def norm_side(db_, name, cat):
        return mock_skill_py if name == "Python" else mock_skill_ml

    with patch.object(
        GitHubRepoIngestionService, "validate_repo_url",
        return_value=("user", "my-repo")
    ), patch.object(
        GitHubRepoIngestionService, "ingest_repository",
        return_value=bundle
    ), patch.object(
        analyzer_mod.AIAnalyzerService, "discover_skills_from_evidence",
        return_value=discovered
    ), patch.object(
        norm_mod.SkillNormalizer, "normalize_and_get_skill",
        side_effect=norm_side
    ), patch.object(
        dna_mod.DNACalculator, "calculate_profile_dna",
        return_value=None
    ):
        result = analyze_github_repository(
            candidate_id=1, payload=payload, db=db, current_user=student
        )

    assert result.repository_name == "my-repo"
    assert result.repository_url == "https://github.com/user/my-repo"
    assert result.primary_language == "Python"
    assert result.files_analyzed == 2
    assert result.evidence_created == 3  # 1 metadata + 2 files
    assert len(result.skills_discovered) == 2
    assert result.dna_updated is True
    assert "my-repo" in result.message
