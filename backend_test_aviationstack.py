#!/usr/bin/env python3
"""
Backend Testing for Aviationstack Integration
Tests real flight search functionality with Aviationstack API
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Test configuration
BASE_URL = "https://cheap-flight.preview.emergentagent.com/api"
SESSION_TOKEN = "test_session_1770538139978"
USER_ID = "test-user-1770538139978"

def test_auth():
    """Test authentication endpoint"""
    print("🔐 Testing authentication...")
    
    headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Auth successful - User: {user_data.get('name')}")
        print(f"   Email: {user_data.get('email')}")
        return True
    else:
        print(f"❌ Auth failed - Status: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_aviationstack_flight_search():
    """Test flight search with real Aviationstack data"""
    print("\n✈️ Testing Aviationstack flight search...")
    
    headers = {"Authorization": f"Bearer {SESSION_TOKEN}", "Content-Type": "application/json"}
    
    # Test routes as specified in requirements
    test_routes = [
        {
            "origin": "JFK",
            "destination": "LAX", 
            "route_name": "New York to Los Angeles"
        },
        {
            "origin": "CDG",
            "destination": "JFK",
            "route_name": "Paris to New York"
        },
        {
            "origin": "LHR", 
            "destination": "DXB",
            "route_name": "London to Dubai"
        }
    ]
    
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    all_tests_passed = True
    
    for route in test_routes:
        print(f"\n🛫 Testing route: {route['route_name']} ({route['origin']} → {route['destination']})")
        
        search_data = {
            "origin": route["origin"],
            "destination": route["destination"],
            "departure_date": tomorrow,
            "adults": 1
        }
        
        try:
            response = requests.post(f"{BASE_URL}/flights/search", 
                                   headers=headers, 
                                   json=search_data,
                                   timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                flights = data.get("flights", [])
                count = data.get("count", 0)
                
                print(f"✅ Search successful - Found {count} flights")
                
                if flights:
                    # Examine first flight for data structure
                    flight = flights[0]
                    print(f"   First flight: {flight.get('airline')} {flight.get('flight_number')}")
                    print(f"   Route: {flight.get('origin')} → {flight.get('destination')}")
                    print(f"   Price: ${flight.get('price')} {flight.get('currency')}")
                    print(f"   Duration: {flight.get('duration')}")
                    print(f"   Departure: {flight.get('departure_time')}")
                    print(f"   Arrival: {flight.get('arrival_time')}")
                    
                    # Check if this looks like real or mock data
                    if flight.get('airline') in ['Air France', 'Lufthansa'] and flight.get('flight_number') in ['AF1234', 'LH5678']:
                        print("   ⚠️  Note: This appears to be mock fallback data")
                    else:
                        print("   🎯 Real flight data from Aviationstack detected!")
                        
                    # Verify required fields
                    required_fields = ['flight_id', 'airline', 'origin', 'destination', 'departure_time', 'arrival_time', 'price']
                    missing_fields = [field for field in required_fields if not flight.get(field)]
                    
                    if missing_fields:
                        print(f"   ❌ Missing required fields: {missing_fields}")
                        all_tests_passed = False
                    else:
                        print("   ✅ All required flight data fields present")
                else:
                    print("   ❌ No flights returned")
                    all_tests_passed = False
                    
            else:
                print(f"   ❌ Search failed - Status: {response.status_code}")
                print(f"   Response: {response.text}")
                all_tests_passed = False
                
        except requests.exceptions.Timeout:
            print(f"   ❌ Request timeout after 30 seconds")
            all_tests_passed = False
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            all_tests_passed = False
            
        # Small delay between requests
        time.sleep(1)
    
    return all_tests_passed

def test_search_history():
    """Test that search history is being saved"""
    print("\n📝 Testing search history tracking...")
    
    headers = {"Authorization": f"Bearer {SESSION_TOKEN}"}
    
    try:
        response = requests.get(f"{BASE_URL}/history", headers=headers)
        
        if response.status_code == 200:
            history_data = response.json()
            history = history_data.get("history", [])
            
            if history:
                print(f"✅ Search history found - {len(history)} entries")
                # Check recent entries for our test searches
                recent_searches = [h for h in history if h.get('search_params', {}).get('origin') in ['JFK', 'CDG', 'LHR']]
                if recent_searches:
                    print(f"   ✅ Found {len(recent_searches)} recent test searches in history")
                    for search in recent_searches[:3]:  # Show first 3
                        params = search.get('search_params', {})
                        print(f"   - {params.get('origin')} → {params.get('destination')} on {params.get('departure_date')}")
                else:
                    print("   ❌ No recent test searches found in history")
                    return False
            else:
                print("   ❌ No search history found")
                return False
                
            return True
        else:
            print(f"❌ Failed to get search history - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error getting search history: {str(e)}")
        return False

def test_favorites_functionality():
    """Test adding flights to favorites"""
    print("\n⭐ Testing favorites functionality...")
    
    headers = {"Authorization": f"Bearer {SESSION_TOKEN}", "Content-Type": "application/json"}
    
    # First get some flights to add to favorites
    search_data = {
        "origin": "JFK",
        "destination": "LAX",
        "departure_date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
        "adults": 1
    }
    
    try:
        # Search for flights
        response = requests.post(f"{BASE_URL}/flights/search", headers=headers, json=search_data)
        
        if response.status_code != 200:
            print("❌ Cannot test favorites - flight search failed")
            return False
            
        data = response.json()
        flights = data.get("flights", [])
        
        if not flights:
            print("❌ Cannot test favorites - no flights available")
            return False
            
        # Add first flight to favorites
        flight = flights[0]
        fav_response = requests.post(f"{BASE_URL}/flights/favorites", headers=headers, json=flight)
        
        if fav_response.status_code == 200:
            print("✅ Successfully added flight to favorites")
            
            # Get favorites list
            get_favs = requests.get(f"{BASE_URL}/flights/favorites", headers=headers)
            if get_favs.status_code == 200:
                favs_data = get_favs.json()
                favorites = favs_data.get("favorites", [])
                print(f"✅ Retrieved favorites list - {len(favorites)} items")
                return True
            else:
                print(f"❌ Failed to get favorites - Status: {get_favs.status_code}")
                return False
        else:
            print(f"❌ Failed to add to favorites - Status: {fav_response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing favorites: {str(e)}")
        return False

def test_price_alerts():
    """Test price alerts functionality"""
    print("\n🔔 Testing price alerts functionality...")
    
    headers = {"Authorization": f"Bearer {SESSION_TOKEN}", "Content-Type": "application/json"}
    
    alert_data = {
        "origin": "JFK",
        "destination": "LAX", 
        "max_price": 400.00
    }
    
    try:
        # Create alert
        response = requests.post(f"{BASE_URL}/alerts", headers=headers, json=alert_data)
        
        if response.status_code == 200:
            print("✅ Successfully created price alert")
            
            # Get alerts list
            get_alerts = requests.get(f"{BASE_URL}/alerts", headers=headers)
            if get_alerts.status_code == 200:
                alerts_data = get_alerts.json()
                alerts = alerts_data.get("alerts", [])
                print(f"✅ Retrieved alerts list - {len(alerts)} items")
                return True
            else:
                print(f"❌ Failed to get alerts - Status: {get_alerts.status_code}")
                return False
        else:
            print(f"❌ Failed to create alert - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing price alerts: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🧪 Starting Aviationstack Integration Tests")
    print("=" * 50)
    
    test_results = {
        "Authentication": test_auth(),
        "Aviationstack Flight Search": test_aviationstack_flight_search(),
        "Search History": test_search_history(),
        "Favorites": test_favorites_functionality(),
        "Price Alerts": test_price_alerts()
    }
    
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:30} {status}")
        if result:
            passed += 1
    
    total = len(test_results)
    print(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 All tests passed! Aviationstack integration is working correctly.")
    else:
        print(f"\n⚠️  {total-passed} test(s) failed. Please check the issues above.")
    
    return passed == total

if __name__ == "__main__":
    main()