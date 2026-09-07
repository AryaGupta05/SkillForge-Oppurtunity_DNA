from typing import List, Tuple
from backend.app.models import models

# Configurable/versioned policy data for PMIS Eligibility Rules
# Source: https://pminternship.mca.gov.in/
# Verification Date: 2026-08-21
PMIS_POLICY_VERSION = "2024.10"
PMIS_POLICY_SOURCE = "https://pminternship.mca.gov.in/"
PMIS_POLICY_VERIFICATION_DATE = "2026-08-21"

PMIS_ELIGIBILITY_POLICY = {
    "age": {
        "min_inclusive": 21,
        "max_inclusive": 24,
        "description": "Candidate must be aged between 21 and 24 years."
    },
    "family_income": {
        "max_exclusive": 800000.0,
        "description": "Annual family income of parents/spouse must not exceed Rs. 8 Lakh."
    },
    "government_employment": {
        "allowed": False,
        "description": "No family member (self, parents, spouse) must be a regular/permanent government employee."
    },
    "institutions": {
        "elite_allowed": False,
        "description": "Graduates from elite institutes (IITs, IIMs, IISERs, NITs, IIITs, NLUs, NIDs, NIFTs, etc.) are excluded."
    },
    "qualifications": {
        "excluded_degrees": [
            "CA", "CS", "CMA", "MBA", "PHD", "MD", "MS", "MBBS", "BDS"
        ],
        "description": "Candidates with professional or higher degrees (CA, CS, CMA, MBA, PhD, MD, MS, MBBS, BDS) are excluded."
    },
    "status": {
        "allow_full_time_student": False,
        "allow_full_time_employed": False,
        "allow_prior_nats_naps": False,
        "description": "Candidates must not be in full-time education, full-time employment, or have completed NATS/NAPS training."
    }
}

class PMISEligibilityEngine:
    @staticmethod
    def precheck_candidate(candidate: models.Candidate) -> Tuple[bool, List[str], List[str]]:
        """
        Runs the PMIS eligibility pre-check rules on a Candidate.
        Returns:
            Tuple[eligible: bool, passed_checks: List[str], failed_checks: List[str]]
        """
        passed = []
        failed = []
        
        # 1. Age check
        age_config = PMIS_ELIGIBILITY_POLICY["age"]
        if candidate.age is not None:
            if age_config["min_inclusive"] <= candidate.age <= age_config["max_inclusive"]:
                passed.append(f"Age Check Passed: Candidate is {candidate.age} years old (required: {age_config['min_inclusive']}-{age_config['max_inclusive']}).")
            else:
                failed.append(f"Age Check Failed: Candidate is {candidate.age} years old (required: {age_config['min_inclusive']}-{age_config['max_inclusive']}).")
        else:
            failed.append("Age Check Failed: Age information is missing from student profile.")

        # 2. Family Income check
        income_config = PMIS_ELIGIBILITY_POLICY["family_income"]
        income = candidate.family_income if candidate.family_income is not None else 0.0
        if income <= income_config["max_exclusive"]:
            passed.append(f"Family Income Check Passed: Annual family income is Rs. {income:,.2f} (limit: Rs. {income_config['max_exclusive']:,.2f}).")
        else:
            failed.append(f"Family Income Check Failed: Annual family income is Rs. {income:,.2f} (exceeds limit of Rs. {income_config['max_exclusive']:,.2f}).")

        # 3. Government Employment check
        is_govt = candidate.is_family_govt_employee if candidate.is_family_govt_employee is not None else False
        if not is_govt:
            passed.append("Government Employment Check Passed: No family member is a permanent government employee.")
        else:
            failed.append("Government Employment Check Failed: A family member is a regular/permanent government employee.")

        # 4. Elite Institution check
        is_elite = candidate.institution_is_elite if candidate.institution_is_elite is not None else False
        if not is_elite:
            passed.append("Institution Pedigree Check Passed: Student is not a graduate of a premier/elite institution (e.g. IIT, IIM, IISER).")
        else:
            failed.append("Institution Pedigree Check Failed: Graduates of premier/elite institutions (e.g. IIT, IIM, IISER) are excluded.")

        # 5. Professional Degrees check
        deg_config = PMIS_ELIGIBILITY_POLICY["qualifications"]
        degree = candidate.highest_degree.upper().strip() if candidate.highest_degree else ""
        is_excluded = any(ex_deg in degree for ex_deg in deg_config["excluded_degrees"]) if degree else False
        if not is_excluded:
            passed.append(f"Degree Qualification Check Passed: Highest degree is {candidate.highest_degree or 'Not Specified'} (no professional CA/CS/MBA/PhD exclusion).")
        else:
            failed.append(f"Degree Qualification Check Failed: Candidate holds a professional degree ({candidate.highest_degree}) which is excluded.")

        # 6. Active Student/Employed/Apprenticeship check
        is_ft_student = candidate.is_full_time_student if candidate.is_full_time_student is not None else False
        is_ft_employed = candidate.is_full_time_employed if candidate.is_full_time_employed is not None else False
        has_prior_nats = candidate.has_prior_nats_naps if candidate.has_prior_nats_naps is not None else False
        
        status_failures = []
        if is_ft_student:
            status_failures.append("Candidate is enrolled in full-time education")
        if is_ft_employed:
            status_failures.append("Candidate is in full-time employment")
        if has_prior_nats:
            status_failures.append("Candidate has already completed NATS/NAPS training")
            
        if not status_failures:
            passed.append("Employment & Educational Status Check Passed: Candidate is not in full-time education, full-time employment, or a prior apprentice.")
        else:
            failed.append(f"Employment & Educational Status Check Failed: {', '.join(status_failures)}.")

        eligible = len(failed) == 0
        return eligible, passed, failed
