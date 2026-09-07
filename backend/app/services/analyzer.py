import json
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from pydantic import ValidationError

from backend.app.services.llm import get_llm_service, InvalidAPIKeyError, ModelNotFoundError, QuotaExhaustedError
from backend.app.models import models
from backend.app.schemas import schemas

logger = logging.getLogger(__name__)

class AIAnalyzerService:
    @staticmethod
    def extract_evidence_from_resume(resume_text: str) -> schemas.AIExtractedEvidenceList:
        """
        Uses LLM provider to extract structured evidence items from raw resume text.
        Retries up to 3 times if output fails Pydantic schema validation.
        """
        llm = get_llm_service()
        
        prompt = f"""
        Extract structured evidence items from the candidate's resume text below.
        Identify:
        - Work experiences and internships
        - Projects and portfolios
        - Certifications
        - Hackathons and achievements
        - Education profiles
        
        For each item, extract the exact supporting text snippet from the resume.
        Estimate a confidence score between 0.0 and 1.0 based on details provided.
        Do not invent/hallucinate any records. If no items match, return an empty list.

        Output MUST be a JSON object matching this schema:
        {{
          "evidence_items": [
            {{
              "type": "project" | "experience" | "internship" | "certification" | "hackathon" | "education" | "technical_achievement",
              "title": "Short title identifying the item",
              "description": "One or two sentences summarizing the work/achievement",
              "source": "Resume",
              "source_url": null,
              "date": "YYYY-MM" or "YYYY" format (if extractable, else null),
              "supporting_text": "Exact text sentence or paragraph from the resume backing this item",
              "confidence": 0.0 to 1.0
            }}
          ]
        }}

        Resume Text:
        ---
        {resume_text}
        ---
        """
        
        error_context = ""
        for attempt in range(3):
            try:
                run_prompt = prompt + error_context
                result_dict = llm.generate_json(run_prompt, response_schema=schemas.AIExtractedEvidenceList)
                
                # --- ROOT KEY NORMALIZATION ---
                if not isinstance(result_dict, dict):
                    result_dict = {}
                if "evidence" in result_dict and "evidence_items" not in result_dict:
                    result_dict["evidence_items"] = result_dict["evidence"]
                if "evidence_items" not in result_dict:
                    result_dict["evidence_items"] = []
                    
                # --- FIELD NORMALIZATION ---
                for item in result_dict["evidence_items"]:
                    if not isinstance(item, dict):
                        continue
                    # Normalize alternative supporting_text naming keys
                    for alt_key in ["supporting_evidence", "text", "snippet", "supportingText"]:
                        if alt_key in item and "supporting_text" not in item:
                            item["supporting_text"] = item[alt_key]
                    # Default source
                    if "source" not in item:
                        item["source"] = "Resume"
                        
                # Validate using Pydantic
                validated = schemas.AIExtractedEvidenceList.model_validate(result_dict)
                return validated
            except ValidationError as ve:
                logger.warning(f"Validation failed on attempt {attempt + 1}: {ve}")
                error_context = f"\n\nCorrection required: Your previous response failed Pydantic validation with error: {str(ve)}. Please output valid JSON strictly matching the schema."
            except (InvalidAPIKeyError, ModelNotFoundError, QuotaExhaustedError) as fatal_err:
                logger.error(f"Fatal LLM error encountered: {fatal_err}")
                raise fatal_err
            except Exception as e:
                logger.error(f"LLM extraction error on attempt {attempt + 1}: {e}")
                error_context = f"\n\nCorrection required: An error occurred parsing your response: {str(e)}. Ensure you output valid JSON."
                
        raise RuntimeError("Failed to extract structured evidence after 3 validation retries.")

    @staticmethod
    def discover_skills_from_evidence(evidence_list: List[models.Evidence]) -> schemas.AIDiscoveredSkillList:
        """
        Takes candidate's database evidence records, analyzes them via the LLM, 
        and discovers explicit, inferred, and adjacent skills.
        Retries up to 3 times if output fails Pydantic schema validation.
        """
        if not evidence_list:
            return schemas.AIDiscoveredSkillList(skills=[])
            
        llm = get_llm_service()
        
        # Serialize evidence with database IDs so LLM can reference them
        evidence_payload = []
        for ev in evidence_list:
            evidence_payload.append({
                "db_id": ev.id,
                "type": ev.type,
                "title": ev.title,
                "description": ev.description or "",
                "date": ev.date.strftime("%Y-%m") if ev.date else "unknown",
                "raw_content": (ev.raw_content or "")[:1200]  # truncate to fit context
            })
            
        evidence_json_str = json.dumps(evidence_payload, indent=2)
        
        prompt = f"""
        Analyze the candidate's evidence items below. 
        Each evidence item contains a unique 'db_id'.
        
        Your task is to identify demonstrated capabilities and output skills:
        1. Explicit skills: Directly stated languages, frameworks, or tools (e.g. Python, TensorFlow, Java, MySQL).
        2. Inferred skills: Foundational technical capabilities demonstrated by the implementations (e.g. neural network training, CNN, classification, or transfer learning directly demonstrate Machine Learning; RAG/LLM pipelines demonstrate Natural Language Processing and Generative AI).
        3. Adjacent skills: Related cross-domain capabilities suggested across multiple pieces of evidence.
        
        Use standard industry skill names (e.g., Machine Learning, Deep Learning, Computer Vision, Natural Language Processing, REST APIs).
        
        For every discovered skill, you MUST link it to the specific 'db_id's of the evidence items that support it.
        Do not create skills that are unsupported by the evidence.
        
        Output MUST be a JSON object matching this schema:
        {{
          "skills": [
            {{
              "name": "Skill Name (e.g., Python, Machine Learning, Computer Vision, Docker)",
              "category": "Frontend" | "Backend" | "DevOps" | "Data Science" | "Database" | "Management" | "Other",
              "skill_type": "explicit" | "inferred" | "adjacent",
              "confidence": 0.0 to 1.0 (degree of confidence in this skill mapping),
              "proficiency": "Beginner" | "Intermediate" | "Expert",
              "evidence_ids": [list of integer db_ids of supporting evidence items],
              "explanation": "Brief explanation showing how the linked evidence items support this skill"
            }}
          ]
        }}

        Candidate Evidence:
        ---
        {evidence_json_str}
        ---
        """
        
        error_context = ""
        for attempt in range(3):
            try:
                run_prompt = prompt + error_context
                result_dict = llm.generate_json(run_prompt, response_schema=schemas.AIDiscoveredSkillList)
                
                # --- ROOT KEY NORMALIZATION ---
                if not isinstance(result_dict, dict):
                    result_dict = {}
                if "skills" not in result_dict:
                    for alt_key in ["skill_items", "discovered_skills", "skills_discovered"]:
                        if alt_key in result_dict:
                            result_dict["skills"] = result_dict[alt_key]
                            break
                if "skills" not in result_dict:
                    result_dict["skills"] = []
                    
                # --- FIELD NORMALIZATION ---
                for skill in result_dict["skills"]:
                    if not isinstance(skill, dict):
                        continue
                    # Map alternative naming for evidence_ids
                    for alt_key in ["evidence_id", "evidence", "supporting_evidence_ids", "evidenceIds"]:
                        if alt_key in skill and "evidence_ids" not in skill:
                            val = skill[alt_key]
                            if isinstance(val, list):
                                skill["evidence_ids"] = val
                            elif isinstance(val, (int, float)):
                                skill["evidence_ids"] = [int(val)]
                            elif isinstance(val, str):
                                try:
                                    skill["evidence_ids"] = [int(x.strip()) for x in val.split(",") if x.strip().isdigit()]
                                except Exception:
                                    skill["evidence_ids"] = []
                    if "evidence_ids" not in skill or not isinstance(skill["evidence_ids"], list):
                        skill["evidence_ids"] = []
                        
                # Validate using Pydantic
                validated = schemas.AIDiscoveredSkillList.model_validate(result_dict)
                return validated
            except ValidationError as ve:
                logger.warning(f"Skill validation failed on attempt {attempt + 1}: {ve}")
                error_context = f"\n\nCorrection required: Your previous response failed Pydantic validation with error: {str(ve)}. Please output valid JSON strictly matching the schema."
            except (InvalidAPIKeyError, ModelNotFoundError, QuotaExhaustedError) as fatal_err:
                logger.error(f"Fatal LLM error encountered: {fatal_err}")
                raise fatal_err
            except Exception as e:
                logger.error(f"LLM skill discovery error on attempt {attempt + 1}: {e}")
                error_context = f"\n\nCorrection required: An error occurred parsing your response: {str(e)}. Ensure you output valid JSON."
                
        raise RuntimeError("Failed to discover skills after 3 validation retries.")
