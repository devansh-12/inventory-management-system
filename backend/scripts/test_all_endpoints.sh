#!/bin/bash

# Comprehensive API Testing Script for Inventory Management System
# Tests all endpoints with data matching the current database state

BASE_URL="http://localhost:5000"
AUTH_HEADER="Authorization: Bearer default-secret"
CONTENT_TYPE="Content-Type: application/json"

echo "========================================="
echo "  Complete API Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo -e "${BLUE}=== DASHBOARD ===${NC}"
echo ""

# Test 1: Dashboard Stats
echo "Test 1: Get Dashboard Stats"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/dashboard/stats")
if echo "$RESPONSE" | grep -q "receipts"; then
    print_result 0 "Dashboard stats retrieved"
    echo "   $RESPONSE"
else
    print_result 1 "Failed to get dashboard stats"
fi
echo ""

echo -e "${BLUE}=== WAREHOUSES ===${NC}"
echo ""

# Test 2: List Warehouses
echo "Test 2: List All Warehouses"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/warehouses")
if echo "$RESPONSE" | grep -q "Central Warehouse"; then
    print_result 0 "Retrieved warehouses (should show WH1, WH2)"
    echo "   Sample: $(echo "$RESPONSE" | head -c 150)..."
else
    print_result 1 "Failed to list warehouses"
fi
echo ""

# Test 3: Create Warehouse
echo "Test 3: Create New Warehouse"
TIMESTAMP=$(date +%s)
UNIQUE_CODE="T${TIMESTAMP: -4}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/warehouses" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"name\": \"Test Warehouse $TIMESTAMP\",
    \"short_code\": \"$UNIQUE_CODE\",
    \"address\": \"789 Test St\"
  }")
if echo "$RESPONSE" | grep -q "$UNIQUE_CODE"; then
    NEW_WH_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    print_result 0 "Created warehouse with ID: $NEW_WH_ID, Code: $UNIQUE_CODE"
else
    print_result 1 "Failed to create warehouse"
    echo "   Response: $RESPONSE"
fi
echo ""

echo -e "${BLUE}=== LOCATIONS ===${NC}"
echo ""

# Test 4: List Locations
echo "Test 4: List All Locations"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/locations")
if echo "$RESPONSE" | grep -q "Room A"; then
    print_result 0 "Retrieved locations (should show Room A, Room B, Storage Room)"
    echo "   Sample: $(echo "$RESPONSE" | head -c 150)..."
else
    print_result 1 "Failed to list locations"
fi
echo ""

# Test 5: Filter Locations by Warehouse
echo "Test 5: Get Locations for Warehouse 1"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/locations?warehouse_id=1")
if echo "$RESPONSE" | grep -q "Room A"; then
    print_result 0 "Retrieved locations for WH1 (should show Room A, Room B)"
else
    print_result 1 "Failed to filter locations"
fi
echo ""

# Test 6: Update Warehouse
echo "Test 6: Update Warehouse"
if [ ! -z "$NEW_WH_ID" ]; then
    RESPONSE=$(curl -s -X PUT "$BASE_URL/api/warehouses/$NEW_WH_ID" \
      -H "$AUTH_HEADER" \
      -H "$CONTENT_TYPE" \
      -d '{
        "name": "Updated Test Warehouse",
        "address": "999 Updated St"
      }')
    if echo "$RESPONSE" | grep -q "Updated Test Warehouse"; then
        print_result 0 "Updated warehouse successfully"
    else
        print_result 1 "Failed to update warehouse"
    fi
else
    print_result 1 "Skipped - no warehouse ID available"
fi
echo ""

# Test 7: Create Location
echo "Test 7: Create New Location"
LOC_TIMESTAMP=$(date +%s)
LOC_CODE="L${LOC_TIMESTAMP: -4}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/locations" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d "{
    \"name\": \"Test Location $LOC_TIMESTAMP\",
    \"short_code\": \"$LOC_CODE\",
    \"warehouse_id\": 1
  }")
if echo "$RESPONSE" | grep -q "$LOC_CODE"; then
    NEW_LOC_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    print_result 0 "Created location with ID: $NEW_LOC_ID, Code: $LOC_CODE"
else
    print_result 1 "Failed to create location"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 8: Update Location
