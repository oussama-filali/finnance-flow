#!/bin/bash

# Test d'import CSV
echo "=== Test Import CSV ==="

# Test avec fichier CSV valide
curl -X POST http://localhost:8000/import/transactions \
  -H "Cookie: PHPSESSID=test_session" \
  -F "file=@tests/sample-import.csv" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "=== Test Récupération Transactions ==="

# Récupérer les transactions importées
curl -X GET http://localhost:8000/transactions \
  -H "Cookie: PHPSESSID=test_session" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "=== Test Catégories ==="

# Vérifier les catégories
curl -X GET http://localhost:8000/categories \
  -H "Cookie: PHPSESSID=test_session" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "=== Tests terminés ==="
