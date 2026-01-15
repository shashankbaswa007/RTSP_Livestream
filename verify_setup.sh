#!/bin/bash
# Simple backend test script

echo "======================================"
echo "Backend and Frontend Verification"
echo "======================================"
echo ""

# Navigate to backend
cd /Users/shashi/RTSP_Overlay/backend

echo "1. Testing MongoDB connection..."
python3 -c "from models import init_db_connection; success, error = init_db_connection(); print('✅ MongoDB Connected' if success else f'❌ MongoDB Failed: {error}')"
echo ""

echo "2. Checking backend files..."
for file in app.py models.py config.py .env; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done
echo ""

echo "3. Checking test stream files..."
if [ -f "static/test_stream/playlist.m3u8" ]; then
    echo "✅ Test HLS stream exists"
    echo "   Files: $(ls -1 static/test_stream/ | wc -l) files"
else
    echo "❌ Test stream missing"
fi
echo ""

echo "4. Checking frontend files..."
cd /Users/shashi/RTSP_Overlay/frontend
for file in package.json src/App.jsx src/main.jsx; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done
echo ""

echo "5. Checking frontend dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules installed"
else
    echo "⚠️  node_modules not found - run 'npm install'"
fi
echo ""

echo "======================================"
echo "INSTRUCTIONS TO RUN:"
echo "======================================"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd /Users/shashi/RTSP_Overlay/backend"
echo "  python3 app.py"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd /Users/shashi/RTSP_Overlay/frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo "Test URL: http://localhost:5001/static/test_stream/playlist.m3u8"
echo ""
