"""
Test script for FitHub API endpoints
Run this after starting the Flask server to test the authentication endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health Check: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_login(email, password):
    """Test login endpoint"""
    try:
        data = {
            "email": email,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=data)
        print(f"\nLogin Test ({email}): {response.status_code}")
        result = response.json()
        print(json.dumps(result, indent=2))
        
        if response.status_code == 200:
            return result.get('token')
        return None
    except Exception as e:
        print(f"Login test failed: {e}")
        return None

def test_signup():
    """Test signup endpoint"""
    try:
        data = {
            "firstName": "Test",
            "lastName": "User",
            "email": "testuser@example.com",
            "phone": "5551234567",
            "dateOfBirth": "1990-01-01",
            "password": "TestPassword@123"
        }
        response = requests.post(f"{BASE_URL}/auth/signup", json=data)
        print(f"\nSignup Test: {response.status_code}")
        result = response.json()
        print(json.dumps(result, indent=2))
        
        if response.status_code == 201:
            return result.get('token')
        return None
    except Exception as e:
        print(f"Signup test failed: {e}")
        return None

def test_protected_route(token):
    """Test protected route (/auth/me)"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"\nProtected Route Test: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"Protected route test failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing FitHub API Endpoints")
    print("=" * 50)
    
    # Test health
    if not test_health():
        print("Server is not running or health check failed!")
        exit(1)
    
    # Test login with dummy users
    admin_token = test_login("admin@fithub.com", "Admin@123")
    trainer_token = test_login("trainer@fithub.com", "Trainer@123")
    member_token = test_login("member@fithub.com", "Member@123")
    
    # Test signup
    new_user_token = test_signup()
    
    # Test protected routes
    if admin_token:
        test_protected_route(admin_token)
    
    print("\n" + "=" * 50)
    print("API Testing Complete!")
    print("\nDummy user credentials:")
    print("Admin: admin@fithub.com / Admin@123")
    print("Trainer: trainer@fithub.com / Trainer@123")
    print("Member: member@fithub.com / Member@123")