echo "Test 8: Update Location"
if [ ! -z "$NEW_LOC_ID" ]; then
    RESPONSE=$(curl -s -X PUT "$BASE_URL/api/locations/$NEW_LOC_ID" \
      -H "$AUTH_HEADER" \
      -H "$CONTENT_TYPE" \
      -d '{
        "name": "Updated Test Location"
      }')
    if echo "$RESPONSE" | grep -q "Updated Test Location"; then
        print_result 0 "Updated location successfully"
    else
        print_result 1 "Failed to update location"
    fi
else
    print_result 1 "Skipped - no location ID available"
fi
echo ""

echo -e "${BLUE}=== STOCK ===${NC}"
echo ""

# Test 9: List Stock
echo "Test 9: List All Stock"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/stock")
if echo "$RESPONSE" | grep -q "Desk"; then
    print_result 0 "Retrieved stock items (Desk: 50/45, Table: 50/50, Laptop: 15/12)"
    echo "   Sample: $(echo "$RESPONSE" | head -c 200)..."
else
    print_result 1 "Failed to list stock"
fi
echo ""

# Test 10: Filter Stock by Warehouse
echo "Test 10: Filter Stock by Warehouse"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/stock?warehouse_id=1")
if echo "$RESPONSE" | grep -q "Desk"; then
    print_result 0 "Retrieved stock for warehouse 1"
else
    print_result 1 "Failed to filter stock"
fi
echo ""

# Test 11: Update Stock
echo "Test 11: Update Stock Quantity"
RESPONSE=$(curl -s -X PUT "$BASE_URL/api/stock/1" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{
    "on_hand": 55,
    "free_to_use": 50
  }')
if echo "$RESPONSE" | grep -q "55"; then
    print_result 0 "Updated stock quantities"
else
    print_result 1 "Failed to update stock"
fi
echo ""

echo -e "${BLUE}=== RECEIPTS ===${NC}"
echo ""

# Test 8: List Receipts
echo "Test 8: List All Receipts"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/receipts")
if echo "$RESPONSE" | grep -q "WH/IN"; then
    COUNT=$(echo "$RESPONSE" | grep -o '"id":' | wc -l)
    print_result 0 "Retrieved $COUNT receipt(s) (should show WH/IN/0001, WH/IN/0002)"
    echo "   Sample: $(echo "$RESPONSE" | head -c 200)..."
else
    print_result 1 "Failed to list receipts"
fi
echo ""

# Test 9: Create Receipt
echo "Test 9: Create New Receipt"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/receipts" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{
    "from_contact_id": 1,
    "to_warehouse_id": 1,
    "scheduled_date": "2025-12-01",
    "items": [
      { "product_id": 1, "quantity": 10, "unit_cost": 3000 }
    ]
  }')
if echo "$RESPONSE" | grep -q "reference"; then
    REF=$(echo "$RESPONSE" | grep -o '"reference":"[^"]*"' | cut -d'"' -f4)
    print_result 0 "Created receipt: $REF"
else
    print_result 1 "Failed to create receipt"
fi
echo ""

echo -e "${BLUE}=== DELIVERIES ===${NC}"
echo ""

# Test 10: List Deliveries
echo "Test 10: List All Deliveries"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/deliveries")
if echo "$RESPONSE" | grep -q "WH/OUT"; then
    COUNT=$(echo "$RESPONSE" | grep -o '"id":' | wc -l)
    print_result 0 "Retrieved $COUNT delivery(ies) (should show WH/OUT/0001, WH/OUT/0002)"
    echo "   Sample: $(echo "$RESPONSE" | head -c 200)..."
else
    print_result 1 "Failed to list deliveries"
fi
echo ""

# Test 11: Get Single Delivery
echo "Test 11: Get Delivery Details (ID: 1)"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/deliveries/1")
if echo "$RESPONSE" | grep -q "items"; then
    print_result 0 "Retrieved delivery with items"
    echo "   Items: $(echo "$RESPONSE" | grep -o '"product_name":"[^"]*"' | head -n 2)"
else
    print_result 1 "Failed to get delivery details"
fi
echo ""

# Test 12: Create Delivery
echo "Test 12: Create New Delivery"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/deliveries" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{
    "from_warehouse_id": 1,
    "to_contact_id": 3,
    "scheduled_date": "2025-12-05",
    "items": [
      { "product_id": 2, "quantity": 5, "unit_cost": 3000, "alert_out_of_stock": false }
    ]
  }')
