#!/usr/bin/env bash
# Viva / demo script — run locally before presentation.
set -euo pipefail

echo "== ArticleIQ demo health check =="
curl -sf http://localhost:8000/health | python3 -m json.tool

echo ""
echo "== Analyze sample article =="
curl -sf -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d @- <<'EOF' | python3 -m json.tool | head -40
{
  "text": "Apple Inc. announced record quarterly revenue on Tuesday in Cupertino. The company said revenue rose eighteen percent year over year, driven by cloud services demand. Chief executive Tim Cook told investors that operating margins improved.",
  "keyword_limit": 6
}
EOF

echo ""
echo "== Grounded Q&A =="
curl -sf -X POST http://localhost:8000/api/v1/qa \
  -H "Content-Type: application/json" \
  -d '{"text":"Apple Inc. announced record quarterly revenue on Tuesday. Revenue rose eighteen percent year over year.","question":"How much did revenue grow?"}' \
  | python3 -m json.tool

echo ""
echo "Demo API checks complete. Open http://localhost:3000 for the UI."
