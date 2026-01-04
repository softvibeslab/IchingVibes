#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for I Ching Oracle
Tests all authentication and I Ching endpoints with real data
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://iching-oraculo.preview.emergentagent.com/api"
TEST_USER_EMAIL = "maria.gonzalez@example.com"
TEST_USER_PASSWORD = "MiClave123!"
TEST_USER_NAME = "María González"

# Global variables for test state
auth_token = None
user_id = None
reading_id = None

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   {details}")
    print()

def test_health_check():
    """Test root endpoint health check"""
    try:
        response = requests.get(f"{BASE_URL}/")
        success = response.status_code == 200
        
        if success:
            data = response.json()
            details = f"Status: {response.status_code}, Message: {data.get('message', 'N/A')}"
        else:
            details = f"Status: {response.status_code}, Error: {response.text}"
            
        print_test_result("Health Check (GET /api/)", success, details)
        return success
    except Exception as e:
        print_test_result("Health Check (GET /api/)", False, f"Exception: {str(e)}")
        return False

def test_user_registration():
    """Test user registration"""
    global auth_token
    
    try:
        user_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "name": TEST_USER_NAME
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        success = response.status_code == 201
        
        if success:
            data = response.json()
            auth_token = data.get("access_token")
            details = f"Status: {response.status_code}, Token received: {'Yes' if auth_token else 'No'}"
        else:
            # Check if user already exists
            if response.status_code == 400 and "ya está registrado" in response.text:
                details = f"Status: {response.status_code}, User already exists (expected)"
                success = True  # This is acceptable for testing
            else:
                details = f"Status: {response.status_code}, Error: {response.text}"
                
        print_test_result("User Registration (POST /api/auth/register)", success, details)
        return success
    except Exception as e:
        print_test_result("User Registration (POST /api/auth/register)", False, f"Exception: {str(e)}")
        return False

def test_user_login():
    """Test user login"""
    global auth_token
    
    try:
        credentials = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        response = requests.post(f"{BASE_URL}/auth/login", json=credentials)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            auth_token = data.get("access_token")
            details = f"Status: {response.status_code}, Token received: {'Yes' if auth_token else 'No'}"
        else:
            details = f"Status: {response.status_code}, Error: {response.text}"
            
        print_test_result("User Login (POST /api/auth/login)", success, details)
        return success
    except Exception as e:
        print_test_result("User Login (POST /api/auth/login)", False, f"Exception: {str(e)}")
        return False

