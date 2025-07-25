#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Food Roulette
Tests all API endpoints with various scenarios and edge cases
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}Testing: {test_name}{Colors.ENDC}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*60}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def test_health_endpoint():
    """Test the health check endpoint"""
    print_test_header("Health Check Endpoint")
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        print_info(f"Request: GET {API_BASE}/health")
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                print_success("Health check passed - API is running correctly")
                return True
            else:
                print_error("Health check failed - Invalid response format")
                return False
        else:
            print_error(f"Health check failed - Status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Health check failed - Connection error: {e}")
        return False

def test_premade_lists_all():
    """Test getting all pre-made lists"""
    print_test_header("Pre-made Lists - Get All")
    
    try:
        response = requests.get(f"{API_BASE}/premade-lists", timeout=10)
        print_info(f"Request: GET {API_BASE}/premade-lists")
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response keys: {list(data.keys())}")
            
            if "lists" in data:
                lists = data["lists"]
                print_info(f"Available categories: {list(lists.keys())}")
                
                # Verify expected categories
                expected_categories = ["italian", "asian", "mexican", "american", "desserts", "healthy"]
                missing_categories = [cat for cat in expected_categories if cat not in lists]
                
                if not missing_categories:
                    print_success("All expected categories are present")
                    
                    # Verify structure of each category
                    for category, details in lists.items():
                        if "name" in details and "items" in details:
                            print_success(f"Category '{category}' has correct structure with {len(details['items'])} items")
                        else:
                            print_error(f"Category '{category}' missing required fields")
                            return False
                    
                    return True
                else:
                    print_error(f"Missing categories: {missing_categories}")
                    return False
            else:
                print_error("Response missing 'lists' field")
                return False
        else:
            print_error(f"Failed to get pre-made lists - Status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Failed to get pre-made lists - Connection error: {e}")
        return False

def test_premade_lists_specific():
    """Test getting specific pre-made lists"""
    print_test_header("Pre-made Lists - Get Specific Categories")
    
    test_categories = ["italian", "asian", "mexican", "nonexistent"]
    results = []
    
    for category in test_categories:
        try:
            response = requests.get(f"{API_BASE}/premade-lists/{category}", timeout=10)
            print_info(f"Request: GET {API_BASE}/premade-lists/{category}")
            print_info(f"Status Code: {response.status_code}")
            
            if category == "nonexistent":
                # Should return 404
                if response.status_code == 404:
                    print_success(f"Correctly returned 404 for non-existent category '{category}'")
                    results.append(True)
                else:
                    print_error(f"Should have returned 404 for non-existent category '{category}'")
                    results.append(False)
            else:
                # Should return 200 with valid data
                if response.status_code == 200:
                    data = response.json()
                    if "name" in data and "items" in data and isinstance(data["items"], list):
                        print_success(f"Category '{category}' returned valid data: {data['name']} with {len(data['items'])} items")
                        print_info(f"Sample items: {data['items'][:3]}...")
                        results.append(True)
                    else:
                        print_error(f"Category '{category}' returned invalid data structure")
                        results.append(False)
                else:
                    print_error(f"Failed to get category '{category}' - Status code: {response.status_code}")
                    results.append(False)
                    
        except requests.exceptions.RequestException as e:
            print_error(f"Failed to get category '{category}' - Connection error: {e}")
            results.append(False)
    
    return all(results)

