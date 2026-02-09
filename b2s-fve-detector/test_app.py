"""Testy pro FVE Detector API."""
import json
from io import BytesIO
from app import app


def run_tests():
    client = app.test_client()

    # Test 1: GET /health
    print("=== TEST 1: GET /health ===")
    r = client.get("/health")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.get_json()}")
    assert r.status_code == 200
    print("  PASS")

    # Test 2: POST /analyze bez souboru
    print("\n=== TEST 2: POST /analyze (bez souboru) ===")
    r = client.post("/analyze")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.get_json()}")
    assert r.status_code == 400
    print("  PASS")

    # Test 3: POST /analyze špatný formát
    print("\n=== TEST 3: POST /analyze (špatný formát .txt) ===")
    r = client.post("/analyze", data={"file": (BytesIO(b"not an image"), "test.txt")})
    print(f"  Status: {r.status_code}")
    print(f"  Response: {r.get_json()}")
    assert r.status_code == 400
    print("  PASS")

    # Test 4: POST /analyze s termálním snímkem (Claude Vision API)
    print("\n=== TEST 4: POST /analyze (termální snímek → Claude Vision) ===")
    with open("test_thermal.png", "rb") as f:
        r = client.post("/analyze", data={"file": (f, "thermal.png")})
    print(f"  Status: {r.status_code}")
    data = r.get_json()
    print(json.dumps(data, indent=2, ensure_ascii=False))
    assert r.status_code == 200
    assert "analysis" in data
    print("  PASS")

    print("\n=== VŠECHNY TESTY PROŠLY ===")


if __name__ == "__main__":
    run_tests()
