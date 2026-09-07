import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            err_json = json.loads(body)
            detail = err_json.get("detail", body)
        except Exception:
            detail = body
        print(f"[-] HTTP Error {e.code} on {method} {path}: {detail}")
        return e.code, {"error": detail}
    except Exception as e:
        print(f"[-] Connection Error on {method} {path}: {e}")
        return 500, {"error": str(e)}

def run_tests():
    print("==================================================")
    print(" OPPORTUNITY DNA - AUTOMATED FOUNDATION TEST")
    print("==================================================")

    # 1. Health Check
    print("[*] Testing health check endpoint...")
    status, res = make_request("/health")
    if status == 200 and res.get("status") == "ok":
        print(f"[+] Health check: PASS (Backend running since {res.get('timestamp')})")
    else:
        print("[-] Health check: FAIL. Ensure the backend server is running on port 8000.")
        sys.exit(1)

    # 2. Seed Skills
    print("\n[*] Seeding test skills...")
    _, python_skill = make_request("/skills", "POST", {"name": "Python 3.13", "category": "Backend", "description": "Backend language"})
    _, react_skill = make_request("/skills", "POST", {"name": "React Hooks", "category": "Frontend", "description": "Component UI"})
    print(f"[+] Seeded Skill 1: {python_skill.get('name')} (ID: {python_skill.get('id')})")
    print(f"[+] Seeded Skill 2: {react_skill.get('name')} (ID: {react_skill.get('id')})")

    # 3. Create Candidate
    print("\n[*] Creating candidate profile...")
    cand_payload = {
        "name": "Sarah Jenkins",
        "email": "sarah.jenkins@example.org",
        "location": "Seattle, WA",
        "institution": "Northwest University",
        "gender": "Female",
        "age": 31,
        "career_gap_info": "Returned from 2 years career gap for family care",
        "github_url": "https://github.com/jenkins-sarah"
    }
    status, candidate = make_request("/candidates", "POST", cand_payload)
    if status == 200:
        print(f"[+] Candidate created: PASS (ID: {candidate.get('id')}, Name: {candidate.get('name')})")
    else:
        # If candidate already exists, fetch the list and pick the first one
        print("[!] Candidate might already exist, fetching candidates list...")
        status, candidates = make_request("/candidates")
        if candidates:
            candidate = candidates[0]
            print(f"[+] Retrieved existing candidate (ID: {candidate.get('id')}, Name: {candidate.get('name')})")
        else:
            print("[-] Candidate creation: FAIL.")
            sys.exit(1)

    # 4. Create Opportunity
    print("\n[*] Creating job opportunity profile...")
    opp_payload = {
        "title": "Software Systems Engineer",
        "company": "NextGen Logistics",
        "description": "Develop high-throughput services and user dashboards.",
        "required_skills": [
            {"skill_id": python_skill.get("id"), "importance": 1.0, "required_level": "Expert"},
            {"skill_id": react_skill.get("id"), "importance": 0.8, "required_level": "Intermediate"}
        ]
    }
    status, opportunity = make_request("/opportunities", "POST", opp_payload)
    if status == 200:
        print(f"[+] Opportunity created: PASS (ID: {opportunity.get('id')}, Title: {opportunity.get('title')})")
    else:
        # Fetch if already exists
        status, opportunities = make_request("/opportunities")
        if opportunities:
            opportunity = opportunities[0]
            print(f"[+] Retrieved existing opportunity (ID: {opportunity.get('id')}, Title: {opportunity.get('title')})")
        else:
            print("[-] Opportunity creation: FAIL.")
            sys.exit(1)

    # 5. Run Matcher
    print("\n[*] Running overlap matching engine...")
    cand_id = candidate.get("id")
    opp_id = opportunity.get("id")
    status, match = make_request(f"/matching/match?candidate_id={cand_id}&opportunity_id={opp_id}", "POST")
    if status == 200:
        print(f"[+] Match Recommendation calculated: PASS (Score: {int(match.get('match_score') * 100)}%)")
        print(f"    Explanation: {match.get('explanation')}")
    else:
        print("[-] Matcher run: FAIL.")
        sys.exit(1)

    # 6. Run Bias Audit
    print("\n[*] Running counterfactual bias audit...")
    status, audit = make_request(f"/matching/audit/{cand_id}/{opp_id}")
    if status == 200:
        print(f"[+] Bias Audit completed: PASS")
        print(f"    Normal Score: {int(audit.get('normal_score') * 100)}%")
        print(f"    Blind Score: {int(audit.get('blind_score') * 100)}%")
        print(f"    Score Delta: {int(audit.get('score_delta') * 100)}% (Proxy removal gain)")
        print(f"    Audited proxy elements: {audit.get('affected_attributes')}")
        print(f"    Audit Risk Assessment: {audit.get('risk_level').upper()}")
        print(f"    Audit rationale: {audit.get('explanation')}")
    else:
        print("[-] Bias Audit run: FAIL.")
        sys.exit(1)

    print("\n==================================================")
    print(" ALL API VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
