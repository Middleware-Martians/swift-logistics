#!/usr/bin/env python3
"""
Update WMS Database Schema and Add Sample Drivers
"""

import sqlite3
import uuid

DB_NAME = "wms.db"

def update_database_schema():
    """Update the drivers table schema to include new fields"""
    print("🔧 Updating Database Schema...")
    
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    # Check current schema
    cur.execute("PRAGMA table_info(drivers)")
    columns = cur.fetchall()
    print("Current columns:", [col[1] for col in columns])
    
    # Get existing drivers
    cur.execute("SELECT * FROM drivers")
    existing_drivers = cur.fetchall()
    print(f"Found {len(existing_drivers)} existing drivers")
    
    # Drop and recreate table with new schema
    cur.execute("DROP TABLE IF EXISTS drivers")
    
    # Create new table with enhanced schema
    cur.execute("""
        CREATE TABLE drivers (
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
    
    print("✅ Updated drivers table schema")
    
    # Re-add existing drivers with default values for new fields
    for driver in existing_drivers:
        old_id, old_driver_id, old_name, old_available = driver[:4]
        default_email = f"{old_name.lower().replace(' ', '.')}@temp.com"
        default_phone = "+1-555-0000"
        default_license = "DL00000000"
        
        cur.execute("""
            INSERT INTO drivers (driver_id, name, email, phone, license_number, available) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (old_driver_id, old_name, default_email, default_phone, default_license, old_available))
        
        print(f"Migrated existing driver: {old_name} ({old_driver_id})")
    
    conn.commit()
    conn.close()
    print("✅ Schema update complete")
    print()

def add_sample_drivers():
    """Add sample drivers to the database"""
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
    
    print("🚚 Adding Sample Drivers...")
    
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()
    
    added_drivers = []
    
    for driver_data in sample_drivers:
        driver_id = f"DRV{uuid.uuid4().hex[:8].upper()}"
        
        try:
            cur.execute("""
                INSERT INTO drivers (driver_id, name, email, phone, license_number, available) 
                VALUES (?, ?, ?, ?, ?, ?)
            """, (driver_id, driver_data["name"], driver_data["email"], 
                  driver_data["phone"], driver_data["license_number"], 1))
            
            print(f"✅ Added: {driver_data['name']} ({driver_id})")
            added_drivers.append({"name": driver_data["name"], "driver_id": driver_id})
            
        except sqlite3.IntegrityError as e:
            print(f"⚠️  {driver_data['name']} already exists or email conflict")
    
    conn.commit()
    
    # Show all drivers
    print("\n📋 All Drivers in Database:")
    print("-" * 40)
    cur.execute("SELECT driver_id, name, email, available FROM drivers")
    all_drivers = cur.fetchall()
    
    for i, driver in enumerate(all_drivers, 1):
        print(f"{i}. {driver[1]} ({driver[0]})")
        print(f"   Email: {driver[2]}")
        print(f"   Available: {'Yes' if driver[3] else 'No'}")
        print()
    
    conn.close()
    
    print("=" * 50)
    print(f"🎉 Database ready with {len(all_drivers)} driver(s)!")
    if added_drivers:
        print("\nNew Driver IDs for testing:")
        for driver in added_drivers:
            print(f"  • {driver['name']}: {driver['driver_id']}")

if __name__ == "__main__":
    print("🚚 Swift Logistics Database Setup")
    print("=" * 50)
    print()
    
    update_database_schema()
    add_sample_drivers()