import pytest
import datetime
import fitz  # PyMuPDF
from unittest.mock import MagicMock
from pydantic import ValidationError

from backend.app.services.pdf import PDFService
from backend.app.services.dna import DNACalculator
from backend.app.services.analyzer import AIAnalyzerService
from backend.app.models import models
from backend.app.schemas import schemas

# --- FIXTURE: GENERATE REAL PDF BINARY DATA ---
@pytest.fixture
def sample_pdf_bytes():
    """
    Generates a valid PDF in memory containing structured text 
    using PyMuPDF to act as a test resume fixture.
    """
    doc = fitz.open()
    page = doc.new_page()
    rect = fitz.Rect(50, 50, 550, 750)
    resume_text = """
    Sarah Jenkins
    Email: sarah.jenkins@example.org
    Location: Seattle, WA
    
    [TEST_DATA_FIXTURE_LABEL]
    
    WORK EXPERIENCE:
    Software Developer at TechScale Corp (2022-01 to 2023-12)
    - Built backend microservices using Python, FastAPI, and PostgreSQL.
    - Containerized applications using Docker.
    
    EDUCATION:
    Bachelor of Science in Computer Science, Northwest University (2018 to 2021)
    
    PROJECTS:
    Machine Learning Image Classifier (2023)
    - Deployed MobileNetV2 image classification logic.
    """
    page.insert_textbox(rect, resume_text)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


# --- 1. PDF EXTRACTION TESTS ---
def test_pdf_text_extraction(sample_pdf_bytes):
    text = PDFService.extract_text_from_bytes(sample_pdf_bytes)
    assert "Sarah Jenkins" in text
    assert "TechScale Corp" in text
    assert "[TEST_DATA_FIXTURE_LABEL]" in text

def test_empty_or_invalid_pdf():
    # Empty PDF bytes
    with pytest.raises(ValueError, match="file is empty"):
        PDFService.extract_text_from_bytes(b"")

    # Corrupt PDF bytes
    with pytest.raises(ValueError, match="Failed to parse PDF"):
        PDFService.extract_text_from_bytes(b"corrupted pdf file content header")


# --- 2. SCHEMA VALIDATION TESTS ---
def test_evidence_schema_validation():
    valid_data = {
        "type": "project",
        "title": "Opportunity DNA",
        "description": "Skills matching app",
        "source": "Resume",
        "date": "2026-08",
        "supporting_text": "Implemented backend matching logic",
        "confidence": 0.95
    }
    item = schemas.AIExtractedEvidenceItem.model_validate(valid_data)
    assert item.title == "Opportunity DNA"
    assert item.confidence == 0.95

    # Missing required supporting_text
    invalid_data = {
        "type": "project",
        "title": "Opportunity DNA"
    }
    with pytest.raises(ValidationError):
        schemas.AIExtractedEvidenceItem.model_validate(invalid_data)


def test_skill_schema_validation():
    valid_skill = {
        "name": "Docker Containerization",
        "category": "DevOps",
        "skill_type": "inferred",
        "confidence": 0.90,
        "proficiency": "Expert",
        "evidence_ids": [12, 15],
        "explanation": "Demonstrated deployment configurations"
    }
    skill = schemas.AIDiscoveredSkill.model_validate(valid_skill)
    assert skill.name == "Docker Containerization"
    assert skill.evidence_ids == [12, 15]


# --- 3. DNA SIGNAL CALCULATION TESTS ---
def test_dna_progression_calculation():
    # Create candidate with chronological evidence spanning 3 years
    cand = models.Candidate(
        id=99,
        name="Sarah Jenkins",
        email="sarah@test.org"
    )
    ev1 = models.Evidence(
        id=1,
        candidate_id=99,
        type="education",
        title="BSc Computer Science",
        source="Resume",
        date=datetime.datetime(2021, 5, 1)
    )
    ev2 = models.Evidence(
        id=2,
        candidate_id=99,
        type="experience",
        title="Developer",
        source="Resume",
        date=datetime.datetime(2023, 10, 1)
    )
    cand.evidence = [ev1, ev2]

    # Create dummy session
    db_mock = MagicMock()

    signals = DNACalculator.calculate_profile_dna(cand, db_mock)
    assert signals.learning_progression.status == "sufficient_evidence"
    assert signals.learning_progression.timeline == [2021, 2023]
    assert signals.learning_progression.score > 0.0


def test_missing_dates_progression():
    cand = models.Candidate(
        id=99,
        name="Sarah Jenkins",
        email="sarah@test.org"
    )
    # Evidence without dates
    ev1 = models.Evidence(
        id=1,
        candidate_id=99,
        type="project",
        title="React App",
        source="Resume",
        date=None
    )
    cand.evidence = [ev1]

    db_mock = MagicMock()
    signals = DNACalculator.calculate_profile_dna(cand, db_mock)
    assert signals.learning_progression.status == "insufficient_evidence"
    assert signals.learning_progression.score == 0.0
    assert "Timeline dates are missing" in signals.learning_progression.description


# --- 4. LLM PARSING RETRY AND MALFORMED JSON RECOVERY ---
def test_malformed_ai_output_retry(monkeypatch):
    class MockLLMService:
        def __init__(self):
            self.calls = 0

        def generate_json(self, prompt, response_schema=None):
            self.calls += 1
            if self.calls == 1:
                # Malformed output (missing required fields 'supporting_text')
                return {
                    "evidence_items": [
                        {
                            "type": "project",
                            "title": "Failing Mock Project",
                            "confidence": 0.8
                        }
                    ]
                }
            else:
                # Valid output
                return {
                    "evidence_items": [
                        {
                            "type": "project",
                            "title": "Recovered Project",
                            "description": "Successfully parsed",
                            "source": "Resume",
                            "supporting_text": "Sarah Jenkins resume project details",
                            "confidence": 0.95
                        }
                    ]
                }

    mock_llm = MockLLMService()
    monkeypatch.setattr("backend.app.services.analyzer.get_llm_service", lambda: mock_llm)

    extracted = AIAnalyzerService.extract_evidence_from_resume("Raw resume text...")
    assert len(extracted.evidence_items) == 1
    assert extracted.evidence_items[0].title == "Recovered Project"
    # Asserts that LLM was called twice due to the retry loop recovering from validation error
    assert mock_llm.calls == 2
