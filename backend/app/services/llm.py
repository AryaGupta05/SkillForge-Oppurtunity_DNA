from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import json
import time
import logging
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# --- CUSTOM EXCEPTION CLASSES ---
class InvalidAPIKeyError(ValueError):
    """Raised when the API key is missing, unauthorized, or invalid."""
    pass

class ModelNotFoundError(ValueError):
    """Raised when the requested model is not found/supported in the project."""
    pass

class QuotaExhaustedError(RuntimeError):
    """Raised when the API quota/rate limits are exceeded (429)."""
    pass

class MalformedStructuredOutputError(ValueError):
    """Raised when the LLM outputs invalid JSON or fails schema constraints."""
    pass


class BaseLLMService(ABC):
    @abstractmethod
    def generate_json(self, prompt: str, response_schema: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates a validated JSON output from the LLM based on the prompt.
        """
        pass


class GeminiService(BaseLLMService):
    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.model = None
        
        if not api_key:
            logger.error("Gemini API key is completely empty.")
            return

        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            
            # Verify if the model is available for the configured API project
            try:
                available_models = [m.name for m in genai.list_models()]
                # SDK uses full name structure like "models/gemini-1.5-flash"
                full_model_name = model_name if model_name.startswith("models/") else f"models/{model_name}"
                
                # Check match against full name or base name
                if full_model_name not in available_models and model_name not in available_models:
                    logger.warning(
                        f"Model '{model_name}' was not found in the list of available models for this project. "
                        f"Available models: {available_models}. Attempting to load model anyway."
                    )
            except Exception as list_err:
                logger.warning(f"Could not verify available Gemini models via API: {list_err}")
                
            self.model = genai.GenerativeModel(model_name)
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client library: {e}")
            self.model = None

    def _clean_json_markdown(self, content: str) -> str:
        content = content.strip()
        if content.startswith("```"):
            lines = content.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()
        return content

    def _get_clean_gemini_schema(self, response_schema: Any) -> Optional[Dict[str, Any]]:
        if not response_schema:
            return None
        cls_name = response_schema.__name__ if hasattr(response_schema, "__name__") else str(response_schema)
        
        if cls_name == "AIExtractedEvidenceList":
            return {
                "type": "OBJECT",
                "properties": {
                    "evidence_items": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "type": { "type": "STRING" },
                                "title": { "type": "STRING" },
                                "description": { "type": "STRING" },
                                "source": { "type": "STRING" },
                                "source_url": { "type": "STRING" },
                                "date": { "type": "STRING" },
                                "supporting_text": { "type": "STRING" },
                                "confidence": { "type": "NUMBER" }
                            },
                            "required": ["type", "title", "supporting_text"]
                        }
                    }
                },
                "required": ["evidence_items"]
            }
        elif cls_name == "AIDiscoveredSkillList":
            return {
                "type": "OBJECT",
                "properties": {
                    "skills": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "name": { "type": "STRING" },
                                "category": { "type": "STRING" },
                                "skill_type": { "type": "STRING" },
                                "confidence": { "type": "NUMBER" },
                                "proficiency": { "type": "STRING" },
                                "evidence_ids": { 
                                    "type": "ARRAY", 
                                    "items": { "type": "INTEGER" } 
                                },
                                "explanation": { "type": "STRING" }
                            },
                            "required": ["name", "category", "skill_type", "confidence", "evidence_ids", "explanation"]
                        }
                    }
                },
                "required": ["skills"]
            }
        elif cls_name == "AIExtractedJobSkillList":
            return {
                "type": "OBJECT",
                "properties": {
                    "skills": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "name": { "type": "STRING" },
                                "category": { "type": "STRING" },
                                "importance": { "type": "NUMBER" },
                                "required_level": { "type": "STRING" },
                                "requirement_type": { "type": "STRING" },
                                "evidence_expectation": { "type": "STRING" }
                            },
                            "required": ["name", "category", "importance", "requirement_type"]
                        }
                    }
                },
                "required": ["skills"]
            }
        return None

    def generate_json(self, prompt: str, response_schema: Optional[Any] = None) -> Dict[str, Any]:
        if not self.api_key:
            raise InvalidAPIKeyError("Gemini API key is missing. Please set GEMINI_API_KEY in the backend/.env file.")
        if not self.model:
            raise ModelNotFoundError("Gemini model could not be loaded. Please check API key authorization and model name configurations.")
        
        # Bounded exponential backoff configuration for HTTP 429 quota errors
        backoff_delay = 2.0
        max_retries = 3
        
        for attempt in range(max_retries + 1):
            try:
                import google.generativeai as genai
                generation_config = genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
                
                clean_schema = self._get_clean_gemini_schema(response_schema)
                if clean_schema:
                    generation_config.response_schema = clean_schema
                    
                response = self.model.generate_content(
                    prompt,
                    generation_config=generation_config
                )
                content = response.text
                cleaned = self._clean_json_markdown(content)
                return json.loads(cleaned)
            except Exception as e:
                err_msg = str(e)
                status_code = getattr(e, "code", None)
                
                # Check for HTTP 429 / QuotaExhausted / ResourceExhausted conditions
                is_quota_error = (
                    "429" in err_msg 
                    or "quota" in err_msg.lower() 
                    or "resourceexhausted" in err_msg.lower() 
                    or status_code == 429
                )
                
                if is_quota_error:
                    if attempt < max_retries:
                        logger.warning(
                            f"Gemini API rate limit/quota (429) encountered on attempt {attempt + 1}. "
                            f"Retrying with exponential backoff in {backoff_delay}s... Error details: {err_msg}"
                        )
                        time.sleep(backoff_delay)
                        backoff_delay = min(backoff_delay * 2, 10.0) # Bounded to 10s max
                        continue
                    else:
                        logger.error(f"Gemini API rate limit/quota exceeded after {max_retries} backoff retries.")
                        raise QuotaExhaustedError(
                            "Gemini API quota exceeded (HTTP 429). The configured API project has run out of available request credits."
                        )
                
                # Check for model not found conditions
                if "404" in err_msg or "not found" in err_msg.lower() or status_code == 404:
                    logger.error(f"Gemini model not found (404): {e}")
                    raise ModelNotFoundError(
                        f"Gemini model '{self.model_name}' not found or unsupported for generateContent: {err_msg}"
                    )
                
                # Check for unauthorized / invalid key conditions
                if (
                    "403" in err_msg 
                    or "401" in err_msg 
                    or "api key" in err_msg.lower() 
                    or "unauthorized" in err_msg.lower() 
                    or "permissiondenied" in err_msg.lower() 
                    or status_code in (401, 403)
                ):
                    logger.error(f"Gemini API key is invalid or unauthorized: {e}")
                    raise InvalidAPIKeyError(
                        f"Gemini API key verification failed. The provided API key is unauthorized or invalid: {err_msg}"
                    )
                
                # JSON parsing error indicates malformed structured output format
                if isinstance(e, json.JSONDecodeError):
                    logger.error(f"Failed to parse LLM structured output JSON: {e}")
                    raise MalformedStructuredOutputError(f"Malformed JSON returned from LLM: {err_msg}")
                
                # Other generic exception
                logger.error(f"Gemini API service exception: {e}")
                raise RuntimeError(f"Gemini service failed: {err_msg}")


def get_llm_service() -> BaseLLMService:
    """
    Dependency/Factory provider returning the configured LLM client.
    Raises ValueError on execution if credentials are unconfigured.
    """
    provider = settings.LLM_PROVIDER.lower()
    if provider == "gemini":
        return GeminiService(
            api_key=settings.GEMINI_API_KEY or "",
            model_name=settings.GEMINI_MODEL or "gemini-1.5-flash"
        )
    else:
        raise ValueError(
            f"Only Gemini LLM provider is supported in this deployment. "
            f"Configured LLM_PROVIDER: {settings.LLM_PROVIDER}"
        )
