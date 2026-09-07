import urllib.request
import urllib.parse
import json
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, {"error": body}
    except Exception as e:
        return 500, {"error": str(e)}

def verify_bias_pipeline():
    print("==================================================")
    print(" OPPORTUNITY DNA - PHASE 4 BIAS & FAIRNESS AUDIT")
    print("==================================================")

    # 1. Seed global Skills
    print("\n[*] Initializing Skills catalog...")
    py_skill = {"name": "Python", "category": "Backend", "description": "Python Language"}
    sql_skill = {"name": "SQL", "category": "Database", "description": "Database queries"}
    
    make_request("/skills", "POST", py_skill)
    make_request("/skills", "POST", sql_skill)
    
    status, catalog = make_request("/skills")
    py_id = [s.get("id") for s in catalog if s.get("name") == "Python"][0]
    sql_id = [s.get("id") for s in catalog if s.get("name") == "SQL"][0]

    # 2. Seed Candidates
    print("\n[*] Seeding 3 realistic candidates with diverse proxy credentials...")
    ada = {
        "name": "Ada Lovelace",
        "email": "ada.lovelace@fairness.org",
        "location": "Remote Town, UK",
        "institution": "Self-Taught College",
        "gender": "Female",
        "age": 36,
        "career_gap_info": "Took 4 years off to raise family.",
        "github_url": None
    }
    grace = {
        "name": "Grace Hopper",
        "email": "grace.hopper@fairness.org",
        "location": "Seattle, WA",
        "institution": "Yale University",
        "gender": "Female",
        "age": 42,
        "career_gap_info": None,
        "github_url": None
    }
    charles = {
        "name": "Charles Babbage",
        "email": "charles.babbage@fairness.org",
        "location": "London, UK",
        "institution": "Cambridge University",
        "gender": "Male",
        "age": 55,
        "career_gap_info": None,
        "github_url": None
    }

    cand_ids = []
    for c in [ada, grace, charles]:
        status, res = make_request("/candidates", "POST", c)
        c_id = res.get("id")
        cand_ids.append(c_id)
        print(f"    - Seeded {c['name']} (ID: {c_id})")

    # 3. Seed Candidate Skills directly in DB (using python db connector to bypass LLM parsers for determinism)
    print("\n[*] Seeding Candidate Capability Evidence profiles in SQLite...")
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from backend.app.models.models import CandidateSkill
    
    db_path = "c:\\Users\\aryag\\OneDrive\\Desktop\\Oppurtunity_DNA\\opportunity_dna.db"
    engine = create_engine(f"sqlite:///{db_path}")
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    # Ada: Python Expert, SQL Intermediate
    db.add(CandidateSkill(candidate_id=cand_ids[0], skill_id=py_id, confidence=0.95, proficiency="Expert", evidence_strength=2.5, skill_type="explicit"))
    db.add(CandidateSkill(candidate_id=cand_ids[0], skill_id=sql_id, confidence=0.80, proficiency="Intermediate", evidence_strength=1.5, skill_type="explicit"))
    
    # Grace: Python Intermediate, SQL Expert
    db.add(CandidateSkill(candidate_id=cand_ids[1], skill_id=py_id, confidence=0.85, proficiency="Intermediate", evidence_strength=1.8, skill_type="explicit"))
    db.add(CandidateSkill(candidate_id=cand_ids[1], skill_id=sql_id, confidence=0.95, proficiency="Expert", evidence_strength=2.2, skill_type="explicit"))
    
    # Charles: SQL Beginner, No Python
    db.add(CandidateSkill(candidate_id=cand_ids[2], skill_id=sql_id, confidence=0.60, proficiency="Beginner", evidence_strength=0.5, skill_type="explicit"))
    
    db.commit()
    db.close()
    print("    - Capability profiles configured.")

    # 4. Create Job Opportunity
    print("\n[*] Seeding Job Opportunity requirements...")
    opp_payload = {
        "title": "Backend Architect (Phase 4 Test)",
        "company": "TalentFair Inc",
        "description": "Requires solid Python and SQL experience."
    }
    status, opp_res = make_request("/opportunities", "POST", opp_payload)
    opp_id = opp_res.get("id")
    print(f"    - Seeded Opportunity '{opp_payload['title']}' (ID: {opp_id})")
    
    # Configure Job required skills
    db = SessionLocal()
    from backend.app.models.models import OpportunitySkill
    db.add(OpportunitySkill(opportunity_id=opp_id, skill_id=py_id, importance=1.0, required_level="Intermediate", requirement_type="required"))
    db.add(OpportunitySkill(opportunity_id=opp_id, skill_id=sql_id, importance=0.6, required_level="Intermediate", requirement_type="preferred"))
    db.commit()
    db.close()
    print("    - Job requirements profile linked.")

    # 5. Execute Group Bias Audit API
    print("\n[*] Triggering POST /api/bias/audit/{opportunity_id}...")
    status, audit_res = make_request(f"/bias/audit/{opp_id}", "POST")
    if status == 200:
        print("\nGROUP AUDIT RESULT:")
        print(f"  Opportunity: {audit_res['opportunity_title']} ({audit_res['company']})")
        print(f"  Candidates Audited: {audit_res['candidates_audited']}")
        print(f"  Risk Level: {audit_res['risk_level'].upper()}")
        print(f"  Rank Changes Count: {audit_res['rank_changes_count']}")
        print(f"  Max Score Proxy Delta: {audit_res['max_score_delta']} Points")
        
        print("\n  CANDIDATES RANK DRIFT DETAILS:")
        for det in audit_res["details"]:
            print(f"    - {det['candidate_name']}: ATS Rank #{det['normal_rank']} → Blind Rank #{det['blind_rank']} (Shift: {det['rank_change']}, Delta: {det['score_delta']} pts, Risk: {det['risk_level'].upper()})")
    else:
        print(f"  [!] Failed: {audit_res}")
        return

    # 6. Execute Counterfactual Test on Ada Lovelace (Attribute: Institution)
    print("\n[*] Executing Counterfactual Test for Ada Lovelace (Tested Attribute: Institution)...")
    cf_inst = {
        "candidate_id": cand_ids[0],
        "opportunity_id": opp_id,
        "tested_attribute": "institution",
        "counterfactual_value": "Yale University"
    }
    status, cf_inst_res = make_request("/bias/counterfactual", "POST", cf_inst)
    if status == 200:
        print("\nCOUNTERFACTUAL INST. RESULT:")
        print(f"  Candidate: Ada Lovelace")
        print(f"  Attribute tested: {cf_inst_res['tested_attribute']}")
        print(f"  Original value: '{cf_inst_res['original_value']}'")
        print(f"  Counterfactual value: '{cf_inst_res['counterfactual_value']}'")
        print(f"  Capability data unchanged: {cf_inst_res['capability_data_unchanged']}")
        print(f"  Normal score → Counterfactual score: {cf_inst_res['normal_score']}% → {cf_inst_res['blind_score']}%")
        print(f"  Normal rank → Counterfactual rank: #{cf_inst_res['normal_rank']} → #{cf_inst_res['blind_rank']} (Shift: {cf_inst_res['rank_change']})")
        print(f"  Potential Sensitivity Risk: {cf_inst_res['risk_level'].upper()}")
        print(f"  AI Explanation brief:")
        print(f"    \"{cf_inst_res['explanation']}\"")
    else:
        print(f"  [!] Failed: {cf_inst_res}")

    # 7. Execute Counterfactual Test on Ada Lovelace (Attribute: Career Gap)
    print("\n[*] Executing Counterfactual Test for Ada Lovelace (Tested Attribute: Career Gap)...")
    cf_gap = {
        "candidate_id": cand_ids[0],
        "opportunity_id": opp_id,
        "tested_attribute": "career_gap",
        "counterfactual_value": "none"
    }
    status, cf_gap_res = make_request("/bias/counterfactual", "POST", cf_gap)
    if status == 200:
        print("\nCOUNTERFACTUAL GAP RESULT:")
        print(f"  Candidate: Ada Lovelace")
        print(f"  Attribute tested: {cf_gap_res['tested_attribute']}")
        print(f"  Original value: '{cf_gap_res['original_value']}'")
        print(f"  Counterfactual value: '{cf_gap_res['counterfactual_value']}'")
        print(f"  Capability data unchanged: {cf_gap_res['capability_data_unchanged']}")
        print(f"  Normal score → Counterfactual score: {cf_gap_res['normal_score']}% → {cf_gap_res['blind_score']}%")
        print(f"  Normal rank → Counterfactual rank: #{cf_gap_res['normal_rank']} → #{cf_gap_res['blind_rank']} (Shift: {cf_gap_res['rank_change']})")
        print(f"  Potential Sensitivity Risk: {cf_gap_res['risk_level'].upper()}")
        print(f"  AI Explanation brief:")
        print(f"    \"{cf_gap_res['explanation']}\"")
    else:
        print(f"  [!] Failed: {cf_gap_res}")

    print("\n==================================================")
    print(" ALL PHASE 4 LIVE API VERIFICATIONS COMPLETED!")
    print("==================================================")

if __name__ == "__main__":
    verify_bias_pipeline()
