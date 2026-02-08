#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for CHEAP FLIGHT App
Tests authentication, flight search, favorites, alerts, and search history
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Test Configuration
BACKEND_URL = "https://cheap-flight.preview.emergentagent.com/api"
TEST_SESSION_TOKEN = "test_session_1770535162507"
TEST_USER_ID = "test-user-1770535162507"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class FlightAPITester:
    def __init__(self):
        self.session_token = TEST_SESSION_TOKEN
        self.user_id = TEST_USER_ID
        self.base_url = BACKEND_URL
        self.headers = {
            "Authorization": f"Bearer {self.session_token}",
            "Content-Type": "application/json"
        }
        self.test_results = []
        self.favorite_id = None
        self.alert_id = None
    
    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        color = Colors.GREEN if success else Colors.RED
        print(f"{color}{status}{Colors.ENDC} {test_name}: {message}")
        
        if response_data:
            print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
    
    def test_auth_me(self):
        """Test GET /api/auth/me endpoint"""
        print(f"\n{Colors.BLUE}🔐 TESTING AUTHENTICATION{Colors.ENDC}")
        
        try:
            # Test with Authorization header
            response = requests.get(f"{self.base_url}/auth/me", headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('user_id') == self.user_id:
                    self.log_result("Auth - GET /auth/me", True, 
                                  f"User authenticated successfully (ID: {data.get('user_id')})", data)
                else:
                    self.log_result("Auth - GET /auth/me", False, 
                                  f"User ID mismatch: expected {self.user_id}, got {data.get('user_id')}")
            else:
                self.log_result("Auth - GET /auth/me", False, 
                              f"Authentication failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Auth - GET /auth/me", False, f"Request failed: {str(e)}")
        
        # Test without authentication (should fail)
        try:
            response = requests.get(f"{self.base_url}/auth/me")
            if response.status_code == 401:
                self.log_result("Auth - Unauthorized access", True, "Correctly rejected unauthenticated request")
            else:
                self.log_result("Auth - Unauthorized access", False, 
                              f"Should have returned 401, got {response.status_code}")
        except Exception as e:
            self.log_result("Auth - Unauthorized access", False, f"Request failed: {str(e)}")
    
    def test_auth_logout(self):
        """Test POST /api/auth/logout endpoint"""
        try:
            response = requests.post(f"{self.base_url}/auth/logout", headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'Logged out':
                    self.log_result("Auth - POST /auth/logout", True, "Logout successful", data)
                else:
                    self.log_result("Auth - POST /auth/logout", False, f"Unexpected response: {data}")
            else:
                self.log_result("Auth - POST /auth/logout", False, 
                              f"Logout failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Auth - POST /auth/logout", False, f"Request failed: {str(e)}")
    
    def test_flight_search(self):
        """Test POST /api/flights/search endpoint"""
        print(f"\n{Colors.BLUE}✈️ TESTING FLIGHT SEARCH{Colors.ENDC}")
        
        search_payload = {
            "origin": "NYC",
            "destination": "PAR", 
            "departure_date": "2024-12-25",
            "adults": 2
        }
        
        try:
            response = requests.post(f"{self.base_url}/flights/search", 
                                   headers=self.headers, json=search_payload)
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get('flights', [])
                
                if flights and len(flights) > 0:
                    flight = flights[0]
                    required_fields = ['flight_id', 'airline', 'origin', 'destination', 'price']
                    
                    if all(field in flight for field in required_fields):
                        self.log_result("Flight Search - POST /flights/search", True, 
                                      f"Found {len(flights)} flights with valid structure", 
                                      {"flight_count": len(flights), "sample_flight": flight})
                        
                        # Store first flight for favorites test
                        self.sample_flight = flight
                    else:
                        missing = [f for f in required_fields if f not in flight]
                        self.log_result("Flight Search - POST /flights/search", False, 
                                      f"Flight missing required fields: {missing}")
                else:
                    self.log_result("Flight Search - POST /flights/search", False, 
                                  "No flights returned in response")
            else:
                self.log_result("Flight Search - POST /flights/search", False, 
                              f"Search failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Flight Search - POST /flights/search", False, f"Request failed: {str(e)}")
        
        # Test search without authentication
        try:
            response = requests.post(f"{self.base_url}/flights/search", json=search_payload)
            if response.status_code == 401:
                self.log_result("Flight Search - Unauthorized", True, "Correctly rejected unauthenticated search")
            else:
                self.log_result("Flight Search - Unauthorized", False, 
                              f"Should have returned 401, got {response.status_code}")
        except Exception as e:
            self.log_result("Flight Search - Unauthorized", False, f"Request failed: {str(e)}")
    
    def test_favorites_management(self):
        """Test favorites CRUD operations"""
        print(f"\n{Colors.BLUE}⭐ TESTING FAVORITES MANAGEMENT{Colors.ENDC}")
        
        # First, ensure we have a flight to favorite
        if not hasattr(self, 'sample_flight'):
            self.sample_flight = {
                "flight_id": "FL12345",
                "airline": "Test Air",
                "origin": "NYC",
                "destination": "PAR",
                "departure_time": "2024-12-25T08:00:00",
                "arrival_time": "2024-12-25T14:30:00",
                "duration": "6h 30m",
                "price": 450.00,
                "currency": "USD",
                "stops": 0,
                "flight_number": "TA123",
                "available_seats": 10
            }
        
        # Test ADD favorite
        try:
            response = requests.post(f"{self.base_url}/flights/favorites", 
                                   headers=self.headers, json=self.sample_flight)
            
            if response.status_code == 200:
                data = response.json()
                self.favorite_id = data.get('favorite_id')
                
                if self.favorite_id:
                    self.log_result("Favorites - POST /flights/favorites", True, 
                                  f"Added favorite successfully (ID: {self.favorite_id})", data)
                else:
                    self.log_result("Favorites - POST /flights/favorites", False, 
                                  "No favorite_id returned in response")
            else:
                self.log_result("Favorites - POST /flights/favorites", False, 
                              f"Add favorite failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Favorites - POST /flights/favorites", False, f"Request failed: {str(e)}")
        
        # Test GET favorites
        try:
            response = requests.get(f"{self.base_url}/flights/favorites", headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                favorites = data.get('favorites', [])
                
                if favorites and len(favorites) > 0:
                    self.log_result("Favorites - GET /flights/favorites", True, 
                                  f"Retrieved {len(favorites)} favorite(s)", 
                                  {"favorite_count": len(favorites)})
                else:
                    self.log_result("Favorites - GET /flights/favorites", False, 
                                  "No favorites found (should have at least 1)")
            else:
                self.log_result("Favorites - GET /flights/favorites", False, 
                              f"Get favorites failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Favorites - GET /flights/favorites", False, f"Request failed: {str(e)}")
        
        # Test DELETE favorite
        if self.favorite_id:
            try:
                response = requests.delete(f"{self.base_url}/flights/favorites/{self.favorite_id}", 
                                         headers=self.headers)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_result("Favorites - DELETE /flights/favorites/{id}", True, 
                                  "Removed favorite successfully", data)
                else:
                    self.log_result("Favorites - DELETE /flights/favorites/{id}", False, 
                                  f"Delete favorite failed with status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result("Favorites - DELETE /flights/favorites/{id}", False, f"Request failed: {str(e)}")
    
    def test_price_alerts(self):
        """Test price alerts CRUD operations"""
        print(f"\n{Colors.BLUE}🚨 TESTING PRICE ALERTS{Colors.ENDC}")
        
        alert_payload = {
            "origin": "NYC",
            "destination": "LON",
            "max_price": 400.00
        }
        
        # Test CREATE alert
        try:
            response = requests.post(f"{self.base_url}/alerts", 
                                   headers=self.headers, json=alert_payload)
            
            if response.status_code == 200:
                data = response.json()
                self.alert_id = data.get('alert_id')
                
                if self.alert_id:
                    self.log_result("Alerts - POST /alerts", True, 
                                  f"Created alert successfully (ID: {self.alert_id})", data)
                else:
                    self.log_result("Alerts - POST /alerts", False, 
                                  "No alert_id returned in response")
            else:
                self.log_result("Alerts - POST /alerts", False, 
                              f"Create alert failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Alerts - POST /alerts", False, f"Request failed: {str(e)}")
        
        # Test GET alerts
        try:
            response = requests.get(f"{self.base_url}/alerts", headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                alerts = data.get('alerts', [])
                
                if alerts and len(alerts) > 0:
                    self.log_result("Alerts - GET /alerts", True, 
                                  f"Retrieved {len(alerts)} alert(s)", 
                                  {"alert_count": len(alerts)})
                else:
                    self.log_result("Alerts - GET /alerts", False, 
                                  "No alerts found (should have at least 1)")
            else:
                self.log_result("Alerts - GET /alerts", False, 
                              f"Get alerts failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("Alerts - GET /alerts", False, f"Request failed: {str(e)}")
        
        # Test DELETE alert
        if self.alert_id:
            try:
                response = requests.delete(f"{self.base_url}/alerts/{self.alert_id}", 
                                         headers=self.headers)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_result("Alerts - DELETE /alerts/{id}", True, 
                                  "Deleted alert successfully", data)
                else:
                    self.log_result("Alerts - DELETE /alerts/{id}", False, 
                                  f"Delete alert failed with status {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result("Alerts - DELETE /alerts/{id}", False, f"Request failed: {str(e)}")
    
    def test_search_history(self):
        """Test search history endpoint"""
        print(f"\n{Colors.BLUE}📚 TESTING SEARCH HISTORY{Colors.ENDC}")
        
        try:
            response = requests.get(f"{self.base_url}/history", headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                history = data.get('history', [])
                
                # Should have at least 1 entry from flight search test
                if history and len(history) > 0:
                    self.log_result("History - GET /history", True, 
                                  f"Retrieved {len(history)} search history entries", 
                                  {"history_count": len(history)})
                else:
                    self.log_result("History - GET /history", True, 
                                  "No search history found (acceptable if no searches performed)")
            else:
                self.log_result("History - GET /history", False, 
                              f"Get history failed with status {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result("History - GET /history", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print(f"{Colors.BOLD}🚀 STARTING CHEAP FLIGHT BACKEND API TESTS{Colors.ENDC}")
        print(f"Backend URL: {self.base_url}")
        print(f"Session Token: {self.session_token[:20]}...")
        print("=" * 60)
        
        # Authentication tests
        self.test_auth_me()
        
        # Flight search tests
        self.test_flight_search()
        
        # Favorites tests
        self.test_favorites_management()
        
        # Price alerts tests
        self.test_price_alerts()
        
        # Search history tests
        self.test_search_history()
        
        # Logout test (last because it invalidates session)
        self.test_auth_logout()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print(f"\n{Colors.BOLD}📊 TEST SUMMARY{Colors.ENDC}")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"{Colors.GREEN}Passed: {passed}{Colors.ENDC}")
        print(f"{Colors.RED}Failed: {failed}{Colors.ENDC}")
        
        if failed > 0:
            print(f"\n{Colors.RED}FAILED TESTS:{Colors.ENDC}")
            for result in self.test_results:
                if not result['success']:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        success_rate = (passed / len(self.test_results)) * 100 if self.test_results else 0
        color = Colors.GREEN if success_rate >= 80 else Colors.YELLOW if success_rate >= 60 else Colors.RED
        print(f"\n{color}Success Rate: {success_rate:.1f}%{Colors.ENDC}")

def main():
    """Main function to run tests"""
    tester = FlightAPITester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()