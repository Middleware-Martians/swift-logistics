#!/usr/bin/env python3
"""
Add Sample Drivers to Swift Logistics System
This script adds sample drivers for testing the driver signup functionality
"""

import requests
import json

# Configuration
MIDDLEWARE_BASE_URL = "http://localhost:3001"

# Sample drivers data
sample_drivers = [
    {
        "name": "John Smith",
        "email": "john.smith@swiftlogistics.com",
        "phone": "+1-555-0123",
        "license_number": "DL12345678"
    },
    {
        "name": "Maria Rodriguez",
        "email": "maria.rodriguez@swiftlogistics.com", 
        "phone": "+1-555-0456",
        "license_number": "DL87654321"
    },
    {
        "name": "David Chen",
        "email": "david.chen@swiftlogistics.com",
        "phone": "+1-555-0789",
        "license_number": "DL13579246"
    }
]

def add_sample_driver(driver_data):
    """Add a single driver using the middleware API"""
    try:
        print(f"Adding driver: {driver_data['name']}...")
        
        response = requests.post(
            f"{MIDDLEWARE_BASE_URL}/api/wms/drivers/signup",
            json=driver_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            driver = response.json()
            print(f"✅ Successfully added driver!")
            print(f"   Driver ID: {driver['driver_id']}")
            print(f"   Name: {driver['name']}")
            print(f"   Email: {driver['email']}")
            print(f"   Phone: {driver['phone']}")
            print(f"   License: {driver['license_number']}")
            print()
            return driver
        else:
            print(f"❌ Failed to add driver: {response.status_code}")
            print(f"   Error: {response.text}")
            print()
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Middleware service")
        print("   Make sure services are running")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def list_all_drivers():
    """List all drivers in the system"""
    try:
        print("📋 Current drivers in the system:")
        print("-" * 40)
        
        response = requests.get(f"{MIDDLEWARE_BASE_URL}/api/wms/drivers")
        
        if response.status_code == 200:
            drivers = response.json()
            if drivers:
                for i, driver in enumerate(drivers, 1):
                    print(f"{i}. {driver['name']} ({driver['driver_id']})")
                    print(f"   Email: {driver['email']}")
                    print(f"   Phone: {driver['phone']}")
                    print(f"   License: {driver['license_number']}")
                    print(f"   Available: {'Yes' if driver['available'] else 'No'}")
                    print()
            else:
                print("No drivers found in the system.")
        else:
            print(f"❌ Failed to get drivers: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error getting drivers: {e}")

if __name__ == "__main__":
    print("🚚 Swift Logistics - Add Sample Drivers")
    print("=" * 45)
    print()
    
    # Show current drivers first
    list_all_drivers()
    
    # Add sample drivers
    print("🔄 Adding sample drivers...")
    print()
    
    added_drivers = []
    for driver_data in sample_drivers:
        result = add_sample_driver(driver_data)
        if result:
            added_drivers.append(result)
    
    # Show results
    print("=" * 45)
    if added_drivers:
        print(f"🎉 Successfully added {len(added_drivers)} sample driver(s)!")
        print()
        print("Driver IDs for testing:")
        for driver in added_drivers:
            print(f"  • {driver['name']}: {driver['driver_id']}")
        print()
        print("You can now use these Driver IDs to test the login functionality in the frontend!")
    else:
        print("⚠️  No drivers were added. Check the error messages above.")
    
    print()
    print("📋 Updated driver list:")
    print("-" * 25)
    list_all_drivers()