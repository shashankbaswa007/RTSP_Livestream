# Quick Start Guide

Get the RTSP Livestream Overlay Application running in 5 minutes!

## Prerequisites Check

```bash
# Check Python
python3 --version  # Need 3.8+

# Check Node.js
node --version     # Need 16+

# Check FFmpeg
ffmpeg -version

# Check MongoDB (if using local)
mongod --version
```

## Installation (5 steps)

### 1. Clone and Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### 2. Configure Environment

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=rtsp_overlay_db
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

### 4. Start Services (3 terminals)

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Backend:**
```bash
cd backend
source venv/bin/activate
python app.py
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Open Browser

Navigate to: **http://localhost:5173**

## First Test

1. Enter RTSP URL: `rtsp://rtsp.stream/pattern`
2. Click "Start Stream"
3. Wait 5-10 seconds
4. Video should play!

## Create Your First Overlay

1. Select "Text" type
2. Enter "LIVE" as content
3. Click "Add Overlay"
4. Drag to position
5. Resize as needed

## Troubleshooting

**Video not playing?**
- Wait longer (up to 15 seconds)
- Check backend terminal for errors
- Try alternative URL: `rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4`

**MongoDB error?**
- Ensure `mongod` is running
- Check connection string in `.env`

**FFmpeg error?**
- Install FFmpeg: `brew install ffmpeg` (macOS) or `sudo apt install ffmpeg` (Linux)

## Need Help?

See full documentation in [README.md](README.md)

---

**Happy Streaming! 🎥**
