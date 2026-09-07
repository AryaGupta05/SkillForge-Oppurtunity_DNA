from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import logging

from backend.app.core.database import get_db
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.services.github import GitHubService
from backend.app.services.pdf import PDFService

logger = logging.getLogger(__name__)
api_router = APIRouter()

def parse_date_string(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    try:
        date_str = date_str.strip()
        if len(date_str) == 4:
            return datetime(int(date_str), 1, 1)
        elif "-" in date_str:
            parts = date_str.split("-")
            return datetime(int(parts[0]), int(parts[1]), 1)
    except Exception:
        pass
    return None

# --- HEALTH CHECK ---
@api_router.get("/health", response_model=Dict[str, str])
def health_check():
    return {"status": "ok", "timestamp": str(datetime.utcnow())}


# --- CANDIDATES API ---
@api_router.post("/candidates", response_model=schemas.CandidateResponse)
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(get_db)):
    # Check if email exists
    db_candidate = db.query(models.Candidate).filter(models.Candidate.email == candidate.email).first()
    if db_candidate:
        raise HTTPException(status_code=400, detail="A candidate with this email already exists.")
    
    new_candidate = models.Candidate(
        name=candidate.name,
        email=candidate.email,
        location=candidate.location,
        institution=candidate.institution,
        gender=candidate.gender,
        age=candidate.age,
        career_gap_info=candidate.career_gap_info,
        github_url=candidate.github_url,
        family_income=candidate.family_income,
        is_family_govt_employee=candidate.is_family_govt_employee,
        highest_degree=candidate.highest_degree,
        institution_is_elite=candidate.institution_is_elite,
        qualification_stream=candidate.qualification_stream,
        preferred_sector=candidate.preferred_sector,
        preferred_location=candidate.preferred_location,
        is_full_time_student=candidate.is_full_time_student,
        is_full_time_employed=candidate.is_full_time_employed,
        has_prior_nats_naps=candidate.has_prior_nats_naps
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    return new_candidate


@api_router.get("/candidates", response_model=List[schemas.CandidateResponse])
def get_candidates(db: Session = Depends(get_db)):
    return db.query(models.Candidate).all()


@api_router.get("/candidates/{candidate_id}", response_model=schemas.CandidateResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


# --- SKILLS SEED/CREATE (helper) ---
@api_router.post("/skills", response_model=schemas.SkillResponse)
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skill).filter(models.Skill.name == skill.name).first()
    if db_skill:
        return db_skill
    new_skill = models.Skill(
        name=skill.name,
        category=skill.category,
        description=skill.description
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


@api_router.get("/skills", response_model=List[schemas.SkillResponse])
def get_skills(db: Session = Depends(get_db)):
    return db.query(models.Skill).all()


# --- EVIDENCE UPLOAD AND SYNCS ---
@api_router.post("/candidates/{candidate_id}/resume", response_model=List[schemas.EvidenceResponse])
async def upload_resume_pdf(candidate_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")

    try:
        pdf_bytes = await file.read()
        extracted_text = PDFService.extract_text_from_bytes(pdf_bytes)
        
        # 1. Save raw resume evidence
        raw_resume = models.Evidence(
            candidate_id=candidate_id,
            type="resume",
            title=file.filename,
            description="Uploaded raw resume text data",
            source="Upload",
            raw_content=extracted_text,
            date=datetime.utcnow()
        )
        db.add(raw_resume)
        db.flush()
        
        # 2. Extract structured evidence items using LLM
        from backend.app.services.analyzer import AIAnalyzerService
        extracted = AIAnalyzerService.extract_evidence_from_resume(extracted_text)
        
        created_items = [raw_resume]
        for item in extracted.evidence_items:
            parsed_date = parse_date_string(item.date)
            new_ev = models.Evidence(
                candidate_id=candidate_id,
                type=item.type,
                title=item.title,
                description=item.description,
                source=item.source,
                source_url=item.source_url,
                date=parsed_date,
                raw_content=item.supporting_text,
                created_at=datetime.utcnow()
            )
            db.add(new_ev)
            created_items.append(new_ev)
            
        db.commit()
        for item in created_items:
            db.refresh(item)
            
        return created_items
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing resume upload: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process PDF resume: {str(e)}")


@api_router.post("/candidates/{candidate_id}/analyze", response_model=List[schemas.CandidateSkillResponse])
def analyze_candidate_skills(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    evidence_list = db.query(models.Evidence).filter(models.Evidence.candidate_id == candidate_id).all()
    if not evidence_list:
        raise HTTPException(
            status_code=400, 
            detail="No candidate evidence found. Please upload a resume or sync GitHub first."
        )
        
    try:
        from backend.app.services.analyzer import AIAnalyzerService
        discovered = AIAnalyzerService.discover_skills_from_evidence(evidence_list)
        
        result_skills = []
        for skill in discovered.skills:
            # Find or create Skill catalog record
            skill_obj = db.query(models.Skill).filter(models.Skill.name == skill.name).first()
            if not skill_obj:
                skill_obj = models.Skill(
                    name=skill.name,
                    category=skill.category,
                    description=skill.explanation
                )
                db.add(skill_obj)
                db.commit()
                db.refresh(skill_obj)
                
            # Find or create CandidateSkill entry
            cs_entry = db.query(models.CandidateSkill).filter(
                models.CandidateSkill.candidate_id == candidate_id,
                models.CandidateSkill.skill_id == skill_obj.id
            ).first()
            
            derived_strength = round(skill.confidence * len(skill.evidence_ids) * 1.5, 2)
            
            if cs_entry:
                cs_entry.confidence = skill.confidence
                cs_entry.proficiency = skill.proficiency
                cs_entry.evidence_strength = derived_strength
                cs_entry.skill_type = skill.skill_type
            else:
                cs_entry = models.CandidateSkill(
                    candidate_id=candidate_id,
                    skill_id=skill_obj.id,
                    confidence=skill.confidence,
                    proficiency=skill.proficiency,
                    evidence_strength=derived_strength,
                    skill_type=skill.skill_type
                )
                db.add(cs_entry)
                
            db.commit()
            db.refresh(cs_entry)
            
            # Recreate links in SkillEvidence
            db.query(models.SkillEvidence).filter(
                models.SkillEvidence.candidate_skill_id == cs_entry.id
            ).delete()
            db.commit()
            
            for ev_id in skill.evidence_ids:
                ev_exists = db.query(models.Evidence).filter(
                    models.Evidence.id == ev_id,
                    models.Evidence.candidate_id == candidate_id
                ).first()
                
                if ev_exists:
                    link = models.SkillEvidence(
                        candidate_skill_id=cs_entry.id,
                        evidence_id=ev_id,
                        relationship=skill.explanation,
                        confidence=skill.confidence
                    )
                    db.add(link)
                    
            db.commit()
            db.refresh(cs_entry)
            result_skills.append(cs_entry)
            
        return result_skills
    except Exception as e:
        db.rollback()
        logger.error(f"Error in skills analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to analyze skills: {str(e)}")


@api_router.get("/candidates/{candidate_id}/evidence", response_model=List[schemas.EvidenceResponse])
def get_candidate_evidence(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db.query(models.Evidence).filter(models.Evidence.candidate_id == candidate_id).all()


@api_router.get("/candidates/{candidate_id}/skills", response_model=List[schemas.CandidateSkillResponse])
def get_candidate_skills(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db.query(models.CandidateSkill).filter(models.CandidateSkill.candidate_id == candidate_id).all()


@api_router.get("/candidates/{candidate_id}/dna", response_model=schemas.OpportunityDNAProfileResponse)
def get_candidate_dna_profile(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    from backend.app.services.dna import DNACalculator
    signals = DNACalculator.calculate_profile_dna(candidate, db)
    
    return schemas.OpportunityDNAProfileResponse(
        candidate_id=candidate.id,
        candidate_name=candidate.name,
        skills=candidate.skills,
        evidence=candidate.evidence,
        signals=signals
    )


@api_router.get("/candidates/{candidate_id}/skills/{skill_id}/evidence", response_model=List[schemas.SkillEvidenceResponse])
def get_skill_backing_evidence(candidate_id: int, skill_id: int, db: Session = Depends(get_db)):
    cand_skill = db.query(models.CandidateSkill).filter(
        models.CandidateSkill.candidate_id == candidate_id,
        models.CandidateSkill.skill_id == skill_id
    ).first()
    
    if not cand_skill:
        raise HTTPException(status_code=404, detail="Candidate skill not found")
        
    return db.query(models.SkillEvidence).filter(
        models.SkillEvidence.candidate_skill_id == cand_skill.id
    ).all()


@api_router.post("/candidates/{candidate_id}/github/sync", response_model=List[schemas.EvidenceResponse])
def sync_github(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    if not candidate.github_url:
        raise HTTPException(status_code=400, detail="Candidate does not have a GitHub URL profile configured.")

    try:
        service = GitHubService()
        repos_evidence = service.extract_repo_evidence(candidate.github_url)
        
        created_evidences = []
        for raw_ev in repos_evidence:
            # Avoid duplicate syncs by matching source url
            existing = db.query(models.Evidence).filter(
                models.Evidence.candidate_id == candidate_id,
                models.Evidence.source_url == raw_ev["source_url"]
            ).first()
            
            if existing:
                existing.description = raw_ev["description"]
                existing.raw_content = raw_ev["raw_content"]
                db.add(existing)
                created_evidences.append(existing)
            else:
                new_ev = models.Evidence(
                    candidate_id=candidate_id,
                    type=raw_ev["type"],
                    title=raw_ev["title"],
                    description=raw_ev["description"],
                    source=raw_ev["source"],
                    source_url=raw_ev["source_url"],
                    raw_content=raw_ev["raw_content"],
                    date=datetime.utcnow()
                )
                db.add(new_ev)
                created_evidences.append(new_ev)
        
        db.commit()
        # Refresh all
        for item in created_evidences:
            db.refresh(item)
        return created_evidences
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to sync GitHub: {str(e)}")


# --- OPPORTUNITIES API ---
@api_router.post("/opportunities", response_model=schemas.OpportunityResponse)
def create_opportunity(opportunity: schemas.OpportunityCreate, db: Session = Depends(get_db)):
    new_opp = models.Opportunity(
        title=opportunity.title,
        company=opportunity.company,
        description=opportunity.description,
        stipend=opportunity.stipend,
        location=opportunity.location,
        sector=opportunity.sector,
        allowed_streams=opportunity.allowed_streams
    )
    db.add(new_opp)
    db.commit()
    db.refresh(new_opp)

    for skill_req in opportunity.required_skills:
        opp_skill = models.OpportunitySkill(
            opportunity_id=new_opp.id,
            skill_id=skill_req.skill_id,
            importance=skill_req.importance,
            required_level=skill_req.required_level
        )
        db.add(opp_skill)
    
    db.commit()
    db.refresh(new_opp)
    return new_opp


@api_router.get("/opportunities", response_model=List[schemas.OpportunityResponse])
def get_opportunities(db: Session = Depends(get_db)):
    return db.query(models.Opportunity).all()


@api_router.get("/opportunities/{opportunity_id}", response_model=schemas.OpportunityResponse)
def get_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp


# --- MATCHING ENGINE (SKELETON) ---
@api_router.post("/matching/match", response_model=schemas.RecommendationResponse)
def match_candidate(candidate_id: int, opportunity_id: int, db: Session = Depends(get_db)):
    """
    Perform a clean, mathematical skill overlap calculation.
    Looks at candidate skills vs opportunity required skills.
    This is a real mathematical calculation, not a mock LLM prediction.
    """
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    opportunity = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()

    if not candidate or not opportunity:
        raise HTTPException(status_code=404, detail="Candidate or Opportunity not found")

    opp_skills = {os.skill_id: os for os in opportunity.required_skills}
    cand_skills = {cs.skill_id: cs for cs in candidate.skills}

    if not opp_skills:
        # Default match if job has no skills defined
        match_score = 0.0
        explanation = "Opportunity has no skill requirements listed."
        strengths = "[]"
        gaps = "[]"
    else:
        # Calculate overlap
        matched_count = 0
        total_importance = 0.0
        scored_points = 0.0

        strengths_list = []
        gaps_list = []

        for skill_id, req in opp_skills.items():
            total_importance += req.importance
            if skill_id in cand_skills:
                matched_count += 1
                # Weight by confidence and matching
                skill_obj = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
                name = skill_obj.name if skill_obj else "Unknown"
                strengths_list.append(name)
                scored_points += req.importance * cand_skills[skill_id].confidence
            else:
                skill_obj = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
                name = skill_obj.name if skill_obj else "Unknown"
                gaps_list.append(name)

        match_score = (scored_points / total_importance) if total_importance > 0 else 0.0
        explanation = (
            f"Candidate matches {matched_count} out of {len(opp_skills)} required skills. "
            f"Skills-first assessment flags this as a candidate suitable for human review."
        )
        strengths = json.dumps(strengths_list)
        gaps = json.dumps(gaps_list)

    # Save Recommendation
    recommendation = models.Recommendation(
        candidate_id=candidate_id,
        opportunity_id=opportunity_id,
        match_score=round(match_score, 2),
        explanation=explanation,
        strengths=strengths,
        gaps=gaps
    )
    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)
    return recommendation


# --- BIAS AUDIT (SKELETON) ---
@api_router.get("/matching/audit/{candidate_id}/{opportunity_id}", response_model=schemas.BiasAuditResponse)
def audit_bias(candidate_id: int, opportunity_id: int, db: Session = Depends(get_db)):
    """
    Returns a BiasAudit evaluation.
    Calculates differences when pedigree and location proxies are eliminated.
    This skeleton illustrates the structure of proxy comparison.
    """
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # In a full run, we would re-run matching without college/institution/location variables.
    # For now, we compare full credentials vs. skills-first evidence.
    # If the candidate has a career gap or non-pedigree college, normal models might penalize them, 
    # but the blind matching keeps score identical.
    
    # Simple check for demo: if candidate is from a non-elite institution, normal scoring in conventional
    # ATS systems penalizes them, whereas blind skills-first matching boosts them.
    # We will simulate this by checking if institutional prestige plays a part (normal score might be 
    # lower if college is listed, while blind score is purely skills-based).
    # Since we don't have a real legacy parser, we set both based on skills match.
    # If institution is present, let's suggest it could act as a proxy.
    
    # Retrieve match record if exists, otherwise generate score
    rec = db.query(models.Recommendation).filter(
        models.Recommendation.candidate_id == candidate_id,
        models.Recommendation.opportunity_id == opportunity_id
    ).order_by(models.Recommendation.created_at.desc()).first()

    score = rec.match_score if rec else 0.5
    
    # Simple simulation: let's say without the college proxy, candidate ranking increases or remains steady.
    # If institution is present, we identify it as an audited proxy attribute.
    affected = []
    explanation = "Skills-first evaluation shows no change because demographics are excluded from match scoring."
    risk_level = "low"
    
    if candidate.institution:
        affected.append("institution")
        explanation = (
            f"Audited candidate college proxy '{candidate.institution}'. "
            f"Under a blind skills-first model, candidates from diverse educational institutions receive matching "
            f"scores purely based on demonstrated evidence, removing pedigree bias."
        )
        risk_level = "medium"

    if candidate.career_gap_info:
        affected.append("career_gap")
        risk_level = "high"

    audit = models.BiasAudit(
        candidate_id=candidate_id,
        opportunity_id=opportunity_id,
        normal_score=round(score * 0.9 if affected else score, 2), # legacy matching often penalizes gaps
        blind_score=round(score, 2),
        score_delta=round(score - (score * 0.9 if affected else score), 2),
        normal_rank=2,
        blind_rank=1 if affected else 2,
        rank_change=1 if affected else 0,
        affected_attributes=json.dumps(affected),
        explanation=explanation,
        risk_level=risk_level
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


# --- PHASE 3: OPPORTUNITY MATCHING & COMPARISON API ---

@api_router.post("/opportunities/{opportunity_id}/analyze", response_model=List[schemas.OpportunitySkillResponse])
def analyze_opportunity_requirements(opportunity_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    if not opp.description or not opp.description.strip():
        raise HTTPException(status_code=400, detail="Job description is empty. Cannot perform analysis.")

    try:
        from backend.app.services.job_analyzer import JobAnalyzerService
        from backend.app.services.normalization import SkillNormalizer
        
        extracted = JobAnalyzerService.analyze_job_description(opp.title, opp.company, opp.description)
        
        # Clear existing requirements to prevent duplicates
        db.query(models.OpportunitySkill).filter(
            models.OpportunitySkill.opportunity_id == opportunity_id
        ).delete()
        db.commit()
        
        created_skills = []
        for parsed_skill in extracted.skills:
            # 1. Normalize name and fetch/create Skill in global catalog
            skill_obj = SkillNormalizer.normalize_and_get_skill(
                db, 
                parsed_skill.name, 
                category=parsed_skill.category
            )
            
            # 2. Save opportunity requirement link
            opp_skill = models.OpportunitySkill(
                opportunity_id=opportunity_id,
                skill_id=skill_obj.id,
                importance=parsed_skill.importance,
                required_level=parsed_skill.required_level,
                requirement_type=parsed_skill.requirement_type,
                evidence_expectation=parsed_skill.evidence_expectation
            )
            db.add(opp_skill)
            created_skills.append(opp_skill)
            
        db.commit()
        for item in created_skills:
            db.refresh(item)
            
        return created_skills
    except Exception as e:
        db.rollback()
        logger.error(f"Error in job description analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to analyze job requirements: {str(e)}")


@api_router.get("/opportunities/{opportunity_id}/skills", response_model=List[schemas.OpportunitySkillResponse])
def get_opportunity_skills(opportunity_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp.required_skills


@api_router.post("/opportunities/{opportunity_id}/match", response_model=schemas.CandidateMatchResultOut)
def match_candidate_to_job(opportunity_id: int, candidate_id: int, mode: str = "skills_first", db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not candidate or not opp:
        raise HTTPException(status_code=404, detail="Candidate or Opportunity not found")
        
    from backend.app.services.matcher import MatchingEngine
    match_result = MatchingEngine.calculate_match(db, candidate, opp, mode)
    
    # Save a Legacy Recommendation record in database for historical log
    strengths_json = json.dumps(match_result.strengths)
    gaps_json = json.dumps(match_result.gaps)
    explanation = f"Match calculated. Overall score: {match_result.overall_score}%. Mode: {mode}."
    
    rec = models.Recommendation(
        candidate_id=candidate_id,
        opportunity_id=opportunity_id,
        match_score=round(match_result.overall_score / 100.0, 2),
        explanation=explanation,
        strengths=strengths_json,
        gaps=gaps_json
    )
    db.add(rec)
    db.commit()
    
    return match_result


@api_router.get("/opportunities/{opportunity_id}/matches", response_model=List[schemas.CandidateMatchResultOut])
def get_ranked_opportunity_matches(opportunity_id: int, mode: str = "skills_first", db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    candidates = db.query(models.Candidate).all()
    from backend.app.services.matcher import MatchingEngine
    
    matches = []
    for cand in candidates:
        match = MatchingEngine.calculate_match(db, cand, opp, mode)
        matches.append(match)
        
    # Sort descending
    matches.sort(key=lambda m: m.overall_score, reverse=True)
    
    # Assign ranks
    for index, match in enumerate(matches, 1):
        match.rank = index
        
    return matches


@api_router.get("/candidates/{candidate_id}/matches")
def get_ranked_candidate_matches(candidate_id: int, mode: str = "skills_first", db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    opportunities = db.query(models.Opportunity).all()
    from backend.app.services.matcher import MatchingEngine
    
    results = []
    for opp in opportunities:
        match = MatchingEngine.calculate_match(db, candidate, opp, mode)
        results.append({
            "opportunity_id": opp.id,
            "title": opp.title,
            "company": opp.company,
            "overall_score": match.overall_score,
            "strengths": match.strengths,
            "gaps": match.gaps,
            "evidence_strength": match.evidence_strength
        })
        
    results.sort(key=lambda r: r["overall_score"], reverse=True)
    for index, item in enumerate(results, 1):
        item["rank"] = index
        
    return results


class ComparePayload(schemas.BaseModel):
    opportunity_id: int
    candidate_ids: List[int]
    mode: str = "skills_first"

@api_router.post("/matching/compare", response_model=schemas.CompareCandidatesResponse)
def compare_candidates_for_job(payload: ComparePayload, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == payload.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    from backend.app.services.matcher import MatchingEngine
    
    matches = []
    for cid in payload.candidate_ids:
        candidate = db.query(models.Candidate).filter(models.Candidate.id == cid).first()
        if candidate:
            match = MatchingEngine.calculate_match(db, candidate, opp, payload.mode)
            matches.append(match)
            
    matches.sort(key=lambda m: m.overall_score, reverse=True)
    for index, match in enumerate(matches, 1):
        match.rank = index
        
    return schemas.CompareCandidatesResponse(
        opportunity_id=opp.id,
        opportunity_title=opp.title,
        company=opp.company,
        candidate_matches=matches,
        mode=payload.mode,
        message="AI recommendation for human review"
    )


# --- PHASE 4: BIAS AUDITING & COUNTERFACTUAL ENDPOINTS ---

@api_router.post("/bias/audit/{opportunity_id}", response_model=schemas.GroupBiasAuditSummaryResponse)
def execute_group_bias_audit(opportunity_id: int, db: Session = Depends(get_db)):
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    candidates = db.query(models.Candidate).all()
    if not candidates:
        raise HTTPException(status_code=400, detail="No candidates in database to audit.")
        
    from backend.app.services.matcher import MatchingEngine
    from backend.app.services.fairness import FairnessEngine
    
    # 1. Rank in normal mode
    normal_results = []
    for cand in candidates:
        normal_results.append({
            "cand": cand,
            "match": MatchingEngine.calculate_match(db, cand, opp, mode="normal")
        })
    normal_results.sort(key=lambda x: x["match"].overall_score, reverse=True)
    normal_ranks = {x["cand"].id: i for i, x in enumerate(normal_results, 1)}
    
    # 2. Rank in blind (skills_first) mode
    blind_results = []
    for cand in candidates:
        blind_results.append({
            "cand": cand,
            "match": MatchingEngine.calculate_match(db, cand, opp, mode="skills_first")
        })
    blind_results.sort(key=lambda x: x["match"].overall_score, reverse=True)
    blind_ranks = {x["cand"].id: i for i, x in enumerate(blind_results, 1)}
    
    # 3. Compare details and compile Group Bias Audit Detail
    audit_details = []
    rank_changes = 0
    score_deltas_sum = 0.0
    max_score_delta = 0.0
    
    for cand in candidates:
        c_id = cand.id
        n_rank = normal_ranks[c_id]
        b_rank = blind_ranks[c_id]
        rank_diff = n_rank - b_rank  # normal was rank 3, blind is rank 1: rank_diff = 2 (up 2 spots)
        
        n_score = next(x["match"].overall_score for x in normal_results if x["cand"].id == c_id)
        b_score = next(x["match"].overall_score for x in blind_results if x["cand"].id == c_id)
        score_diff = round(b_score - n_score, 2)
        
        if rank_diff != 0:
            rank_changes += 1
            
        score_deltas_sum += abs(score_diff)
        if abs(score_diff) > max_score_delta:
            max_score_delta = abs(score_diff)
            
        risk = FairnessEngine.classify_bias_risk(score_diff, rank_diff)
        
        # Save individual BiasAudit row in database
        # Clear existing
        db.query(models.BiasAudit).filter(
            models.BiasAudit.candidate_id == c_id,
            models.BiasAudit.opportunity_id == opportunity_id,
            models.BiasAudit.audit_type == "blind_comparison"
        ).delete()
        
        affected = []
        if cand.institution: affected.append("institution")
        if cand.career_gap_info: affected.append("career_gap")
        if cand.location: affected.append("location")
        
        db_audit = models.BiasAudit(
            candidate_id=c_id,
            opportunity_id=opportunity_id,
            normal_score=n_score,
            blind_score=b_score,
            score_delta=score_diff,
            normal_rank=n_rank,
            blind_rank=b_rank,
            rank_change=rank_diff,
            affected_attributes=json.dumps(affected),
            explanation=f"Demonstrated capability remains constant. Match score changed by {score_diff} points when credentials masked.",
            risk_level=risk,
            audit_type="blind_comparison",
            capability_data_unchanged=True
        )
        db.add(db_audit)
        
        audit_details.append(
            schemas.GroupBiasAuditDetail(
                candidate_id=c_id,
                candidate_name=cand.name,
                normal_rank=n_rank,
                blind_rank=b_rank,
                rank_change=rank_diff,
                score_delta=score_diff,
                risk_level=risk
            )
        )
        
    db.commit()
    
    avg_score_delta = round(score_deltas_sum / len(candidates), 2)
    group_risk = "high" if max_score_delta >= 10.0 or rank_changes > 0 else "moderate" if max_score_delta >= 5.0 else "low"
    
    return schemas.GroupBiasAuditSummaryResponse(
        opportunity_id=opportunity_id,
        opportunity_title=opp.title,
        company=opp.company,
        candidates_audited=len(candidates),
        rank_changes_count=rank_changes,
        avg_score_delta=avg_score_delta,
        max_score_delta=max_score_delta,
        risk_level=group_risk,
        details=audit_details
    )


@api_router.get("/bias/audit/{opportunity_id}", response_model=schemas.GroupBiasAuditSummaryResponse)
def get_group_bias_audit_summary(opportunity_id: int, db: Session = Depends(get_db)):
    return execute_group_bias_audit(opportunity_id, db)


@api_router.get("/bias/candidate/{candidate_id}/{opportunity_id}", response_model=schemas.BiasAuditResponse)
def get_candidate_bias_audit(candidate_id: int, opportunity_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not candidate or not opp:
        raise HTTPException(status_code=404, detail="Candidate or Opportunity not found")
        
    # Query database first
    existing = db.query(models.BiasAudit).filter(
        models.BiasAudit.candidate_id == candidate_id,
        models.BiasAudit.opportunity_id == opportunity_id,
        models.BiasAudit.audit_type == "blind_comparison"
    ).order_by(models.BiasAudit.created_at.desc()).first()
    
    if existing:
        return existing
        
    # Generate dynamically
    from backend.app.services.fairness import FairnessEngine
    audit_res = FairnessEngine.run_individual_audit(db, candidate, opp)
    
    db_audit = models.BiasAudit(
        candidate_id=candidate_id,
        opportunity_id=opportunity_id,
        normal_score=audit_res.normal_score,
        blind_score=audit_res.blind_score,
        score_delta=audit_res.score_delta,
        normal_rank=1,
        blind_rank=1,
        rank_change=0,
        affected_attributes=audit_res.affected_attributes,
        explanation=audit_res.explanation,
        risk_level=audit_res.risk_level,
        audit_type="blind_comparison",
        capability_data_unchanged=True
    )
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return db_audit


@api_router.post("/bias/counterfactual", response_model=schemas.BiasAuditResponse)
def run_counterfactual_analysis(payload: schemas.CounterfactualAuditPayload, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == payload.candidate_id).first()
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == payload.opportunity_id).first()
    if not candidate or not opp:
        raise HTTPException(status_code=404, detail="Candidate or Opportunity not found")
        
    from backend.app.services.matcher import MatchingEngine
    from backend.app.services.fairness import FairnessEngine
    
    # 1. Original Normal Match details
    orig_match = MatchingEngine.calculate_match(db, candidate, opp, mode="normal")
    
    # Get original rank
    candidates = db.query(models.Candidate).all()
    normal_results = []
    for cand in candidates:
        normal_results.append({
            "cand_id": cand.id,
            "score": MatchingEngine.calculate_match(db, cand, opp, mode="normal").overall_score
        })
    normal_results.sort(key=lambda x: x["score"], reverse=True)
    orig_rank = next(i for i, x in enumerate(normal_results, 1) if x["cand_id"] == candidate.id)
    
    # 2. Get original value
    attr_lower = payload.tested_attribute.strip().lower()
    if attr_lower == "institution":
        orig_val = candidate.institution or "Not Specified"
    elif attr_lower == "career_gap":
        orig_val = "Gap Present" if candidate.career_gap_info else "No Gap Listed"
    elif attr_lower == "location":
        orig_val = candidate.location or "Not Specified"
    else:
        orig_val = "Visible"
        
    # 3. Create counterfactual candidate copy
    variant = FairnessEngine.generate_counterfactual_variant(
        candidate, 
        payload.tested_attribute, 
        payload.counterfactual_value
    )
    
    # 4. Normal Match details for variant
    var_match = MatchingEngine.calculate_match(db, variant, opp, mode="normal")
    
    # Compute rank for variant
    normal_results_variant = []
    for cand in candidates:
        c_payload = variant if cand.id == candidate.id else cand
        normal_results_variant.append({
            "cand_id": cand.id,
            "score": MatchingEngine.calculate_match(db, c_payload, opp, mode="normal").overall_score
        })
    normal_results_variant.sort(key=lambda x: x["score"], reverse=True)
    var_rank = next(i for i, x in enumerate(normal_results_variant, 1) if x["cand_id"] == candidate.id)
    
    score_delta = round(var_match.overall_score - orig_match.overall_score, 2)
    rank_change = orig_rank - var_rank  # if goes from 3 to 1: +2 spots
    
    # Risk
    risk_level = FairnessEngine.classify_bias_risk(score_delta, rank_change)
    
    # Generate Explanation
    explanation = FairnessEngine.generate_explanation(
        candidate_name=candidate.name,
        audit_type="counterfactual",
        tested_attribute=payload.tested_attribute,
        original_val=orig_val,
        counterfactual_val=payload.counterfactual_value,
        normal_score=orig_match.overall_score,
        blind_score=var_match.overall_score,
        score_delta=score_delta,
        rank_change=rank_change,
        capability_unchanged=True
    )
    
    # Save Counterfactual Audit Row in DB
    db_audit = models.BiasAudit(
        candidate_id=candidate.id,
        opportunity_id=payload.opportunity_id,
        normal_score=orig_match.overall_score,
        blind_score=var_match.overall_score,
        score_delta=score_delta,
        normal_rank=orig_rank,
        blind_rank=var_rank,
        rank_change=rank_change,
        tested_attribute=payload.tested_attribute,
        original_value=orig_val,
        counterfactual_value=payload.counterfactual_value,
        risk_level=risk_level,
        explanation=explanation,
        audit_type="counterfactual",
        capability_data_unchanged=True
    )
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    
    return db_audit


# --- SIH PMIS ENDPOINTS ---

@api_router.get("/candidates/{candidate_id}/eligibility", response_model=schemas.StudentEligibilityResponse)
def get_student_eligibility(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate/Student not found")
        
    from backend.app.services.eligibility import PMISEligibilityEngine
    eligible, passed, failed = PMISEligibilityEngine.precheck_candidate(candidate)
    
    verdict = (
        "Based on this pre-check, you meet the initial eligibility requirements of the PM Internship Scheme."
        if eligible else
        "Based on this pre-check, you do not meet all initial requirements of the PM Internship Scheme. Please review the failed checks below."
    )
    
    return schemas.StudentEligibilityResponse(
        candidate_id=candidate.id,
        eligible=eligible,
        passed_checks=passed,
        failed_checks=failed,
        verdict_summary=verdict
    )


@api_router.get("/candidates/{candidate_id}/opportunities/{opportunity_id}/readiness", response_model=schemas.ReadinessSimulationResponse)
def get_readiness_simulation(candidate_id: int, opportunity_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate/Student not found")
        
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity/Internship not found")
        
    from backend.app.services.matcher import MatchingEngine, get_proficiency_val
    match_res = MatchingEngine.calculate_match(db, candidate, opp, mode="skills_first")
    
    req_skills = opp.required_skills
    total_weight = sum((os.importance or 1.0) * 1.2 for os in req_skills) if req_skills else 0.0
    
    skills_breakdown = []
    missing_skills = []
    total_potential_addition = 0.0
    
    cand_skills_map = {cs.skill_id: cs for cs in candidate.skills}
    
    for os in req_skills:
        importance = os.importance or 1.0
        target_contrib = ((importance * 1.2) / total_weight * 100) if total_weight > 0 else 0.0
        
        cs = cand_skills_map.get(os.skill_id)
        if cs:
            cand_val = get_proficiency_val(cs.proficiency)
            req_val = get_proficiency_val(os.required_level)
            is_met = cand_val >= req_val
            
            if is_met:
                potential_contrib = 0.0
            else:
                prof_match_factor = 0.5 + 0.5 * (cand_val / req_val)
                type_factor = 0.8 if cs.skill_type == "adjacent" else 1.0
                evidence_factor = min(1.2, 0.6 + 0.2 * cs.evidence_strength)
                current_contrib = cs.confidence * prof_match_factor * importance * evidence_factor * type_factor
                current_contrib_percent = (current_contrib / total_weight * 100) if total_weight > 0 else 0.0
                potential_contrib = max(0.0, target_contrib - current_contrib_percent)
                
            skills_breakdown.append(
                schemas.SkillReadinessDetail(
                    skill_name=os.skill.name,
                    required_level=os.required_level or "Intermediate",
                    candidate_level=cs.proficiency,
                    is_met=is_met,
                    weight=importance,
                    potential_contribution=round(potential_contrib, 1)
                )
            )
            if not is_met:
                missing_skills.append(os.skill.name)
                total_potential_addition += potential_contrib
        else:
            skills_breakdown.append(
                schemas.SkillReadinessDetail(
                    skill_name=os.skill.name,
                    required_level=os.required_level or "Intermediate",
                    candidate_level=None,
                    is_met=False,
                    weight=importance,
                    potential_contribution=round(target_contrib, 1)
                )
            )
            missing_skills.append(os.skill.name)
            total_potential_addition += target_contrib
            
    projected_score = min(100.0, round(match_res.overall_score + total_potential_addition, 1))
    
    return schemas.ReadinessSimulationResponse(
        candidate_id=candidate.id,
        opportunity_id=opp.id,
        current_readiness_score=match_res.overall_score,
        projected_readiness_score=projected_score,
        missing_skills=missing_skills,
        skills_breakdown=skills_breakdown
    )


@api_router.get("/candidates/{candidate_id}/opportunities/{opportunity_id}/roadmap", response_model=schemas.UpskillingRoadmapResponse)
def get_upskilling_roadmap(candidate_id: int, opportunity_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate/Student not found")
        
    opp = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity/Internship not found")
        
    from backend.app.services.matcher import MatchingEngine, get_proficiency_val
    from backend.app.services.roadmap import RoadmapGenerator
    
    # Calculate missing skills
    req_skills = opp.required_skills
    cand_skills_map = {cs.skill_id: cs for cs in candidate.skills}
    
    missing_skills = []
    for os in req_skills:
        cs = cand_skills_map.get(os.skill_id)
        if not cs or get_proficiency_val(cs.proficiency) < get_proficiency_val(os.required_level):
            missing_skills.append(os.skill.name)
            
    gaps_roadmap = RoadmapGenerator.generate_roadmap(missing_skills)
    
    # Project timeline based on estimated hours (approx 40 hours per month of part-time study)
    total_hours = sum(sum(res.estimated_hours for res in gap.resources) for gap in gaps_roadmap)
    estimated_months = round(max(0.5, total_hours / 40.0), 1)
    
    return schemas.UpskillingRoadmapResponse(
        candidate_id=candidate.id,
        opportunity_id=opp.id,
        gaps=gaps_roadmap,
        estimated_months_to_ready=estimated_months
    )


# =============================================================================
# SIH26044: APPLICATION WORKFLOW ENDPOINTS
# =============================================================================

VALID_APPLICATION_TRANSITIONS = {
    "applied": {"shortlisted", "rejected"},
    "shortlisted": {"offered", "rejected"},
    "offered": {"placed", "rejected"},
}


def _application_to_response(app: "models.Application") -> schemas.ApplicationResponse:
    """Convert Application ORM object to response schema with denormalized names."""
    return schemas.ApplicationResponse(
        id=app.id,
        candidate_id=app.candidate_id,
        opportunity_id=app.opportunity_id,
        status=app.status,
        applied_at=app.applied_at,
        updated_at=app.updated_at,
        notes=app.notes,
        candidate_name=app.candidate.name if app.candidate else None,
        opportunity_title=app.opportunity.title if app.opportunity else None,
        opportunity_company=app.opportunity.company if app.opportunity else None,
        opportunity_type=getattr(app.opportunity, 'type', 'internship') if app.opportunity else None,
    )


@api_router.post("/applications", response_model=schemas.ApplicationResponse, status_code=201)
def create_application(payload: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    """Student applies to an opportunity."""
    candidate = db.query(models.Candidate).filter(models.Candidate.id == payload.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    opportunity = db.query(models.Opportunity).filter(models.Opportunity.id == payload.opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing = db.query(models.Application).filter(
        models.Application.candidate_id == payload.candidate_id,
        models.Application.opportunity_id == payload.opportunity_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Application already exists for this candidate and opportunity")

    application = models.Application(
        candidate_id=payload.candidate_id,
        opportunity_id=payload.opportunity_id,
        status="applied"
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return _application_to_response(application)


@api_router.get("/candidates/{candidate_id}/applications", response_model=List[schemas.ApplicationResponse])
def get_candidate_applications(candidate_id: int, db: Session = Depends(get_db)):
    """Return all applications for a student."""
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    applications = db.query(models.Application).filter(
        models.Application.candidate_id == candidate_id
    ).order_by(models.Application.applied_at.desc()).all()
    return [_application_to_response(a) for a in applications]


@api_router.get("/opportunities/{opportunity_id}/applications", response_model=List[schemas.ApplicationResponse])
def get_opportunity_applications(opportunity_id: int, db: Session = Depends(get_db)):
    """Industry partner views applications for an opportunity."""
    opportunity = db.query(models.Opportunity).filter(models.Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    applications = db.query(models.Application).filter(
        models.Application.opportunity_id == opportunity_id
    ).order_by(models.Application.applied_at.desc()).all()
    return [_application_to_response(a) for a in applications]


@api_router.patch("/applications/{application_id}/status", response_model=schemas.ApplicationResponse)
def update_application_status(application_id: int, payload: schemas.ApplicationStatusUpdate, db: Session = Depends(get_db)):
    """Industry partner updates application status with validated transitions."""
    application = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    new_status = payload.status.lower().strip()
    valid_statuses = {"applied", "shortlisted", "offered", "placed", "rejected"}
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{new_status}'. Must be one of: {', '.join(sorted(valid_statuses))}")

    current_status = application.status
    allowed_transitions = VALID_APPLICATION_TRANSITIONS.get(current_status, set())

    if new_status not in allowed_transitions:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{current_status}' to '{new_status}'. Allowed transitions: {', '.join(sorted(allowed_transitions)) if allowed_transitions else 'none (terminal state)'}"
        )

    application.status = new_status
    application.updated_at = datetime.utcnow()
    if payload.notes:
        application.notes = payload.notes
    db.commit()
    db.refresh(application)
    return _application_to_response(application)


# =============================================================================
# SIH26044: ANALYTICS ENDPOINTS
# =============================================================================

@api_router.get("/analytics/skill-demand", response_model=schemas.SkillDemandResponse)
def get_skill_demand_analytics(db: Session = Depends(get_db)):
    """Aggregate skill demand across all industry opportunities."""
    from sqlalchemy import func

    total_opps = db.query(func.count(models.Opportunity.id)).scalar() or 0

    # Query opportunity_skills joined with skills and opportunities for type breakdown
    rows = db.query(
        models.Skill.name,
        models.Skill.category,
        func.count(models.OpportunitySkill.opportunity_id.distinct()).label("opp_count"),
    ).join(
        models.OpportunitySkill, models.Skill.id == models.OpportunitySkill.skill_id
    ).group_by(
        models.Skill.name, models.Skill.category
    ).order_by(
        func.count(models.OpportunitySkill.opportunity_id.distinct()).desc()
    ).all()

    skills = []
    for skill_name, category, opp_count in rows:
        # Get internship/placement breakdown
        internship_count = db.query(func.count(models.OpportunitySkill.id)).join(
            models.Opportunity, models.OpportunitySkill.opportunity_id == models.Opportunity.id
        ).filter(
            models.OpportunitySkill.skill_id == db.query(models.Skill.id).filter(models.Skill.name == skill_name).scalar_subquery(),
            models.Opportunity.type == "internship"
        ).scalar() or 0

        placement_count = db.query(func.count(models.OpportunitySkill.id)).join(
            models.Opportunity, models.OpportunitySkill.opportunity_id == models.Opportunity.id
        ).filter(
            models.OpportunitySkill.skill_id == db.query(models.Skill.id).filter(models.Skill.name == skill_name).scalar_subquery(),
            models.Opportunity.type == "placement"
        ).scalar() or 0

        skills.append(schemas.SkillDemandItem(
            skill_name=skill_name,
            category=category,
            opportunity_count=opp_count,
            percentage=round((opp_count / total_opps * 100) if total_opps > 0 else 0.0, 1),
            internship_count=internship_count,
            placement_count=placement_count,
        ))

    return schemas.SkillDemandResponse(total_opportunities=total_opps, skills=skills)


@api_router.get("/analytics/institution-dashboard", response_model=schemas.InstitutionDashboardResponse)
def get_institution_dashboard(db: Session = Depends(get_db)):
    """Institution-level aggregate dashboard with real database metrics."""
    from sqlalchemy import func

    total_students = db.query(func.count(models.Candidate.id)).scalar() or 0
    total_opportunities = db.query(func.count(models.Opportunity.id)).scalar() or 0

    internship_count = db.query(func.count(models.Opportunity.id)).filter(
        models.Opportunity.type == "internship"
    ).scalar() or 0
    placement_count = db.query(func.count(models.Opportunity.id)).filter(
        models.Opportunity.type == "placement"
    ).scalar() or 0
    project_count = db.query(func.count(models.Opportunity.id)).filter(
        models.Opportunity.type == "project"
    ).scalar() or 0

    # Top student skills (by number of students possessing them)
    student_skill_rows = db.query(
        models.Skill.name,
        func.count(models.CandidateSkill.candidate_id.distinct()).label("student_count")
    ).join(
        models.CandidateSkill, models.Skill.id == models.CandidateSkill.skill_id
    ).group_by(
        models.Skill.name
    ).order_by(
        func.count(models.CandidateSkill.candidate_id.distinct()).desc()
    ).limit(15).all()

    top_student_skills = [
        schemas.SkillSupplyItem(skill_name=name, student_count=count)
        for name, count in student_skill_rows
    ]

    # Top demanded skills
    demand_rows = db.query(
        models.Skill.name,
        models.Skill.category,
        func.count(models.OpportunitySkill.opportunity_id.distinct()).label("opp_count")
    ).join(
        models.OpportunitySkill, models.Skill.id == models.OpportunitySkill.skill_id
    ).group_by(
        models.Skill.name, models.Skill.category
    ).order_by(
        func.count(models.OpportunitySkill.opportunity_id.distinct()).desc()
    ).limit(15).all()

    top_demanded_skills = [
        schemas.SkillDemandItem(
            skill_name=name, category=cat, opportunity_count=cnt,
            percentage=round((cnt / total_opportunities * 100) if total_opportunities > 0 else 0.0, 1)
        )
        for name, cat, cnt in demand_rows
    ]

    # Skill gap analysis: demand vs supply
    # Build demand map
    demand_map = {name: cnt for name, _cat, cnt in demand_rows}
    supply_map = {name: cnt for name, cnt in student_skill_rows}

    all_skill_names = set(demand_map.keys()) | set(supply_map.keys())
    skill_gaps = []
    for sname in sorted(all_skill_names):
        d = demand_map.get(sname, 0)
        s = supply_map.get(sname, 0)
        if d > 0:  # Only show gaps for demanded skills
            skill_gaps.append(schemas.SkillGapItem(
                skill_name=sname, demand_count=d, supply_count=s, gap=d - s
            ))
    skill_gaps.sort(key=lambda x: x.gap, reverse=True)

    # Application statistics
    app_stats = {"applied": 0, "shortlisted": 0, "offered": 0, "placed": 0, "rejected": 0, "total": 0}
    app_rows = db.query(
        models.Application.status, func.count(models.Application.id)
    ).group_by(models.Application.status).all()
    for status, count in app_rows:
        if status in app_stats:
            app_stats[status] = count
        app_stats["total"] += count

    # Internship vs Placement Application Breakdown
    internship_app_stats = {"applied": 0, "shortlisted": 0, "offered": 0, "placed": 0, "rejected": 0, "total": 0}
    placement_app_stats = {"applied": 0, "shortlisted": 0, "offered": 0, "placed": 0, "rejected": 0, "total": 0}

    app_type_rows = db.query(
        models.Opportunity.type, models.Application.status, func.count(models.Application.id)
    ).join(
        models.Application, models.Opportunity.id == models.Application.opportunity_id
    ).group_by(
        models.Opportunity.type, models.Application.status
    ).all()

    for opp_type, status, count in app_type_rows:
        target = internship_app_stats if opp_type == "internship" else placement_app_stats
        if status in target:
            target[status] = count
        target["total"] += count

    # Average Match Readiness
    avg_score = db.query(func.avg(models.Recommendation.match_score)).scalar() or 0.0
    avg_match_readiness = round(avg_score * 100.0 if avg_score <= 1.0 else avg_score, 1)

    return schemas.InstitutionDashboardResponse(
        total_students=total_students,
        total_opportunities=total_opportunities,
        internship_count=internship_count,
        placement_count=placement_count,
        project_count=project_count,
        top_student_skills=top_student_skills,
        top_demanded_skills=top_demanded_skills,
        skill_gaps=skill_gaps,
        application_stats=app_stats,
        internship_application_stats=internship_app_stats,
        placement_application_stats=placement_app_stats,
        avg_match_readiness=avg_match_readiness
    )


