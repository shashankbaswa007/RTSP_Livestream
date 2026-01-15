# 🚀 Quick Start Guide - RTSP Livestream Overlay

This guide will help you get the application running in under 5 minutes.

## Prerequisites Checklist
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ and npm installed
- [ ] MongoDB 4.4+ running (local or Atlas)
- [ ] FFmpeg installed and in PATH

## Step 1: MongoDB Setup (1 minute)

### Option A: Local MongoDB
```bash
# Start MongoDB service
# macOS (using Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Option B: MongoDB Atlas (Cloud)
1. Create free cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/`)

## Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend directory
cd /Users/shashi/RTSP_Overlay/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate          # macOS/Linux
# OR
venv\Scripts\activate              # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env if needed (optional)
nano .env                          # or use your favorite editor
```

### .env Configuration
If using default settings, no changes needed. Otherwise, edit:
```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=rtsp_overlay_db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
HOST=0.0.0.0
PORT=5000
```

## Step 3: Frontend Setup (2 minutes)

```bash
# Open a new terminal window
# Navigate to frontend directory
cd /Users/shashi/RTSP_Overlay/frontend

# Install dependencies
npm install

# Verify Vite config (should show port 5173)
cat vite.config.js
```

## Step 4: Start the Application

### Terminal 1 - Backend
```bash
cd /Users/shashi/RTSP_Overlay/backend
source venv/bin/activate          # Skip if already activated
python app.py
```

**Expected output:**
```
INFO:werkzeug:WARNING: This is a development server.
 * Running on http://0.0.0.0:5000
Connected to MongoDB: rtsp_overlay_db
```

### Terminal 2 - Frontend
```bash
cd /Users/shashi/RTSP_Overlay/frontend
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the modern, professional UI with:
- Blue/purple gradient header
- Video player section (left side)
- Overlay controls (right side)
- Animated loading states

## 🎬 Quick Test Workflow

### 1. Test Overlay Creation
1. In the "Add Overlay" section, select "Text"
2. Enter some text like "Hello World"
3. Click "Add Overlay"
4. You should see a success toast notification
5. The overlay appears in the "Overlays" list below

### 2. Test Video Stream (Requires RTSP Source)
1. Enter an RTSP URL in the video player input
   - Example test stream: `rtsp://rtsp.stream/pattern`
2. Click "Start Stream"
3. Wait for initialization (2-3 seconds)
4. Video should start playing with Video.js player
5. Drag overlays onto the video to position them
6. Resize overlays by dragging corners

### 3. Test Overlay Management
1. Hover over any overlay card in the list
2. Click the red trash icon to delete
3. Confirm deletion in the popup
4. Overlay should disappear with success toast

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
# macOS/Linux
pgrep mongod

# Windows
tasklist | findstr mongod
```

**FFmpeg Not Found**
```bash
# Install FFmpeg
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
# Add to PATH environment variable
```

**Port 5000 Already in Use**
```bash
# Find and kill the process
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Issues

**Port 5173 Already in Use**
```bash
# Change port in vite.config.js
# Or kill the process
lsof -ti:5173 | xargs kill -9  # macOS/Linux
```

**Cannot Connect to Backend**
- Check if backend is running on `http://localhost:5000`
- Verify CORS is enabled in backend
- Check browser console for errors

**Dependencies Installation Failed**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📊 System Status Check

### Backend Health Check
```bash
curl http://localhost:5000/api/stream/status
```
**Expected response:**
```json
{
  "active": false,
  "rtsp_url": null
}
```

### Database Connection Check
```bash
curl http://localhost:5000/api/overlays
```
**Expected response:**
```json
{
  "data": [],
  "success": true
}
```

## 🎨 UI Features Tour

### 1. Modern Design Elements
- **Gradient backgrounds**: Smooth transitions from gray-900 to gray-800
- **Animated components**: Pulse dots, spinning loaders, scale transforms
- **Glass morphism**: Backdrop blur effects on overlays
- **Shadow effects**: Depth and elevation with colored shadows
- **Hover states**: Interactive feedback on all clickable elements

### 2. Responsive Layout
- **Desktop**: 3-column grid (2 cols video, 1 col controls)
- **Tablet**: Adjusts spacing and padding
- **Mobile**: Stacks vertically for easy scrolling

### 3. Status Indicators
- 🟢 **Green pulse**: Live streaming
- 🔵 **Blue pulse**: Component active
- ⚫ **Gray dot**: Inactive/ready state
- 🔴 **Red**: Stop/delete actions

### 4. Interactive Elements
- **Draggable overlays**: Click and drag to reposition
- **Resizable overlays**: Drag corners/edges to resize
- **Delete on hover**: Hover over overlay to see delete button
- **Preview**: See overlay content before adding
- **Toast notifications**: Real-time feedback for all actions

## 🔐 Security Notes

For production deployment:
1. Change `SECRET_KEY` in `.env`
2. Update `MONGODB_URI` to use authentication
3. Configure CORS to allow only your domain
4. Use environment variables for sensitive data
5. Enable HTTPS
6. Implement rate limiting
7. Add authentication/authorization

## 📚 Additional Resources

- [Full README.md](./README.md) - Comprehensive documentation
- [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) - Detailed setup
- [DEMO_VIDEO_SCRIPT.md](./DEMO_VIDEO_SCRIPT.md) - Recording guide
- [UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md) - Design documentation
- [DEVELOPMENT_NOTES.md](./DEVELOPMENT_NOTES.md) - Technical details

## 🆘 Need Help?

Common solutions:
1. **"Cannot find module"** → Run `npm install` or `pip install -r requirements.txt`
2. **"Connection refused"** → Check if services are running
3. **"Port already in use"** → Kill existing process or change port
4. **"FFmpeg not found"** → Install FFmpeg and add to PATH
5. **"MongoDB not connected"** → Start MongoDB service

---

**Status**: ✅ Ready for demo and testing
**Estimated Setup Time**: 5 minutes
**Last Updated**: 2026
