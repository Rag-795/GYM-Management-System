import requests
import json

# Test the equipment API endpoint
try:
    response = requests.get("http://localhost:5000/api/equipment")
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success! Equipment data received:")
        print(f"Equipment count: {len(data.get('equipment', []))}")
        print(f"Total: {data.get('total', 0)}")
        print(f"Response structure: {list(data.keys())}")
    else:
        print(f"Error Response: {response.text}")
    
except Exception as e:
    print(f"Error: {e}")