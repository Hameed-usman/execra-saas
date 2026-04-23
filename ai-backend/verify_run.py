import requests
import json

url = "http://localhost:8000/agent/run"
payload = {
    "goal": "Find 3 B2B SaaS investors in London",
    "tenant_id": "4235a8b0-b45d-489b-8c11-4cd3da9d2506"
}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
