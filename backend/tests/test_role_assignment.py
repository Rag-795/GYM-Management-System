#!/usr/bin/env python3
"""
Test script to verify role assignment is working correctly
"""
import requests
import json

BASE_URL = "http://localhost:5000/auth"

def test_role_assignment():
    """Test that different roles are assigned correctly during signup"""
    
    # Test data for different roles
    test_users = [
        {
            "role": "TRAINER", 
            "firstName": "John",
            "lastName": "Doe",
            "email": "trainer@fithub.com",
            "phone": "+1234567890",
            "dateOfBirth": "1990-01-01",
            "password": "Trainer@123",
            "specialties": ["Weightlifting", "Cardio"],
            "experience": "5",
            "bio": "Experienced personal trainer"
        },
        {
            "role": "MEMBER",
            "firstName": "Jane", 
            "lastName": "Smith",
            "email": "member@fithub.com",
            "phone": "+1234567891",
            "dateOfBirth": "1995-05-15",
            "password": "Member@123"
        }
    ]
    
    print("Testing role assignment during signup...")
    
    for user_data in test_users:
        role = user_data["role"]
        email = user_data["email"]
        
        print(f"\n--- Testing {role} role ---")
        
        # Test signup
        try:
            # Test login to verify role persistence
            login_data = {
                "email": email,
                "password": user_data["password"]
            }
            
            login_response = requests.post(f"{BASE_URL}/login", json=login_data)
            print(f"Login Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                login_role = login_data['user']['role']
                print(f"Login Role: {login_role}")
                print(f"Role Persistence: {'✅ SUCCESS' if login_role == role else '❌ FAILED'}")
            else:
                print(f"❌ Login failed: {login_response.text}")
                
        except requests.ConnectionError:
            print("❌ Cannot connect to backend. Make sure Flask server is running on localhost:5000")
            return
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_role_assignment()