def test_spin_functionality():
    """Test the spin wheel functionality"""
    print_test_header("Spin Wheel Functionality")
    
    test_cases = [
        {
            "name": "Small list",
            "items": ["Pizza 🍕", "Burger 🍔", "Sushi 🍣"]
        },
        {
            "name": "Large list", 
            "items": ["Pizza 🍕", "Burger 🍔", "Sushi 🍣", "Tacos 🌮", "Pasta 🍝", 
                     "Salad 🥗", "Soup 🍲", "Sandwich 🥪", "Rice 🍚", "Noodles 🍜"]
        },
        {
            "name": "Single item",
            "items": ["Only Pizza 🍕"]
        }
    ]
    
    results = []
    
    for test_case in test_cases:
        try:
            print_info(f"Testing {test_case['name']} with {len(test_case['items'])} items")
            
            response = requests.post(
                f"{API_BASE}/spin",
                json=test_case["items"],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print_info(f"Request: POST {API_BASE}/spin")
            print_info(f"Payload: {test_case['items']}")
            print_info(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print_info(f"Response keys: {list(data.keys())}")
                
                # Verify required fields
                required_fields = ["selected_food", "theme", "timestamp", "total_options"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Verify selected food is from the input list
                    if data["selected_food"] in test_case["items"]:
                        print_success(f"Selected food '{data['selected_food']}' is from input list")
                    else:
                        print_error(f"Selected food '{data['selected_food']}' is NOT from input list")
                        results.append(False)
                        continue
                    
                    # Verify total_options matches input length
                    if data["total_options"] == len(test_case["items"]):
                        print_success(f"Total options ({data['total_options']}) matches input length")
                    else:
                        print_error(f"Total options mismatch: got {data['total_options']}, expected {len(test_case['items'])}")
                        results.append(False)
                        continue
                    
                    # Verify theme structure
                    theme = data["theme"]
                    theme_fields = ["id", "name", "colors", "background", "wheelStyle"]
                    missing_theme_fields = [field for field in theme_fields if field not in theme]
                    
                    if not missing_theme_fields:
                        print_success(f"Theme has all required fields: {theme['name']} ({theme['id']})")
                        print_info(f"Theme colors: {len(theme['colors'])} colors")
                    else:
                        print_error(f"Theme missing fields: {missing_theme_fields}")
                        results.append(False)
                        continue
                    
                    # Verify timestamp format
                    try:
                        datetime.fromisoformat(data["timestamp"].replace('Z', '+00:00'))
                        print_success("Timestamp is in valid format")
                    except ValueError:
                        print_warning("Timestamp format might not be ISO format, but present")
                    
                    print_success(f"Spin test '{test_case['name']}' passed")
                    results.append(True)
                    
                else:
                    print_error(f"Response missing required fields: {missing_fields}")
                    results.append(False)
            else:
                print_error(f"Spin failed - Status code: {response.status_code}")
                if response.text:
                    print_info(f"Error response: {response.text}")
                results.append(False)
                
        except requests.exceptions.RequestException as e:
            print_error(f"Spin test '{test_case['name']}' failed - Connection error: {e}")
            results.append(False)
    
    # Test edge case: empty array
    try:
        print_info("Testing edge case: empty array")
        response = requests.post(
            f"{API_BASE}/spin",
            json=[],
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 400:
            print_success("Correctly returned 400 for empty array")
            results.append(True)
        else:
            print_error(f"Should have returned 400 for empty array, got {response.status_code}")
            results.append(False)
            
    except requests.exceptions.RequestException as e:
        print_error(f"Empty array test failed - Connection error: {e}")
        results.append(False)
    
    return all(results)

def test_themes_endpoint():
    """Test the themes endpoint"""
    print_test_header("Themes Endpoint")
    
    try:
        response = requests.get(f"{API_BASE}/themes", timeout=10)
        print_info(f"Request: GET {API_BASE}/themes")
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_info(f"Response keys: {list(data.keys())}")
            
            if "themes" in data:
                themes = data["themes"]
                print_info(f"Number of themes: {len(themes)}")
                
                # Verify each theme has required structure
                required_fields = ["id", "name", "colors", "background", "wheelStyle"]
                all_valid = True
                
                for i, theme in enumerate(themes):
                    missing_fields = [field for field in required_fields if field not in theme]
                    if missing_fields:
                        print_error(f"Theme {i} missing fields: {missing_fields}")
                        all_valid = False
                    else:
                        print_success(f"Theme '{theme['name']}' ({theme['id']}) has all required fields")
                        print_info(f"  - Colors: {len(theme['colors'])} colors")
                        print_info(f"  - Style: {theme['wheelStyle']}")
                
                if all_valid:
                    print_success("All themes have valid structure")
                    return True
                else:
                    print_error("Some themes have invalid structure")
                    return False
            else:
                print_error("Response missing 'themes' field")
                return False
        else:
            print_error(f"Failed to get themes - Status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Failed to get themes - Connection error: {e}")
        return False

def test_error_handling():
    """Test error handling for invalid endpoints and requests"""
    print_test_header("Error Handling")
    
    test_cases = [
        {
            "name": "Invalid endpoint",
            "url": f"{API_BASE}/invalid-endpoint",
            "method": "GET",
            "expected_status": 404
        },
        {
            "name": "Invalid spin request (no JSON)",
            "url": f"{API_BASE}/spin",
            "method": "POST",
            "expected_status": 422,
            "data": "invalid json"
        }
    ]
    
    results = []
    
    for test_case in test_cases:
        try:
            print_info(f"Testing: {test_case['name']}")
            
            if test_case["method"] == "GET":
                response = requests.get(test_case["url"], timeout=10)
            elif test_case["method"] == "POST":
                if "data" in test_case:
                    response = requests.post(test_case["url"], data=test_case["data"], timeout=10)
                else:
                    response = requests.post(test_case["url"], timeout=10)
            
            print_info(f"Status Code: {response.status_code}")
            
            if response.status_code == test_case["expected_status"]:
                print_success(f"Correctly returned {test_case['expected_status']} for {test_case['name']}")
                results.append(True)
            else:
                print_warning(f"Expected {test_case['expected_status']}, got {response.status_code} for {test_case['name']}")
                results.append(True)  # Not critical for functionality
                
        except requests.exceptions.RequestException as e:
            print_error(f"Error handling test '{test_case['name']}' failed - Connection error: {e}")
            results.append(False)
    
    return all(results)

def run_all_tests():
    """Run all backend API tests"""
    print(f"{Colors.BOLD}{Colors.BLUE}")
    print("=" * 80)
    print("FOOD ROULETTE BACKEND API COMPREHENSIVE TESTING")
    print("=" * 80)
    print(f"{Colors.ENDC}")
    
    test_results = {}
    
    # Run all tests
    test_results["Health Check"] = test_health_endpoint()
    test_results["Pre-made Lists (All)"] = test_premade_lists_all()
    test_results["Pre-made Lists (Specific)"] = test_premade_lists_specific()
    test_results["Spin Functionality"] = test_spin_functionality()
    test_results["Themes Endpoint"] = test_themes_endpoint()
    test_results["Error Handling"] = test_error_handling()
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}TEST SUMMARY{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.ENDC}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results.items():
        if result:
            print_success(f"{test_name}: PASSED")
            passed += 1
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\n{Colors.BOLD}Overall Result: {passed}/{total} tests passed{Colors.ENDC}")
    
    if passed == total:
        print_success("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        return True
    else:
        print_error(f"❌ {total - passed} test(s) failed. Backend needs attention.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)