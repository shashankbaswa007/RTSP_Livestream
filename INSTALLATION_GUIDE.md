# Installation & Testing Guide

Complete guide for setting up and verifying the RTSP Livestream Overlay Application.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Verification Tests](#verification-tests)
4. [Common Issues](#common-issues)
5. [Test Checklist](#test-checklist)

---

## System Requirements

### Required Software

| Software | Minimum Version | Check Command | Installation |
|----------|----------------|---------------|--------------|
| Python | 3.8+ | `python3 --version` | [python.org](https://www.python.org) |
| Node.js | 16+ | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | 8+ | `npm --version` | Included with Node.js |
| FFmpeg | Latest | `ffmpeg -version` | See platform instructions below |
| MongoDB | 4.4+ | `mongod --version` | [mongodb.com](https://www.mongodb.com) |

### FFmpeg Installation by Platform

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to PATH
4. Restart terminal

### MongoDB Installation Options

**Option 1: Local MongoDB**
- Download from https://www.mongodb.com/try/download/community
- Follow platform-specific installation
- Start with `mongod` command

**Option 2: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- No local installation needed

---

## Installation Steps

### Step 1: Verify Prerequisites

```bash
# Create a new terminal window and run each command

# Python check
python3 --version
# Expected: Python 3.8.0 or higher

# Node.js check
node --version
# Expected: v16.0.0 or higher

# npm check
npm --version
# Expected: 8.0.0 or higher

# FFmpeg check
ffmpeg -version
# Expected: ffmpeg version x.x.x with configuration details

# MongoDB check (if using local)
mongod --version
# Expected: db version vx.x.x
```

**If any check fails, install the missing software before continuing.**

### Step 2: Backend Setup

```bash
# Navigate to project root
cd /path/to/RTSP_Overlay

# Enter backend directory
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate

# Windows:
# venv\Scripts\activate

# Your prompt should now show (venv)

# Install Python dependencies
pip install -r requirements.txt

# Expected output:
# Successfully installed Flask-3.0.0 Flask-CORS-4.0.0 pymongo-4.6.0 python-dotenv-1.0.0
```

### Step 3: Backend Configuration

```bash
# Still in backend directory with venv activated

# Copy environment template
cp .env.example .env

# Edit .env file with your preferred editor
# nano .env
# or
# code .env
# or
# vim .env
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=rtsp_overlay_db
SECRET_KEY=change-this-to-random-string
FLASK_ENV=development
HOST=0.0.0.0
PORT=5000
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=rtsp_overlay_db
SECRET_KEY=change-this-to-random-string
FLASK_ENV=development
HOST=0.0.0.0
PORT=5000
```

### Step 4: Frontend Setup

```bash
# Open a new terminal
# Navigate to project root
cd /path/to/RTSP_Overlay

# Enter frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Expected output:
# added XXX packages, and audited XXX packages
# found 0 vulnerabilities
```

This will install all frontend dependencies including:
- React
- Video.js
- react-rnd
- Axios
- Tailwind CSS
- Vite

### Step 5: Verify Installation

```bash
# Check backend dependencies
cd backend
pip list

# Should see:
# Flask         3.0.0
# Flask-CORS    4.0.0
# pymongo       4.6.0
# python-dotenv 1.0.0

# Check frontend dependencies
cd ../frontend
npm list --depth=0

# Should see:
# react@18.2.0
# video.js@8.10.0
# axios@1.6.5
# react-rnd@10.4.1
# (and others)
```

---

## Verification Tests

### Test 1: Start MongoDB

**For Local MongoDB:**
```bash
# Open Terminal 1
mongod

# Expected output:
# {"t":{"$date":"..."},"s":"I",  "c":"NETWORK",  "id":23015,   "ctx":"listener","msg":"Listening on","attr":{"address":"127.0.0.1"}}
# {"t":{"$date":"..."},"s":"I",  "c":"NETWORK",  "id":23016,   "ctx":"listener","msg":"Waiting for connections","attr":{"port":27017}}
```

**For MongoDB Atlas:**
- No action needed
- Verify connection string in `.env`

### Test 2: Start Backend

```bash
# Open Terminal 2
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python app.py

# Expected output:
# INFO - Connected to MongoDB: rtsp_overlay_db
# INFO - Starting Flask application on 0.0.0.0:5000
# INFO - Debug mode: True
# WARNING: This is a development server. Do not use it in a production deployment.
# * Running on all addresses (0.0.0.0)
# * Running on http://127.0.0.1:5000
# * Running on http://192.168.x.x:5000
```

**Success Indicators:**
- ✅ "Connected to MongoDB" message appears
- ✅ "Running on http://127.0.0.1:5000" appears
- ✅ No error messages in red

**Common Errors:**
- ❌ "Failed to connect to MongoDB" → Check MongoDB is running
- ❌ "Address already in use" → Port 5000 is occupied, change PORT in .env
- ❌ "ModuleNotFoundError" → Run `pip install -r requirements.txt` again

### Test 3: Test Backend API

**Keep Terminal 2 running, open Terminal 3 for tests:**

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected output:
# {"status":"healthy","success":true,"service":"RTSP Overlay Backend"}

# Test overlays endpoint
curl http://localhost:5000/api/overlays

# Expected output:
# {"overlays":[],"success":true}

# Test create overlay
curl -X POST http://localhost:5000/api/overlays \
  -H "Content-Type: application/json" \
  -d '{"type":"text","content":"Test Overlay"}'

# Expected output:
# {"id":"...","overlay":{...},"success":true}

# Test get overlays again
curl http://localhost:5000/api/overlays

# Expected output:
# {"overlays":[{"id":"...","type":"text","content":"Test Overlay",...}],"success":true}
```

### Test 4: Start Frontend

```bash
# Terminal 3 (or new Terminal 4)
cd frontend
npm run dev

# Expected output:
# VITE v5.0.0  ready in XXX ms
#
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.x.x:5173/
# ➜  press h to show help
```

**Success Indicators:**
- ✅ "ready in XXX ms" message appears
- ✅ Local URL shown: http://localhost:5173/
- ✅ No compilation errors

**Common Errors:**
- ❌ "EADDRINUSE" → Port 5173 occupied, kill other process or change port in vite.config.js
- ❌ "Module not found" → Run `npm install` again
- ❌ Build errors → Check Node.js version is 16+

### Test 5: Access Frontend

```bash
# Open your web browser
# Navigate to: http://localhost:5173

# You should see:
# - Header: "RTSP Livestream Overlay Application"
# - Input field for RTSP URL
# - "Start Stream" button
# - Sidebar with "Add Overlay" form
# - "Overlays (0)" section
```

**Browser Console Check (F12):**
- ✅ No red errors
- ✅ May see some warnings (normal)

### Test 6: Stream Playback

```bash
# In browser at http://localhost:5173

# 1. Enter RTSP URL:
rtsp://rtsp.stream/pattern

# 2. Click "Start Stream" button

# 3. Wait 5-10 seconds

# 4. Video should start playing with:
#    - Color pattern with moving timestamp
#    - Video controls (play/pause, volume, fullscreen)
```

**Check Backend Terminal:**
```
INFO - Starting FFmpeg with command: ffmpeg -rtsp_transport tcp -i rtsp://rtsp.stream/pattern ...
INFO - FFmpeg process started with PID: XXXXX
```

**If video doesn't play:**
- Wait up to 15 seconds (initialization takes time)
- Check browser console (F12) for errors
- Check backend terminal for FFmpeg errors
- Try alternative URL: `rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4`

### Test 7: Create Text Overlay

```bash
# In browser sidebar:

# 1. Ensure "Text" radio button is selected
# 2. Enter in textarea: "LIVE"
# 3. Click "Add Overlay" button

# Expected result:
# - Green toast notification: "Overlay created successfully!"
# - Overlay appears on video at position (100, 100)
# - Overlay shows "LIVE" text with semi-transparent background
# - Overlay has blue border
# - Sidebar shows "Overlays (1)"
```

### Test 8: Drag and Resize Overlay

```bash
# In browser:

# 1. Click and hold on overlay
# 2. Drag to top-right corner
# 3. Release mouse
# Expected: Overlay moves smoothly

# 4. Hover over bottom-right corner (resize handle appears)
# 5. Click and drag to resize
# Expected: Overlay resizes smoothly

# 6. Check backend terminal
# Expected: No errors, may see update requests in logs
```

### Test 9: Create Image Overlay

```bash
# In browser sidebar:

# 1. Click "Image" radio button
# 2. Enter URL: https://via.placeholder.com/150/0000FF/FFFFFF?text=LOGO
# 3. Click "Add Overlay" button

# Expected result:
# - Green toast notification
# - Image overlay appears on video
# - Both text and image overlays visible
# - Sidebar shows "Overlays (2)"

# 4. Drag image overlay to bottom-left
# 5. Resize as needed
```

### Test 10: Delete Overlay

```bash
# In browser:

# Method 1 - Hover delete:
# 1. Hover over overlay on video
# 2. Red X button appears in top-right corner
# 3. Click X button
# 4. Confirm deletion in dialog
# Expected: Overlay removed immediately

# Method 2 - Sidebar delete:
# 1. Find overlay in sidebar list
# 2. Click red trash icon
# 3. Confirm deletion
# Expected: Overlay removed from video and list
```

### Test 11: Persistence Test

```bash
# In browser with overlays on screen:

# 1. Note the positions of all overlays
# 2. Press F5 to refresh page
# 3. Wait for page to reload

# Expected result:
# - All overlays reappear in exact same positions
# - Overlay list shows all overlays
# - Video player resets (need to restart stream)

# This proves MongoDB persistence works!
```

### Test 12: Stop Stream

```bash
# In browser:

# 1. Click "Stop Stream" button
# 2. Expected result:
#    - Video stops playing
#    - Overlays remain visible (in their last positions)
#    - Input field reappears
#    - "Start Stream" button available again

# Check backend terminal:
# Expected: "Cleaning up FFmpeg process..." message
```

---

## Common Issues

### Issue 1: Port Already in Use

**Symptom:**
```
OSError: [Errno 48] Address already in use
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Issue 2: MongoDB Connection Failed

**Symptom:**
```
Failed to connect to MongoDB
```

**Solutions:**

1. **Check MongoDB is running:**
```bash
# See if mongod process exists
pgrep mongod

# If not running, start it
mongod
```

2. **Check connection string:**
```bash
# In backend/.env
# Local:
MONGODB_URI=mongodb://localhost:27017/

# Atlas (with correct credentials):
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

3. **For Atlas, whitelist IP:**
- Go to MongoDB Atlas dashboard
- Network Access → Add IP Address
- Add current IP or 0.0.0.0/0 (testing only)

### Issue 3: FFmpeg Not Found

**Symptom:**
```
FFmpeg is not installed or not in PATH
```

**Solutions:**

**macOS:**
```bash
brew install ffmpeg
# Verify
which ffmpeg
ffmpeg -version
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
# Verify
which ffmpeg
ffmpeg -version
```

**Windows:**
1. Download from https://ffmpeg.org
2. Extract to C:\ffmpeg
3. Add C:\ffmpeg\bin to System PATH
4. Restart terminal
5. Verify: `ffmpeg -version`

### Issue 4: Video Not Playing

**Symptom:** Stream starts but no video appears

**Solutions:**

1. **Wait longer** - Initial buffering takes 5-15 seconds

2. **Check FFmpeg is running:**
```bash
# In backend terminal, should see:
# "FFmpeg process started with PID: XXXXX"
```

3. **Check HLS files generated:**
```bash
ls backend/static/stream/
# Should see: playlist.m3u8 and segment*.ts files
```

4. **Try different RTSP URL:**
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

5. **Check browser console** (F12):
- Look for network errors
- Check if playlist.m3u8 is loading

### Issue 5: CORS Errors

**Symptom:** Browser console shows CORS policy errors

**Solutions:**

1. **Verify Flask-CORS installed:**
```bash
cd backend
source venv/bin/activate
pip list | grep Flask-CORS
# Should show: Flask-CORS 4.0.0
```

2. **Check CORS in app.py:**
```python
from flask_cors import CORS
CORS(app)
```

3. **Verify both servers running:**
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Issue 6: Overlays Not Saving

**Symptom:** Overlays disappear after refresh

**Solutions:**

1. **Check MongoDB connection in backend terminal:**
```
INFO - Connected to MongoDB: rtsp_overlay_db
```

2. **Test database directly:**
```bash
# Connect to MongoDB
mongosh  # or mongo

# Use database
use rtsp_overlay_db

# Check collections
show collections

# View overlays
db.overlays.find()
```

3. **Check browser console** (F12):
- Look for API errors (400, 404, 500 status codes)
- Verify POST requests are successful (200 status)

### Issue 7: npm Install Errors

**Symptom:** Errors during `npm install`

**Solutions:**

1. **Clear npm cache:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Update npm:**
```bash
npm install -g npm@latest
```

3. **Use compatible Node version:**
```bash
node --version
# Should be 16.x or higher
```

---

## Test Checklist

Use this checklist to verify complete installation:

### Prerequisites
- [ ] Python 3.8+ installed and verified
- [ ] Node.js 16+ installed and verified
- [ ] npm 8+ installed and verified
- [ ] FFmpeg installed and in PATH
- [ ] MongoDB installed or Atlas account created

### Backend Setup
- [ ] Virtual environment created
- [ ] Virtual environment activated
- [ ] Dependencies installed from requirements.txt
- [ ] .env file created and configured
- [ ] MongoDB connection string correct

### Frontend Setup
- [ ] Dependencies installed with npm install
- [ ] No installation errors
- [ ] All packages listed in package.json installed

### Backend Testing
- [ ] MongoDB starts successfully (or Atlas accessible)
- [ ] Flask backend starts without errors
- [ ] "Connected to MongoDB" message appears
- [ ] Health endpoint responds: `curl http://localhost:5000/health`
- [ ] Overlays API responds: `curl http://localhost:5000/api/overlays`

### Frontend Testing
- [ ] Development server starts with `npm run dev`
- [ ] No compilation errors
- [ ] Browser opens to http://localhost:5173
- [ ] Application UI loads correctly
- [ ] No console errors in browser (F12)

### Functionality Testing
- [ ] RTSP URL can be entered
- [ ] Stream starts successfully
- [ ] Video plays in browser
- [ ] Video controls work (play, pause, volume)
- [ ] Text overlay can be created
- [ ] Text overlay appears on video
- [ ] Text overlay can be dragged
- [ ] Text overlay can be resized
- [ ] Image overlay can be created
- [ ] Image overlay appears on video
- [ ] Multiple overlays work simultaneously
- [ ] Overlays can be deleted
- [ ] Overlays persist after page refresh
- [ ] Stream can be stopped
- [ ] Stream can be restarted

### Final Verification
- [ ] All three terminals running without errors
- [ ] MongoDB connected
- [ ] Backend API responding
- [ ] Frontend UI functional
- [ ] RTSP streaming working
- [ ] Overlay CRUD operations working
- [ ] Data persisting in MongoDB
- [ ] No memory leaks or hung processes

---

## Success Criteria

Your installation is successful when:

1. ✅ All three services start without errors
2. ✅ Video streams play in browser
3. ✅ Overlays can be created, moved, resized, deleted
4. ✅ Overlays persist after page refresh
5. ✅ No critical errors in any terminal or browser console

---

## Next Steps

Once installation is verified:

1. **Read full documentation:** [README.md](README.md)
2. **Review API documentation:** See API section in README
3. **Explore code:** Review backend and frontend code
4. **Record demo video:** Use [DEMO_VIDEO_SCRIPT.md](DEMO_VIDEO_SCRIPT.md)
5. **Customize:** Modify for your specific needs

---

## Getting Help

If issues persist after following this guide:

1. **Check logs:**
   - Backend terminal output
   - Frontend terminal output
   - Browser console (F12)
   - MongoDB logs (if local)

2. **Verify versions:**
   ```bash
   python3 --version
   node --version
   npm --version
   ffmpeg -version
   mongod --version
   ```

3. **Check documentation:**
   - [README.md](README.md) - Complete documentation
   - [backend/README.md](backend/README.md) - Backend details
   - [frontend/README.md](frontend/README.md) - Frontend details
   - [QUICK_START.md](QUICK_START.md) - Quick reference

4. **Test individually:**
   - Test MongoDB connection separately
   - Test FFmpeg command-line separately
   - Test backend API with curl
   - Test frontend in isolation

---

**Installation complete! Ready to stream with overlays! 🎥**
