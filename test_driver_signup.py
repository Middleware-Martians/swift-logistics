#!/usr/bin/env python3
"""
Test script for driver signup functionality
Tests both WMS direct endpoint and middleware proxy
"""

import requests
import json

# Configuration
WMS_BASE_URL = "http://localhost:8002"
MIDDLEWARE_BASE_URL = "http://localhost:3001"

# Test data
test_driver_data = {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "license_number": "DL123456789"
}

def test_wms_direct():
    """Test direct WMS driver signup"""
    print("🧪 Testing WMS direct driver signup...")
    try:
        response = requests.post(
            f"{WMS_BASE_URL}/drivers/signup",
            json=test_driver_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            driver_data = response.json()
            print("✅ WMS Direct signup successful!")
            print(f"   Driver ID: {driver_data['driver_id']}")
            print(f"   Name: {driver_data['name']}")
            print(f"   Email: {driver_data['email']}")
            return driver_data
        else:
            print(f"❌ WMS Direct signup failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to WMS service")
        print("   Make sure WMS is running on port 8002")
        return None
    except Exception as e:
        print(f"❌ Error testing WMS direct: {e}")
        return None

def test_middleware_proxy():
    """Test middleware proxy driver signup"""
    print("\n🧪 Testing Middleware proxy driver signup...")
    
    # Use different email to avoid duplicate error
    middleware_test_data = test_driver_data.copy()
    middleware_test_data["email"] = "jane.doe@example.com"
    
    try:
        response = requests.post(
            f"{MIDDLEWARE_BASE_URL}/api/wms/drivers/signup",
            json=middleware_test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            driver_data = response.json()
            print("✅ Middleware proxy signup successful!")
            print(f"   Driver ID: {driver_data['driver_id']}")
            print(f"   Name: {driver_data['name']}")
            print(f"   Email: {driver_data['email']}")
            return driver_data
        else:
            print(f"❌ Middleware proxy signup failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Middleware service")
        print("   Make sure Middleware is running on port 3001")
        return None
    except Exception as e:
        print(f"❌ Error testing middleware proxy: {e}")
        return None

def test_get_drivers():
    """Test getting list of drivers"""
    print("\n🧪 Testing get drivers list...")
    try:
        response = requests.get(f"{WMS_BASE_URL}/drivers/")
        if response.status_code == 200:
            drivers = response.json()
            print(f"✅ Found {len(drivers)} drivers in the system")
            for driver in drivers[-2:]:  # Show last 2 drivers
                print(f"   - {driver['name']} ({driver['driver_id']}) - {driver['email']}")
        else:
            print(f"❌ Failed to get drivers: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting drivers: {e}")

if __name__ == "__main__":
    print("🚀 Testing Driver Signup Functionality\n")
    print("=" * 50)
    
    # Test direct WMS
    wms_result = test_wms_direct()
    
    # Test middleware proxy
    middleware_result = test_middleware_proxy()
    
    # Test getting drivers
    test_get_drivers()
    
    print("\n" + "=" * 50)
    if wms_result and middleware_result:
        print("🎉 All tests passed! Driver signup is working correctly.")
        print("\nEndpoints available:")
        print("   - Direct WMS: POST /drivers/signup")
        print("   - Middleware: POST /api/wms/drivers/signup")
    else:
        print("⚠️  Some tests failed. Check service status.")
        print("\nTo run services:")
        print("   - WMS: cd external_services/wms && python app.py")
        print("   - Middleware: node middleware-api.js")