from typing import List, Dict, Any
from backend.app.schemas import schemas

# Curated catalog of upskilling resources mapped to standard tech skills
SKILL_RESOURCES_CATALOG: Dict[str, List[Dict[str, Any]]] = {
    "python": [
        {
            "type": "course",
            "title": "Python for Everybody Specialization",
            "provider": "University of Michigan (Coursera)",
            "link_url": "https://www.coursera.org/specializations/python",
            "estimated_hours": 40
        },
        {
            "type": "certificate",
            "title": "Google IT Automation with Python Professional Certificate",
            "provider": "Google (Coursera)",
            "link_url": "https://www.coursera.org/professional-certificates/google-it-automation",
            "estimated_hours": 80
        },
        {
            "type": "project",
            "title": "Build and Deploy a REST API using FastAPI and SQLite",
            "provider": "Opportunity DNA Project Hub",
            "link_url": "https://fastapi.tiangolo.com/tutorial/",
            "estimated_hours": 15
        }
    ],
    "docker": [
        {
            "type": "course",
            "title": "Docker for Beginners",
            "provider": "Docker Official / KodeKloud",
            "link_url": "https://kodekloud.com/courses/docker-for-beginners/",
            "estimated_hours": 12
        },
        {
            "type": "project",
            "title": "Containerize a React-FastAPI Multi-Service Application",
            "provider": "Opportunity DNA Project Hub",
            "link_url": "https://docs.docker.com/get-started/",
            "estimated_hours": 10
        }
    ],
    "aws": [
        {
            "type": "course",
            "title": "AWS Cloud Practitioner Essentials",
            "provider": "AWS Training & Certification",
            "link_url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
            "estimated_hours": 6
        },
        {
            "type": "certificate",
            "title": "AWS Certified Cloud Practitioner",
            "provider": "Amazon Web Services",
            "link_url": "https://aws.amazon.com/certification/certified-cloud-practitioner/",
            "estimated_hours": 30
        },
        {
            "type": "project",
            "title": "Deploy a Serverless Web Application on AWS Lambda and S3",
            "provider": "AWS Architecture Center",
            "link_url": "https://aws.amazon.com/getting-started/hands-on/",
            "estimated_hours": 12
        }
    ],
    "react": [
        {
            "type": "course",
            "title": "Full Stack Open - Deep Dive Into Modern Web Development",
            "provider": "University of Helsinki",
            "link_url": "https://fullstackopen.com/en/",
            "estimated_hours": 60
        },
        {
            "type": "certificate",
            "title": "Meta Front-End Developer Professional Certificate",
            "provider": "Meta (Coursera)",
            "link_url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
            "estimated_hours": 120
        },
        {
            "type": "project",
            "title": "Build a Responsive Internship Applications Tracking Dashboard",
            "provider": "React Documentation tutorial",
            "link_url": "https://react.dev/learn",
            "estimated_hours": 20
        }
    ],
    "kubernetes": [
        {
            "type": "course",
            "title": "Kubernetes for Beginners",
            "provider": "KodeKloud (Udemy)",
            "link_url": "https://www.udemy.com/course/learn-kubernetes/",
            "estimated_hours": 10
        },
        {
            "type": "certificate",
            "title": "Certified Kubernetes Application Developer (CKAD)",
            "provider": "The Linux Foundation",
            "link_url": "https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/",
            "estimated_hours": 60
        }
    ],
    "sql": [
        {
            "type": "course",
            "title": "Introduction to Structured Query Language (SQL)",
            "provider": "University of Michigan (Coursera)",
            "link_url": "https://www.coursera.org/learn/intro-sql",
            "estimated_hours": 16
        },
        {
            "type": "project",
            "title": "Relational Database Schema Design for an E-Commerce Portal",
            "provider": "Opportunity DNA Project Hub",
            "link_url": "https://www.sqlite.org/index.html",
            "estimated_hours": 8
        }
    ]
}

class RoadmapGenerator:
    @staticmethod
    def get_generic_resources(skill_name: str) -> List[Dict[str, Any]]:
        """
        Fallback generator for skills not in the predefined catalog.
        """
        formatted_name = skill_name.strip()
        return [
            {
                "type": "course",
                "title": f"Introduction to {formatted_name} Fundamentals",
                "provider": "Coursera or EdX open catalog",
                "link_url": f"https://www.coursera.org/search?query={formatted_name}",
                "estimated_hours": 15
            },
            {
                "type": "project",
                "title": f"Build a Portfolio Project demonstrating {formatted_name}",
                "provider": "GitHub Community Templates",
                "link_url": "https://github.com/",
                "estimated_hours": 12
            }
        ]

    @classmethod
    def generate_roadmap(cls, missing_skills: List[str]) -> List[schemas.SkillGapRoadmap]:
        """
        Creates personalized roadmap milestones based on missing skill lists.
        """
        roadmaps = []
        for skill in missing_skills:
            key = skill.lower().strip()
            # Try matching catalog key
            resources_data = SKILL_RESOURCES_CATALOG.get(key)
            if not resources_data:
                # Fuzzy match catalog keys
                for cat_key, res_list in SKILL_RESOURCES_CATALOG.items():
                    if cat_key in key or key in cat_key:
                        resources_data = res_list
                        break
            
            if not resources_data:
                resources_data = cls.get_generic_resources(skill)
                
            resources = [
                schemas.UpskillingResource(
                    type=res["type"],
                    title=res["title"],
                    provider=res["provider"],
                    link_url=res["link_url"],
                    estimated_hours=res["estimated_hours"]
                )
                for res in resources_data
            ]
            
            roadmaps.append(
                schemas.SkillGapRoadmap(
                    skill_name=skill,
                    gap_severity="Critical",  # Required skills are critical gaps
                    resources=resources
                )
            )
            
        return roadmaps
