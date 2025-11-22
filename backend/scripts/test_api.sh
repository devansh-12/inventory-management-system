#!/bin/bash

# API Testing Script for Inventory Management System
# Tests both Receipts (IN) and Deliveries (OUT) endpoints

BASE_URL="http://localhost:5000"
AUTH_HEADER="Authorization: Bearer default-secret"
CONTENT_TYPE="Content-Type: application/json"

echo "========================================="
echo "  Inventory Management API Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
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

echo -e "${YELLOW}=== RECEIPTS ENDPOINTS ===${NC}"
echo ""

# Test 1: Create Receipt
echo "Test 1: Create Receipt (POST /api/receipts)"
RECEIPT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/receipts" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{
    "from_contact_id": 1,
    "to_warehouse_id": 1,
    "scheduled_date": "2025-02-12",
    "items": [
      { "product_id": 1, "quantity": 5, "unit_cost": 1000 }
    ]
  }')

if echo "$RECEIPT_RESPONSE" | grep -q "reference"; then
    RECEIPT_ID=$(echo "$RECEIPT_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    RECEIPT_REF=$(echo "$RECEIPT_RESPONSE" | grep -o '"reference":"[^"]*"' | cut -d'"' -f4)
    print_result 0 "Created receipt with ID: $RECEIPT_ID, Reference: $RECEIPT_REF"
    echo "   Response: $RECEIPT_RESPONSE"
else
    print_result 1 "Failed to create receipt"
    echo "   Response: $RECEIPT_RESPONSE"
fi
echo ""

# Test 2: List All Receipts
echo "Test 2: List All Receipts (GET /api/receipts)"
RECEIPTS_LIST=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/receipts")

if echo "$RECEIPTS_LIST" | grep -q "reference"; then
    COUNT=$(echo "$RECEIPTS_LIST" | grep -o '"id":' | wc -l)
    print_result 0 "Retrieved $COUNT receipt(s)"
    echo "   Sample: $(echo "$RECEIPTS_LIST" | head -c 200)..."
else
    print_result 1 "Failed to list receipts"
    echo "   Response: $RECEIPTS_LIST"
fi
echo ""

echo -e "${YELLOW}=== DELIVERIES ENDPOINTS ===${NC}"
echo ""

# Test 3: Create Delivery
echo "Test 3: Create Delivery (POST /api/deliveries)"
DELIVERY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/deliveries" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{
    "from_warehouse_id": 1,
    "to_contact_id": 1,
    "scheduled_date": "2025-02-15",
    "items": [
      { "product_id": 1, "quantity": 3, "unit_cost": 1200, "alert_out_of_stock": false }
    ]
  }')

if echo "$DELIVERY_RESPONSE" | grep -q "reference"; then
    DELIVERY_ID=$(echo "$DELIVERY_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    DELIVERY_REF=$(echo "$DELIVERY_RESPONSE" | grep -o '"reference":"[^"]*"' | cut -d'"' -f4)
    print_result 0 "Created delivery with ID: $DELIVERY_ID, Reference: $DELIVERY_REF"
    echo "   Response: $DELIVERY_RESPONSE"
else
    print_result 1 "Failed to create delivery"
    echo "   Response: $DELIVERY_RESPONSE"
fi
echo ""

# Test 4: List All Deliveries
echo "Test 4: List All Deliveries (GET /api/deliveries)"
DELIVERIES_LIST=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/deliveries")

if echo "$DELIVERIES_LIST" | grep -q "reference"; then
    COUNT=$(echo "$DELIVERIES_LIST" | grep -o '"id":' | wc -l)
    print_result 0 "Retrieved $COUNT delivery(ies)"
    echo "   Sample: $(echo "$DELIVERIES_LIST" | head -c 200)..."
else
    print_result 1 "Failed to list deliveries"
    echo "   Response: $DELIVERIES_LIST"
fi
echo ""

# Test 5: Get Single Delivery by ID
if [ ! -z "$DELIVERY_ID" ]; then
    echo "Test 5: Get Single Delivery (GET /api/deliveries/$DELIVERY_ID)"
    SINGLE_DELIVERY=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/deliveries/$DELIVERY_ID")
    
    if echo "$SINGLE_DELIVERY" | grep -q "items"; then
        print_result 0 "Retrieved delivery details with items"
        echo "   Response: $(echo "$SINGLE_DELIVERY" | head -c 300)..."
    else
        print_result 1 "Failed to get delivery details"
        echo "   Response: $SINGLE_DELIVERY"
    fi
else
    echo "Test 5: Skipped (no delivery ID available)"
fi
echo ""

echo -e "${YELLOW}=== MOVE HISTORY ENDPOINTS ===${NC}"
echo ""

# Test 6: Get Move History
echo "Test 6: Get Move History (GET /api/move-history)"
MOVE_HISTORY=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/move-history")

if echo "$MOVE_HISTORY" | grep -q "\["; then
    # Check if it's an array (could be empty or have items)
    if echo "$MOVE_HISTORY" | grep -q "\"id\""; then
        COUNT=$(echo "$MOVE_HISTORY" | grep -o '"id":' | wc -l)
        print_result 0 "Retrieved $COUNT move history record(s)"
        echo "   Sample: $(echo "$MOVE_HISTORY" | head -c 200)..."
    else
        print_result 0 "Retrieved empty move history (no records yet)"
        echo "   Response: []"
    fi
else
    print_result 1 "Failed to get move history"
    echo "   Response: $MOVE_HISTORY"
fi
echo ""

echo -e "${YELLOW}=== STOCK ENDPOINTS ===${NC}"
echo ""

# Test 7: Get Stock List
echo "Test 7: Get Stock List (GET /api/stock)"
STOCK_LIST=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/stock")

if echo "$STOCK_LIST" | grep -q "\["; then
    if echo "$STOCK_LIST" | grep -q "\"product_name\""; then
        COUNT=$(echo "$STOCK_LIST" | grep -o '"id":' | wc -l)
        print_result 0 "Retrieved $COUNT stock item(s)"
        echo "   Sample: $(echo "$STOCK_LIST" | head -c 200)..."
    else
        print_result 0 "Retrieved empty stock list (no items yet)"
        echo "   Response: []"
    fi
else
    print_result 1 "Failed to get stock list"
    echo "   Response: $STOCK_LIST"
fi
echo ""

# Test 8: Get Dashboard Stats
echo "Test 8: Get Dashboard Stats (GET /api/dashboard/stats)"
DASHBOARD_STATS=$(curl -s -H "$AUTH_HEADER" "$BASE_URL/api/dashboard/stats")

if echo "$DASHBOARD_STATS" | grep -q "receipts"; then
    print_result 0 "Retrieved dashboard statistics"
    echo "   Response: $DASHBOARD_STATS"
else
    print_result 1 "Failed to get dashboard stats"
    echo "   Response: $DASHBOARD_STATS"
fi
echo ""

# Test 9: Error Handling - Invalid Auth
echo "Test 9: Error Handling - Invalid Auth Token"
ERROR_RESPONSE=$(curl -s -H "Authorization: Bearer invalid-token" "$BASE_URL/api/receipts")

if echo "$ERROR_RESPONSE" | grep -q "error"; then
    print_result 0 "Correctly rejected invalid auth token"
else
    print_result 1 "Should have rejected invalid auth"
fi
echo ""

# Test 10: Error Handling - Missing Fields
echo "Test 10: Error Handling - Missing Required Fields"
ERROR_RESPONSE=$(curl -s -X POST "$BASE_URL/api/deliveries" \
  -H "$AUTH_HEADER" \
  -H "$CONTENT_TYPE" \
  -d '{"from_warehouse_id": 1}')

if echo "$ERROR_RESPONSE" | grep -q "error"; then
    print_result 0 "Correctly rejected incomplete request"
    echo "   Error: $(echo "$ERROR_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)"
else
    print_result 1 "Should have rejected incomplete request"
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
    exit 0
else
    echo -e "${RED}Some tests failed. Please review.${NC}"
    exit 1
fi
