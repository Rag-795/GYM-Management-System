import requests
import json

# Test the equipment API endpoint
try:
    response = requests.get("http://localhost:5000/api/equipment")
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Equipment count: {len(data.get('equipment', []))}")
    
except Exception as e:
    print(f"Error: {e}")