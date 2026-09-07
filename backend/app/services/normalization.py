from sqlalchemy.orm import Session
from backend.app.models import models

NORMALIZATION_MAP = {
    # Programming Languages
    "py": "Python",
    "python": "Python",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "golang": "Go",
    "go lang": "Go",
    "go": "Go",
    "cpp": "C++",
    "c plus plus": "C++",
    "c#": "C#",
    "c sharp": "C#",
    "rb": "Ruby",
    "ruby": "Ruby",
    "java": "Java",
    "rust": "Rust",
    
    # Frameworks & Libraries
    "react": "React",
    "reactjs": "React",
    "react js": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "angular": "Angular",
    "angularjs": "Angular",
    "next": "Next.js",
    "nextjs": "Next.js",
    "fastapi": "FastAPI",
    "fast api": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "express": "Express.js",
    "expressjs": "Express.js",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    
    # Cloud & DevOps
    "docker": "Docker",
    "containerization": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "GCP",
    "google cloud": "GCP",
    "azure": "Azure",
    "cicd": "CI/CD",
    "ci/cd": "CI/CD",
    "jenkins": "Jenkins",
    "terraform": "Terraform",
    
    # Databases
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "sql": "SQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "sqlite": "SQLite",
    "dynamodb": "DynamoDB",
    
    # Data Science & AI
    "ml": "Machine Learning",
    "machinelearning": "Machine Learning",
    "machine learning": "Machine Learning",
    "machine learning (ml)": "Machine Learning",
    "ai": "Machine Learning",
    "artificial intelligence": "Machine Learning",
    "applied ai": "Machine Learning",
    "applied artificial intelligence": "Machine Learning",
    "applied machine learning": "Machine Learning",
    "ai/ml": "Machine Learning",
    "ml/ai": "Machine Learning",
    "transfer learning": "Machine Learning",
    "model training": "Machine Learning",
    "dl": "Deep Learning",
    "deep learning": "Deep Learning",
    "nlp": "Natural Language Processing (NLP)",
    "natural language processing": "Natural Language Processing (NLP)",
    "natural language processing (nlp)": "Natural Language Processing (NLP)",
    "cv": "Computer Vision",
    "computer vision": "Computer Vision",
    "image classification": "Computer Vision",
    "tensorflow": "TensorFlow",
    "tensorflow / keras": "TensorFlow",
    "tensorflow/keras": "TensorFlow",
    "keras": "TensorFlow",
    "pytorch": "PyTorch",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "rag": "Generative AI",
    "retrieval-augmented generation (rag)": "Generative AI",
    "langchain": "Generative AI",
    "large language models": "Generative AI",
    "llm": "Generative AI",
    
    # Systems & Tools
    "git": "Git",
    "github": "Git",
    "linux": "Linux",
    "bash": "Bash",
    "graphql": "GraphQL",
    "rest": "REST APIs",
    "restful": "REST APIs",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs",
    "restful api development": "REST APIs",
    "java / java servlets": "Java",
    "servlets": "Java",
    "html": "HTML/CSS",
    "css": "HTML/CSS",
    "html/css": "HTML/CSS",
    "frontend development": "HTML/CSS",
    "frontend development (html/css/js)": "HTML/CSS",
}

class SkillNormalizer:
    @staticmethod
    def normalize_name(name: str) -> str:
        """
        Cleans and standardizes skill names using a deterministic dictionary.
        Falls back to Title Case if not found.
        """
        cleaned = name.strip().lower()
        if cleaned in NORMALIZATION_MAP:
            return NORMALIZATION_MAP[cleaned]
        
        # Simple heuristics for common styling
        if cleaned == "sql":
            return "SQL"
        if cleaned == "nosql":
            return "NoSQL"
        if cleaned == "api":
            return "API"
            
        # Fallback to standard capitalization
        return name.strip().title()

    @staticmethod
    def normalize_and_get_skill(db: Session, name: str, category: str = "Technical") -> models.Skill:
        """
        Finds or creates a Skill catalog item using the normalized name, 
        ensuring candidates and jobs share standard IDs.
        """
        normalized_name = SkillNormalizer.normalize_name(name)
        
        # Look up by exact name
        skill = db.query(models.Skill).filter(models.Skill.name == normalized_name).first()
        if not skill:
            # Create a new catalog entry
            skill = models.Skill(
                name=normalized_name,
                category=category,
                description=f"Standardized competency representation for {normalized_name}."
            )
            db.add(skill)
            db.commit()
            db.refresh(skill)
            
        return skill
