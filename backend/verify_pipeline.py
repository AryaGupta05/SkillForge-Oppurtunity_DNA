import urllib.request
import urllib.parse
import json
import sys
import os

# We will use PyMuPDF to generate a real PDF resume for testing
try:
    import fitz
except ImportError:
    print("[-] fitz (PyMuPDF) is required to run the verification script.")
    sys.exit(1)

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(path, method="GET", data=None, files=None):
    url = f"{BASE_URL}{path}"
    
    if files:
        # Multipart form upload
        boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
        parts = []
        for field_name, (file_name, file_bytes) in files.items():
            parts.append(f"--{boundary}".encode())
            parts.append(f'Content-Disposition: form-data; name="{field_name}"; filename="{file_name}"'.encode())
            parts.append(b"Content-Type: application/pdf")
            parts.append(b"")
            parts.append(file_bytes)
        parts.append(f"--{boundary}--".encode())
        parts.append(b"")
        body = b"\r\n".join(parts)
        headers = {
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Content-Length": str(len(body))
        }
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
    else:
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

def generate_pdf():
    print("[*] Generating test PDF resume using PyMuPDF...")
    doc = fitz.open()
    page = doc.new_page()
    rect = fitz.Rect(50, 50, 550, 750)
    resume_text = """
    Alan Turing
    Email: alan.turing@example.net
    Location: Manchester, UK
    
    [VERIFICATION_TEST_FIXTURE]
    
    PROFESSIONAL EXPERIENCE:
    Lead Cryptanalyst at Bletchley Park (1939 to 1945)
    - Designed and implemented the electromechanical Bombe machine to decrypt Enigma cipher text.
    - Led Hut 8, managing cryptanalysis activities and domain optimization.
    
    Software Engineer at National Physical Laboratory (1945 to 1948)
    - Designed the Automatic Computing Engine (ACE), a pioneering stored-program computer.
    - Programmed early numerical algorithms.
    
    PROJECTS:
    Universal Turing Machine Prototype (1936)
    - Developed mathematical model of general-purpose stored-program computers.
    - Mapped computability constraints and logic boundary conditions.
    """
    page.insert_textbox(rect, resume_text)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def verify_pipeline():
    print("==================================================")
    print(" OPPORTUNITY DNA - PIPELINE INTEGRATION VERIFICATION")
    print("==================================================")

    # 1. Create candidate
    print("\n[*] Registering candidate profile 'Alan Turing'...")
    cand_payload = {
        "name": "Alan Turing",
        "email": "alan.turing@example.net",
        "location": "Manchester, UK",
        "institution": "King's College",
        "gender": "Male",
        "age": 41,
        "career_gap_info": None,
        "github_url": None
    }
    status, candidate = make_request("/candidates", "POST", cand_payload)
    if status == 200:
        print(f"[+] Candidate registered successfully (ID: {candidate.get('id')})")
        cand_id = candidate.get("id")
    else:
        # Fetch list and pick ID if already registered
        status, candidates = make_request("/candidates")
        matched = [c for c in candidates if c.get("email") == cand_payload["email"]]
        if matched:
            cand_id = matched[0].get("id")
            print(f"[+] Using existing candidate (ID: {cand_id})")
        else:
            print("[-] Candidate registration failed.")
            sys.exit(1)

    # 2. Generate and Upload PDF Resume
    pdf_bytes = generate_pdf()
    print(f"[*] Uploading PDF resume for Candidate ID {cand_id}...")
    status, evidence_list = make_request(
        f"/candidates/{cand_id}/resume", 
        "POST", 
        files={"file": ("alan_turing_resume.pdf", pdf_bytes)}
    )
    if status == 200:
        print(f"[+] PDF Upload & Extraction: SUCCESS")
        print(f"    Saved {len(evidence_list)} evidence records. (Raw resume + structured items)")
        for ev in evidence_list:
            print(f"    - [{ev.get('type').upper()}] {ev.get('title')} (Source: {ev.get('source')})")
    else:
        print("[-] PDF resume extraction pipeline failed.")
        sys.exit(1)

    # 3. Trigger Skills Discovery
    print(f"\n[*] Triggering skills discovery agent for Candidate ID {cand_id}...")
    status, skills_list = make_request(f"/candidates/{cand_id}/analyze", "POST")
    if status == 200:
        print(f"[+] Skills Discovery Agent: SUCCESS")
        print(f"    Identified {len(skills_list)} capability skills with supporting evidence:")
        for cs in skills_list:
            skill_name = cs.get("skill", {}).get("name", "Unknown")
            print(f"    - {skill_name} ({cs.get('skill_type').upper()} - Confidence: {int(cs.get('confidence') * 100)}%)")
    else:
        print("[-] Skills discovery pipeline failed.")
        sys.exit(1)

    # 4. Fetch Opportunity DNA Profile
    print(f"\n[*] Requesting Opportunity DNA capability signals for Candidate ID {cand_id}...")
    status, dna = make_request(f"/candidates/{cand_id}/dna")
    if status == 200:
        print("[+] Opportunity DNA profile: PASS")
        print(f"    Skill Depth: {int(dna.get('signals', {}).get('depth') * 100)}%")
        print(f"    Skill Breadth: {int(dna.get('signals', {}).get('breadth') * 100)}%")
        print(f"    Adaptability: {int(dna.get('signals', {}).get('adaptability') * 100)}%")
        print(f"    Evidence Strength: {dna.get('signals', {}).get('evidence_strength')} / 5.0")
        print(f"    Learning Progression Status: {dna.get('signals', {}).get('learning_progression', {}).get('status').upper()}")
        print(f"    Timeline: {dna.get('signals', {}).get('learning_progression', {}).get('timeline')}")
        print(f"    Progression Description: {dna.get('signals', {}).get('learning_progression', {}).get('description')}")
    else:
        print("[-] DNA profile retrieval failed.")
        sys.exit(1)

    # 5. Verify Traceability for the first skill
    if skills_list:
        first_skill_id = skills_list[0].get("skill_id")
        skill_name = skills_list[0].get("skill", {}).get("name", "Unknown")
        print(f"\n[*] Verifying evidence traceability map for skill '{skill_name}' (ID: {first_skill_id})...")
        status, backing_ev = make_request(f"/candidates/{cand_id}/skills/{first_skill_id}/evidence")
        if status == 200:
            print(f"[+] Traceability Map: PASS")
            print(f"    Found {len(backing_ev)} trace links for skill '{skill_name}':")
            for link in backing_ev:
                evidence_title = link.get("evidence", {}).get("title", "Unknown")
                print(f"    - Linked to Evidence: '{evidence_title}'")
                print(f"      AI Rationale: {link.get('relationship')}")
                raw_quote = link.get("evidence", {}).get("raw_content", "")
                if raw_quote:
                    print(f"      Raw resume quote: \"{raw_quote.strip()[:150]}...\"")
        else:
            print("[-] Traceability map query failed.")
            sys.exit(1)

    print("\n==================================================")
    print(" ALL PIPELINE VERIFICATIONS COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    verify_pipeline()
