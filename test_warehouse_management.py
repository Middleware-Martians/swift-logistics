import requests
import json

# Test the warehouse management endpoints
BASE_URL = "http://localhost:3001/api/wms"

def test_warehouse_endpoints():
    print("Testing Warehouse Management Endpoints...")
    
    # 1. Test getting all orders
    print("\n1. Getting all orders:")
    try:
        response = requests.get(f"{BASE_URL}/orders")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
    
    # 2. Test getting all drivers
    print("\n2. Getting all drivers:")
    try:
        response = requests.get(f"{BASE_URL}/drivers")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_warehouse_endpoints()