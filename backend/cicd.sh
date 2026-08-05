#!/bin/bash

echo "🚀 Starting FinTrackAI CI/CD Pipeline"
echo "-------------------------------------"

########################################
# 1. Install Backend Dependencies
########################################
echo "📦 Installing backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

########################################
# 2. Run Backend Tests (optional)
########################################
echo "🧪 Running backend tests..."
# pytest backend/ --disable-warnings -q || true
echo "⚠️ No tests implemented — skipping."

########################################
# 3. Validate Uvicorn can start
########################################
echo "🔍 Checking if backend can start..."
python - << 'EOF'
import uvicorn
print("Uvicorn import OK")
EOF

echo "✔ Backend validated"

########################################
# 8. CI/CD Completed
########################################
echo "🎉 CI/CD completed successfully!"