def test_get_current_user():
    """Test getting current user info"""
    global user_id
    
    if not auth_token:
        print_test_result("Get Current User (GET /api/auth/me)", False, "No auth token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            user_id = data.get("id")
            details = f"Status: {response.status_code}, User: {data.get('name', 'N/A')} ({data.get('email', 'N/A')})"
        else:
            details = f"Status: {response.status_code}, Error: {response.text}"
            
        print_test_result("Get Current User (GET /api/auth/me)", success, details)
        return success
    except Exception as e:
        print_test_result("Get Current User (GET /api/auth/me)", False, f"Exception: {str(e)}")
        return False

def test_get_hexagram():
    """Test getting specific hexagram"""
    try:
        # Test valid hexagram
        response = requests.get(f"{BASE_URL}/hexagrams/30")
        success = response.status_code == 200
        
        if success:
            data = response.json()
            title = data.get("title", "N/A")
            chinese = data.get("chinese", "N/A")
            details = f"Status: {response.status_code}, Hexagram 30: {title} ({chinese})"
        else:
            details = f"Status: {response.status_code}, Error: {response.text}"
            
        print_test_result("Get Hexagram (GET /api/hexagrams/30)", success, details)
        
        # Test invalid hexagram
        response_invalid = requests.get(f"{BASE_URL}/hexagrams/65")
        invalid_success = response_invalid.status_code == 400
        
        if invalid_success:
            details_invalid = f"Status: {response_invalid.status_code}, Correctly rejected invalid hexagram number"
        else:
            details_invalid = f"Status: {response_invalid.status_code}, Should have rejected invalid number"
            
        print_test_result("Get Invalid Hexagram (GET /api/hexagrams/65)", invalid_success, details_invalid)
        
        return success and invalid_success
    except Exception as e:
        print_test_result("Get Hexagram (GET /api/hexagrams/30)", False, f"Exception: {str(e)}")
        return False

def test_create_reading():
    """Test creating a new I Ching reading"""
    global reading_id
    
    if not auth_token:
        print_test_result("Create Reading (POST /api/readings)", False, "No auth token available")
        return False
    
    try:
        reading_data = {
            "question": "¿Cuál es mi camino en la vida?",
            "throws": [
                {"coins": [3, 3, 2], "sum": 8, "line_type": "yin_fija", "line_value": 0},
                {"coins": [3, 2, 2], "sum": 7, "line_type": "yang_fija", "line_value": 1},
                {"coins": [3, 3, 3], "sum": 9, "line_type": "yang_movil", "line_value": 1},
                {"coins": [2, 2, 2], "sum": 6, "line_type": "yin_movil", "line_value": 0},
                {"coins": [3, 3, 2], "sum": 8, "line_type": "yin_fija", "line_value": 0},
                {"coins": [3, 2, 2], "sum": 7, "line_type": "yang_fija", "line_value": 1}
            ],
            "present_hexagram": 30,
            "future_hexagram": 14,
            "has_changing_lines": True,
            "changing_lines": [3, 4]
        }
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(f"{BASE_URL}/readings", json=reading_data, headers=headers)
        success = response.status_code == 201
        
        if success:
            data = response.json()
            reading_id = data.get("id")
            present_hex = data.get("present_hexagram", {})
            future_hex = data.get("future_hexagram", {})
            details = f"Status: {response.status_code}, Reading created with ID: {reading_id[:8]}..."
            details += f"\nPresent: {present_hex.get('title', 'N/A')}, Future: {future_hex.get('title', 'N/A')}"
        else:
            details = f"Status: {response.status_code}, Error: {response.text}"
            
        print_test_result("Create Reading (POST /api/readings)", success, details)
        return success
    except Exception as e:
        print_test_result("Create Reading (POST /api/readings)", False, f"Exception: {str(e)}")
        return False

def test_get_readings():
    """Test getting user's reading history"""
    if not auth_token:
        print_test_result("Get Readings (GET /api/readings)", False, "No auth token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/readings", headers=headers)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            count = len(data) if isinstance(data, list) else 0
            details = f"Status: {response.status_code}, Found {count} readings"
            if count > 0:
                latest = data[0]
                details += f"\nLatest: {latest.get('question', 'No question')[:50]}..."
        else:
            details = f"Status: {response.status_code}, Error: {response.text}"
            
        print_test_result("Get Readings (GET /api/readings)", success, details)
        return success
    except Exception as e:
        print_test_result("Get Readings (GET /api/readings)", False, f"Exception: {str(e)}")
        return False

def test_get_specific_reading():
    """Test getting a specific reading by ID"""
    if not auth_token:
        print_test_result("Get Specific Reading (GET /api/readings/{id})", False, "No auth token available")
        return False
    
    if not reading_id:
        print_test_result("Get Specific Reading (GET /api/readings/{id})", False, "No reading ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/readings/{reading_id}", headers=headers)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            question = data.get("question", "No question")
            present_hex = data.get("present_hexagram", {})
            details = f"Status: {response.status_code}, Reading: {question[:50]}..."
            details += f"\nHexagram: {present_hex.get('title', 'N/A')}"
        else:
            details = f"Status: {response.status_code}, Error: {response.text}"
            
        print_test_result("Get Specific Reading (GET /api/readings/{id})", success, details)
        return success
    except Exception as e:
        print_test_result("Get Specific Reading (GET /api/readings/{id})", False, f"Exception: {str(e)}")
        return False

def test_unauthorized_access():
    """Test that protected endpoints reject unauthorized requests"""
    try:
        # Test without token
        response1 = requests.get(f"{BASE_URL}/auth/me")
        unauthorized1 = response1.status_code == 401
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token_here"}
        response2 = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        unauthorized2 = response2.status_code == 401
        
        success = unauthorized1 and unauthorized2
        details = f"No token: {response1.status_code}, Invalid token: {response2.status_code}"
        
        print_test_result("Unauthorized Access Protection", success, details)
        return success
    except Exception as e:
        print_test_result("Unauthorized Access Protection", False, f"Exception: {str(e)}")
        return False

def run_all_tests():
    """Run all backend tests in sequence"""
    print("=" * 60)
    print("I CHING ORACLE - BACKEND API TESTS")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Health Check", test_health_check),
        ("User Registration", test_user_registration),
        ("User Login", test_user_login),
        ("Get Current User", test_get_current_user),
        ("Get Hexagram", test_get_hexagram),
        ("Create Reading", test_create_reading),
        ("Get Readings", test_get_readings),
        ("Get Specific Reading", test_get_specific_reading),
        ("Unauthorized Access", test_unauthorized_access),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            time.sleep(0.5)  # Small delay between tests
        except Exception as e:
            print_test_result(test_name, False, f"Unexpected error: {str(e)}")
    
    print("=" * 60)
    print(f"TEST SUMMARY: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Backend API is working correctly.")
    else:
        print(f"⚠️  {total - passed} tests failed. Check the details above.")
    
    return passed == total

if __name__ == "__main__":
    run_all_tests()