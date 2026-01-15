#!/bin/bash
# Complete Application Startup Guide

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  RTSP Livestream Overlay Application - Startup Guide          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if backend is running
check_backend() {
    curl -s http://localhost:5001/health > /dev/null 2>&1
    return $?
}

# Check if frontend is running
check_frontend() {
    curl -s http://localhost:5173 > /dev/null 2>&1
    return $?
}

echo "📋 Pre-flight Checks:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    echo "✅ Python $PYTHON_VERSION"
else
    echo "❌ Python 3 not found"
    exit 1
fi

# Check Node
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node $NODE_VERSION"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Check FFmpeg
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version 2>&1 | head -n1 | cut -d' ' -f3)
    echo "✅ FFmpeg $FFMPEG_VERSION"
else
    echo "⚠️  FFmpeg not found (required for RTSP conversion)"
fi

# Check MongoDB connection
echo ""
echo "🔍 Checking MongoDB Connection:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /Users/shashi/RTSP_Overlay/backend
python3 -c "from models import init_db_connection; success, error = init_db_connection(); print('✅ MongoDB Connected' if success else f'⚠️  MongoDB: {error}')" 2>/dev/null

# Check test stream
echo ""
echo "📹 Checking Test Stream:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "/Users/shashi/RTSP_Overlay/backend/static/test_stream/playlist.m3u8" ]; then
    echo "✅ Test HLS stream available"
    echo "   📍 http://localhost:5001/static/test_stream/playlist.m3u8"
else
    echo "⚠️  Test stream not found"
fi

echo ""
echo "🚀 Server Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if check_backend; then
    echo "✅ Backend is RUNNING on http://localhost:5001"
else
    echo "⚠️  Backend is NOT running"
    echo "   Start with: cd backend && python3 app.py"
fi

if check_frontend; then
    echo "✅ Frontend is RUNNING on http://localhost:5173"
else
    echo "⚠️  Frontend is NOT running"
    echo "   Start with: cd frontend && npm run dev"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  QUICK START INSTRUCTIONS                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Terminal 1 - Backend Server:"
echo "  $ cd /Users/shashi/RTSP_Overlay/backend"
echo "  $ python3 app.py"
echo ""
echo "Terminal 2 - Frontend Server:"
echo "  $ cd /Users/shashi/RTSP_Overlay/frontend"
echo "  $ npm run dev"
echo ""
echo "Terminal 3 - Run Tests (Optional):"
echo "  $ cd /Users/shashi/RTSP_Overlay"
echo "  $ python3 test_complete.py"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TESTING THE APPLICATION                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Open browser: http://localhost:5173"
echo ""
echo "2. Enter test stream URL:"
echo "   http://localhost:5001/static/test_stream/playlist.m3u8"
echo ""
echo "3. Click 'Start Stream' ▶️"
echo ""
echo "4. Add overlays:"
echo "   • Click 'Text' or 'Image' button"
echo "   • Enter content"
echo "   • Click 'Add Overlay'"
echo ""
echo "5. Interact with overlays:"
echo "   • Drag to move"
echo "   • Resize from corners/edges"
echo "   • Click ❌ to delete"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  FEATURES TO DEMONSTRATE                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✨ Streaming:"
echo "   • RTSP to HLS conversion via FFmpeg"
echo "   • Browser-compatible video playback"
echo "   • Support for HTTP/HTTPS direct HLS"
echo ""
echo "✨ Overlays:"
echo "   • Text overlays with custom content"
echo "   • Image overlays via URL"
echo "   • Drag-and-drop positioning"
echo "   • Resize with corner handles"
echo "   • Real-time updates"
echo ""
echo "✨ Backend:"
echo "   • RESTful API (Flask)"
echo "   • MongoDB persistence"
echo "   • CORS enabled"
echo "   • Error handling"
echo ""
echo "✨ Frontend:"
echo "   • React + Vite"
echo "   • Video.js player"
echo "   • Modern UI with gradients"
echo "   • Toast notifications"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TROUBLESHOOTING                                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Issue: Port 5001 already in use"
echo "Fix:   lsof -ti:5001 | xargs kill -9"
echo ""
echo "Issue: Port 5173 already in use"
echo "Fix:   lsof -ti:5173 | xargs kill -9"
echo ""
echo "Issue: MongoDB connection failed"
echo "Fix:   Check credentials in backend/.env"
echo "       • Verify IP whitelist in MongoDB Atlas"
echo "       • App works with in-memory storage if DB unavailable"
echo ""
echo "Issue: Video won't play"
echo "Fix:   Use test URL: http://localhost:5001/static/test_stream/playlist.m3u8"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "📚 Documentation:"
echo "   • README.md - Project overview"
echo "   • VERIFICATION_REPORT.md - Test results"
echo "   • STREAMING_TECHNICAL_GUIDE.md - Technical deep dive"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
