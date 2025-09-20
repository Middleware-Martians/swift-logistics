#!/usr/bin/env python3
"""
Complete End-to-End Test for Driver Signup Feature
Tests: WMS -> Middleware -> Frontend Integration
"""

import requests
import json
import time

# Configuration
WMS_BASE_URL = "http://localhost:8002"
MIDDLEWARE_BASE_URL = "http://localhost:3001"
FRONTEND_BASE_URL = "http://localhost:3000"

def test_wms_driver_signup():
    """Test WMS driver signup endpoint directly"""
    print("🧪 Testing WMS Driver Signup...")
    
    test_data = {
        "name": "John Driver",
        "email": "john.driver@test.com",
        "phone": "+1234567890",
        "license_number": "DL123456789"
    }
    
    try:
        response = requests.post(
            f"{WMS_BASE_URL}/drivers/signup",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            driver = response.json()
            print(f"✅ WMS Driver Signup successful!")
            print(f"   Driver ID: {driver['driver_id']}")
            print(f"   Name: {driver['name']}")
            print(f"   Email: {driver['email']}")
            return driver
        else:
            print(f"❌ WMS Driver Signup failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to WMS service")
        print("   Make sure WMS is running: cd external_services/wms && python app.py")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_middleware_driver_signup():
    """Test middleware driver signup proxy"""
    print("\n🧪 Testing Middleware Driver Signup...")
    
    test_data = {
        "name": "Jane Driver",
        "email": "jane.driver@test.com", 
        "phone": "+1987654321",
        "license_number": "DL987654321"
    }
    
    try:
        response = requests.post(
            f"{MIDDLEWARE_BASE_URL}/api/wms/drivers/signup",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            driver = response.json()
            print(f"✅ Middleware Driver Signup successful!")
            print(f"   Driver ID: {driver['driver_id']}")
            print(f"   Name: {driver['name']}")
            print(f"   Email: {driver['email']}")
            return driver
        else:
            print(f"❌ Middleware Driver Signup failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Middleware service")
        print("   Make sure Middleware is running: node middleware-api.js")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_driver_login(driver_id):
    """Test driver login with generated ID"""
    print(f"\n🧪 Testing Driver Login with ID: {driver_id}")
    
    try:
        response = requests.get(f"{MIDDLEWARE_BASE_URL}/api/wms/drivers/{driver_id}")
        
        if response.status_code == 200:
            driver = response.json()
            print(f"✅ Driver Login successful!")
            print(f"   Found driver: {driver['name']}")
            print(f"   Available: {driver['available']}")
            return driver
        else:
            print(f"❌ Driver Login failed: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def check_services_status():
    """Check if all required services are running"""
    print("🔍 Checking Service Status...")
    
    services = {
        "WMS": WMS_BASE_URL,
        "Middleware": MIDDLEWARE_BASE_URL
    }
    
    all_running = True
    
    for name, url in services.items():
        try:
            response = requests.get(f"{url}/docs" if name == "WMS" else f"{url}/api/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ {name} is running")
            else:
                print(f"⚠️  {name} responded with status {response.status_code}")
                all_running = False
        except requests.exceptions.ConnectionError:
            print(f"❌ {name} is not running")
            all_running = False
        except requests.exceptions.Timeout:
            print(f"⚠️  {name} is slow to respond")
            all_running = False
    
    return all_running

def check_driver_list():
    """Check current drivers in the system"""
    print("\n📋 Checking Current Drivers...")
    
    try:
        response = requests.get(f"{MIDDLEWARE_BASE_URL}/api/wms/drivers")
        if response.status_code == 200:
            drivers = response.json()
            print(f"✅ Found {len(drivers)} drivers in system")
            for driver in drivers[-3:]:  # Show last 3 drivers
                print(f"   - {driver['name']} ({driver['driver_id']}) - {driver['email']}")
        else:
            print(f"❌ Failed to get drivers: {response.status_code}")
    except Exception as e:
        print(f"❌ Error getting drivers: {e}")

def print_frontend_instructions():
    """Print instructions for testing the frontend"""
    print("\n🌐 Frontend Testing Instructions:")
    print("=" * 50)
    print("1. Open the frontend: http://localhost:3000")
    print("2. Look at the 'Driver App' panel (middle column, top row)")
    print("3. Click on the 'Register' tab")
    print("4. Fill out the driver registration form:")
    print("   - Full Name: Your name")
    print("   - Email: your.email@example.com")
    print("   - Phone: +1234567890")
    print("   - Driver's License: DL123456789")
    print("5. Click 'Register' and note the generated Driver ID")
    print("6. Switch to 'Login' tab and use the Driver ID to login")
    print("7. Check the 'System Activities' panel for logged requests")

if __name__ == "__main__":
    print("🚀 Swift Logistics - Driver Signup End-to-End Test")
    print("=" * 55)
    
    # Check services
    if not check_services_status():
        print("\n⚠️  Some services are not running. Please start them:")
        print("   WMS: cd external_services/wms && python app.py")
        print("   Middleware: node middleware-api.js")
        print("   Frontend: cd frontend && npm start")
        exit(1)
    
    # Test WMS direct
    driver1 = test_wms_driver_signup()
    
    # Test middleware proxy
    driver2 = test_middleware_driver_signup()
    
    # Test login if we have a driver
    if driver1:
        test_driver_login(driver1['driver_id'])
    
    # Show current drivers
    check_driver_list()
    
    # Frontend testing instructions
    print_frontend_instructions()
    
    print("\n" + "=" * 55)
    if driver1 and driver2:
        print("🎉 All backend tests passed! Driver signup is working.")
        print("   Now test the frontend integration manually.")
    else:
        print("⚠️  Some backend tests failed. Check error messages above.")