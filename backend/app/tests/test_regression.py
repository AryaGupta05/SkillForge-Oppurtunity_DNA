import pytest
from unittest.mock import MagicMock
from pydantic import ValidationError

from backend.app.services.analyzer import AIAnalyzerService
from backend.app.schemas import schemas

# --- REGRESSION TESTS FOR PIPELINE NORMALIZATION & RECOVERY ---

def test_evidence_root_key_and_fields_normalization(monkeypatch):
    """
    Verifies that the parser successfully handles alternative root keys ("evidence" instead of "evidence_items"),
    alternative field names ("snippet" instead of "supporting_text"), missing source fields, and markdown blocks.
    """
    class MockLLMService:
        def generate_json(self, prompt, response_schema=None):
            # This mock returns the exact structure described in the user's report:
            # - Root key is "evidence"
            # - Snippet key is "supporting_text"
            # - Missing "source" field
            return {
                "evidence": [
                    {
                        "type": "project",
                        "title": "Flower Classification",
                        "description": "Built an image classification model using MobileNetV2",
                        "source_url": None,
                        "date": None,
                        "supporting_text": "Built a flower classification model...",
                        "confidence": 0.92
                    }
                ]
            }

    monkeypatch.setattr("backend.app.services.analyzer.get_llm_service", lambda: MockLLMService())

    # Should normalize and validate without throwing ValidationError
    extracted = AIAnalyzerService.extract_evidence_from_resume("Sample resume text...")
    
    assert len(extracted.evidence_items) == 1
    item = extracted.evidence_items[0]
    assert item.title == "Flower Classification"
    assert item.supporting_text == "Built a flower classification model..."
    assert item.source == "Resume"  # Automatically defaulted by Pydantic default value!
    assert item.confidence == 0.92


def test_markdown_code_fences_cleaning():
    """
    Verifies that markdown code blocks and whitespace are successfully cleaned from response text.
    """
    from backend.app.services.llm import GeminiService
    
    raw_response = """
```json
{
  "key": "value"
}
```
"""
    gemini_srv = GeminiService(api_key="mock_key")
    
    cleaned_gemini = gemini_srv._clean_json_markdown(raw_response)
    
    assert cleaned_gemini == '{\n  "key": "value"\n}'


def test_skills_discovery_fields_normalization(monkeypatch):
    """
    Verifies that skill discovery normalizes alternative naming conventions for evidence lists.
    """
    class MockLLMService:
        def generate_json(self, prompt, response_schema=None):
            return {
                "skills": [
                    {
                        "name": "Full-stack integration",
                        "category": "Backend",
                        "skill_type": "adjacent",
                        "confidence": 0.9,
                        "proficiency": "Expert",
                        "evidence_id": 42, # Alternative key name as integer instead of evidence_ids list
                        "explanation": "Docker + React integration"
                    }
                ]
            }

    monkeypatch.setattr("backend.app.services.analyzer.get_llm_service", lambda: MockLLMService())

    mock_ev = MagicMock()
    mock_ev.id = 42
    mock_ev.type = "project"
    mock_ev.title = "Test"
    mock_ev.description = "Test description"
    mock_ev.date = None
    mock_ev.raw_content = "Some raw content"
    
    # Should normalize evidence_id (int) -> evidence_ids (list of int)
    discovered = AIAnalyzerService.discover_skills_from_evidence([mock_ev])
    
    assert len(discovered.skills) == 1
    skill = discovered.skills[0]
    assert skill.name == "Full-stack integration"
    assert skill.evidence_ids == [42]


@pytest.mark.anyio
async def test_resume_upload_atomic_rollback(monkeypatch):
    """
    Verifies that if LLM parsing throws an exception during resume upload,
    the entire transaction is rolled back, meaning the raw resume is NOT saved.
    """
    from backend.app.api.router import upload_resume_pdf
    from fastapi import UploadFile, HTTPException
    from sqlalchemy.orm import Session
    
    # 1. Mock DB session
    db = MagicMock(spec=Session)
    
    commit_calls = 0
    rollback_calls = 0
    
    def mock_commit():
        nonlocal commit_calls
        commit_calls += 1
        
    def mock_rollback():
        nonlocal rollback_calls
        rollback_calls += 1
        
    db.commit = mock_commit
    db.rollback = mock_rollback
    
    # 2. Mock Candidate query
    candidate_mock = MagicMock()
    candidate_mock.id = 1
    db.query().filter().first.return_value = candidate_mock
    
    # 3. Mock file upload
    mock_file = MagicMock(spec=UploadFile)
    mock_file.filename = "test.pdf"
    mock_file.read.return_value = b"mock pdf bytes"
    
    # 4. Mock PDF text extraction
    monkeypatch.setattr("backend.app.services.pdf.PDFService.extract_text_from_bytes", lambda x: "Extracted Text")
    
    # 5. Mock LLM service to raise an exception
    class MockLLMFailingService:
        @staticmethod
        def extract_evidence_from_resume(text):
            raise RuntimeError("Simulated LLM Extraction Failure")
            
    monkeypatch.setattr("backend.app.services.analyzer.AIAnalyzerService", MockLLMFailingService)
    
    # 6. Call upload_resume_pdf and assert it raises HTTPException
    with pytest.raises(HTTPException) as exc_info:
        await upload_resume_pdf(candidate_id=1, file=mock_file, db=db)
        
    # Assertions
    assert exc_info.value.status_code == 500
    assert "Failed to process PDF resume" in exc_info.value.detail
    
    # Assert database commit was never called (since LLM failed) and rollback was called
    assert commit_calls == 0
    assert rollback_calls == 1
