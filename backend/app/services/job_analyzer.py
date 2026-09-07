import logging
import json
from pydantic import ValidationError

from backend.app.services.llm import get_llm_service, InvalidAPIKeyError, ModelNotFoundError, QuotaExhaustedError
from backend.app.schemas import schemas

logger = logging.getLogger(__name__)

class JobAnalyzerService:
    @staticmethod
    def analyze_job_description(title: str, company: str, description: str) -> schemas.AIExtractedJobSkillList:
        """
        Extracts structured skill requirements and evidence expectations 
        from a raw job description using LLM analysis.
        """
        llm = get_llm_service()
        
        prompt = f"""
You are an expert talent intelligence agent.
Analyze the following job title and description, and extract required and preferred skills.

Job Title: {title} at {company}
Job Description:
{description}

Extract a list of technical, functional, or professional skills mentioned in the text.
Rules:
1. Do not invent requirements that are not reasonably supported by the description.
2. Categorize each skill as "Frontend", "Backend", "DevOps", "Data Science", "Database", "Management", or "Other".
3. Provide a skill importance weight (0.0 to 1.0). Required core skills should be 0.9 to 1.0.
4. Specify the minimum required proficiency level ("Beginner", "Intermediate", or "Expert").
5. Label the skill requirement_type as either "required" or "preferred".
6. Formulate a specific evidence expectation outlining how a candidate can prove this capability.

You MUST return a JSON object conforming exactly to this structure:
{{
  "skills": [
    {{
      "name": "Skill Name",
      "category": "Backend",
      "importance": 1.0,
      "required_level": "Intermediate",
      "requirement_type": "required",
      "evidence_expectation": "Demonstrated projects showing Python and backend API creation"
    }}
  ]
}}
"""
        error_context = ""
        for attempt in range(1, 4):
            try:
                full_prompt = prompt + error_context if attempt > 1 else prompt
                response_data = llm.generate_json(full_prompt, response_schema=schemas.AIExtractedJobSkillList)
                
                if isinstance(response_data, dict):
                    extracted = schemas.AIExtractedJobSkillList.model_validate(response_data)
                else:
                    extracted = response_data
                    
                return extracted
            except (InvalidAPIKeyError, ModelNotFoundError, QuotaExhaustedError) as fatal_err:
                logger.error(f"Fatal LLM error during job analysis: {fatal_err}")
                raise fatal_err
            except (ValidationError, ValueError, json.JSONDecodeError) as e:
                logger.error(f"LLM job analysis error on attempt {attempt}: {str(e)}", exc_info=True)
                error_context = f"\n\n[ATTEMPT {attempt} FAILED]: Your previous JSON output was invalid. Error details: {str(e)}. Please resolve and output valid JSON matching the schema."
                if attempt == 3:
                    raise RuntimeError("Failed to extract structured job requirements after 3 validation retries.")
                    
        raise RuntimeError("Failed to analyze job description.")