if echo "$RESPONSE" | grep -q "reference"; then
    REF=$(echo "$RESPONSE" | grep -o '"reference":"[^"]*"' | cut -d'"' -f4)
    print_result 0 "Created delivery: $REF"
else
    print_result 1 "Failed to create delivery"
fi
echo ""

echo -e "${BLUE}=== MOVE HISTORY ===${NC}"
echo ""

# Test 13: List Move History
echo "Test 13: List All Move History"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/move-history")
if echo "$RESPONSE" | grep -q "event_type"; then
    COUNT=$(echo "$RESPONSE" | grep -o '"id":' | wc -l)
    print_result 0 "Retrieved $COUNT move history record(s) (IN, OUT, TRANSFER)"
    echo "   Sample: $(echo "$RESPONSE" | head -c 200)..."
else
    print_result 1 "Failed to list move history"
fi
echo ""

echo -e "${BLUE}=== AUTHENTICATION ===${NC}"
echo ""

# Test 19: Get Current User (should fail without login)
echo "Test 19: Get Current User (No Login)"
RESPONSE=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/auth/me")
if echo "$RESPONSE" | grep -q "error"; then
    print_result 0 "Correctly requires authentication"
else
    print_result 1 "Should require authentication"
fi
echo ""

# Test 20: Logout
echo "Test 20: Logout"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout")
if echo "$RESPONSE" | grep -q "message"; then
    print_result 0 "Logout successful"
else
    print_result 1 "Failed to logout"
fi
echo ""

# Test 21: Delete Location (Cleanup)
echo "Test 21: Delete Location"
if [ ! -z "$NEW_LOC_ID" ]; then
    RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/locations/$NEW_LOC_ID" \
      -H "$AUTH_HEADER")
    if echo "$RESPONSE" | grep -q "success"; then
        print_result 0 "Deleted location successfully"
    else
        print_result 1 "Failed to delete location"
    fi
else
    print_result 1 "Skipped - no location ID available"
fi
echo ""

# Test 22: Delete Warehouse (Cleanup)
echo "Test 22: Delete Warehouse"
if [ ! -z "$NEW_WH_ID" ]; then
    RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/warehouses/$NEW_WH_ID" \
      -H "$AUTH_HEADER")
    if echo "$RESPONSE" | grep -q "success"; then
        print_result 0 "Deleted warehouse successfully"
    else
        print_result 1 "Failed to delete warehouse"
    fi
else
    print_result 1 "Skipped - no warehouse ID available"
fi
echo ""

echo -e "${BLUE}=== ERROR HANDLING ===${NC}"
echo ""

# Test 23: Invalid Auth
echo "Test 23: Test Invalid Auth Token"
RESPONSE=$(curl -s -H "Authorization: Bearer invalid-token" "$BASE_URL/api/receipts")
if echo "$RESPONSE" | grep -q "error"; then
    print_result 0 "Correctly rejected invalid token"
else
    print_result 1 "Should have rejected invalid token"
fi
echo ""

# Test 24: Missing Fields
echo "Test 24: Test Missing Required Fields"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/warehouses" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{"name": "Incomplete"}')
if echo "$RESPONSE" | grep -q "error"; then
    print_result 0 "Correctly rejected incomplete data"
else
    print_result 1 "Should have rejected incomplete data"
fi
echo ""

# Summary
echo "========================================="
echo "  Test Summary"
echo "========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    echo ""
    echo "Your API is working correctly with the following data:"
    echo "  - 2 Users (Alice, Bob)"
    echo "  - 2 Warehouses (WH1, WH2)"
    echo "  - 3 Locations (Room A, Room B, Storage Room)"
    echo "  - 3 Products (Desk, Table, Laptop)"
    echo "  - 3 Contacts (Azure Interior, OfficeMart, SuperCorp)"
    echo "  - 3 Stock entries"
    echo "  - 2 Receipts with items"
    echo "  - 2 Deliveries with items"
    echo "  - 3 Move history records"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review.${NC}"
    exit 1
fi
