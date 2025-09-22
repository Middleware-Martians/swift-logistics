#!/usr/bin/env python3
"""
Direct Database Driver Addition
Add sample drivers directly to the WMS SQLite database
"""

import sqlite3
import uuid
from datetime import datetime

DB_NAME = "wms.db"

def add_sample_drivers():
    """Add sample drivers directly to the database"""
    
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
    
    print("🚚 Adding Sample Drivers to WMS Database")
    print("=" * 45)
    print()
    
    # Connect to database
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    # Ensure the drivers table exists with the correct schema
    cur.execute("""
        CREATE TABLE IF NOT EXISTS drivers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            driver_id TEXT UNIQUE,
            name TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            license_number TEXT,
            available INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    added_drivers = []
    
    for driver_data in sample_drivers:
        # Generate unique driver ID
        driver_id = f"DRV{uuid.uuid4().hex[:8].upper()}"
        
        try:
            cur.execute("""
                INSERT INTO drivers (driver_id, name, email, phone, license_number, available) 
                VALUES (?, ?, ?, ?, ?, ?)
            """, (driver_id, driver_data["name"], driver_data["email"], 
                  driver_data["phone"], driver_data["license_number"], 1))
            
            print(f"✅ Added driver: {driver_data['name']}")
            print(f"   Driver ID: {driver_id}")
            print(f"   Email: {driver_data['email']}")
            print(f"   Phone: {driver_data['phone']}")
            print(f"   License: {driver_data['license_number']}")
            print()
            
            added_drivers.append({
                "driver_id": driver_id,
                "name": driver_data["name"],
                "email": driver_data["email"],
                "phone": driver_data["phone"],
                "license_number": driver_data["license_number"]
            })
            
        except sqlite3.IntegrityError as e:
            if "email" in str(e):
                print(f"⚠️  Driver {driver_data['name']} already exists (email: {driver_data['email']})")
            else:
                print(f"⚠️  Failed to add driver {driver_data['name']}: {e}")
            print()
    
    # Commit changes
    conn.commit()
    
    # Show all drivers in database
    print("📋 All Drivers in Database:")
    print("-" * 30)
    cur.execute("SELECT driver_id, name, email, phone, license_number, available FROM drivers")
    all_drivers = cur.fetchall()
    
    for i, driver in enumerate(all_drivers, 1):
        print(f"{i}. {driver[1]} ({driver[0]})")
        print(f"   Email: {driver[2]}")
        print(f"   Phone: {driver[3]}")
        print(f"   License: {driver[4]}")
        print(f"   Available: {'Yes' if driver[5] else 'No'}")
        print()
    
    conn.close()
    
    print("=" * 45)
    if added_drivers:
        print(f"🎉 Successfully added {len(added_drivers)} driver(s) to the database!")
        print()
        print("You can use these Driver IDs to test the frontend:")
        for driver in added_drivers:
            print(f"  • {driver['name']}: {driver['driver_id']}")
    else:
        print("ℹ️  No new drivers were added (they may already exist)")
    
    print()
    print("💡 To test the drivers:")
    print("   1. Start the WMS service: uvicorn app:app --port 8002")
    print("   2. Open the frontend dashboard")  
    print("   3. Use the Driver IDs above to login in the Driver App")

if __name__ == "__main__":
    add_sample_drivers()