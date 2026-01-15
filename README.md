# RTSP Livestream Overlay Application

A full-stack web application that enables real-time RTSP livestream playback in web browsers with customizable drag-and-drop overlays.

## Overview

This application converts RTSP streams to HLS format for browser compatibility and provides an intuitive interface for adding and managing text and image overlays on live video streams.

### Key Features

- **RTSP to HLS Conversion**: Real-time stream conversion using FFmpeg
- **Browser-Compatible Playback**: HLS streaming via Video.js player  
- **Interactive Overlays**: Drag-and-drop positioning with react-rnd
- **Persistent Storage**: MongoDB database for overlay configurations
- **Fullscreen Support**: Overlays maintain position in fullscreen mode
- **Real-Time Updates**: Automatic overlay synchronization
- **Opacity Control**: Adjustable transparency for each overlay
- **Text & Image Support**: Multiple overlay types with intuitive controls

## Architecture

```
RTSP Source → Flask Backend (FFmpeg) → HLS Segments → React Frontend (Video.js + Overlays)
                      ↓
                  MongoDB (Overlay Storage)
```

**Technical Flow:**
1. Backend receives RTSP URL and converts stream to HLS using FFmpeg
2. Frontend fetches HLS playlist and renders video using Video.js
3. Overlays are CSS layers positioned absolutely over the video
4. User interactions update overlay positions in MongoDB
5. Percentage-based positioning ensures overlays scale correctly in fullscreen

## Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **MongoDB** (Local or Atlas)
- **FFmpeg** (Required for stream conversion)

### Installing FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd RTSP_Overlay
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI
```

**`.env` Configuration:**
```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=rtsp_overlay_db
SECRET_KEY=your-secret-key
FLASK_ENV=development
HOST=0.0.0.0
PORT=5000
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python app.py
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

### Access Application
Open browser: **http://localhost:5173**

## Usage Guide

### Starting a Stream

1. Enter an RTSP URL in the input field
2. Click **Start Stream**
3. Wait 5-10 seconds for initialization (FFmpeg generates HLS segments)
4. Video begins playing

**Test RTSP URLs:**
```
rtsp://rtsp.stream/pattern
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

### Creating Overlays

**Text Overlay:**
1. Select **Text** type
2. Enter text content
3. Adjust opacity slider (10-100%)
4. Click **Add Overlay**

**Image Overlay:**
1. Select **Image** type
2. Enter publicly accessible image URL
3. Adjust opacity slider (10-100%)
4. Click **Add Overlay**

### Managing Overlays

- **Drag** to reposition anywhere on video
- **Resize** using corner/edge handles
- **Adjust opacity** using slider when selected
- **Delete** by clicking X button or pressing Delete/Backspace key
- **Auto-deselect** after 5 seconds of inactivity
- **Fullscreen** maintains relative positions automatically

All changes save automatically to MongoDB.

## API Endpoints

### Stream Management

**Start Stream**
```http
POST /api/stream/start
Content-Type: application/json

{
  "rtsp_url": "rtsp://example.com/stream"
}
```

**Stop Stream**
```http
POST /api/stream/stop
```

**Stream Status**
```http
GET /api/stream/status
```

### Overlay Management

**Get All Overlays**
```http
GET /api/overlays
```

**Create Overlay**
```http
POST /api/overlays
Content-Type: application/json

{
  "type": "text",
  "content": "LIVE",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 200, "height": 100 },
  "positionPercent": { "x": 10, "y": 10 },
  "sizePercent": { "width": 20, "height": 15 },
  "opacity": 1.0
}
```

**Update Overlay**
```http
PUT /api/overlays/:id
Content-Type: application/json

{
  "position": { "x": 150, "y": 200 },
  "size": { "width": 250, "height": 120 }
}
```

**Delete Overlay**
```http
DELETE /api/overlays/:id
```

## Troubleshooting

### FFmpeg Not Found
```bash
# Verify installation
ffmpeg -version

# If not found, install using package manager
```

### MongoDB Connection Failed
```bash
# Local MongoDB - ensure it's running
mongod

# Atlas - verify connection string and IP whitelist
```

### Video Not Playing
- Wait 10 seconds for HLS initialization
- Check browser console (F12) for errors
- Verify FFmpeg process in backend terminal
- Test with known working RTSP URLs

### Overlays Not Saving
- Check MongoDB connection in backend logs
- Test API endpoints with curl/Postman
- Review browser console for network errors

## Tech Stack

**Backend:**
- Python 3.8+, Flask 3.0.0, FFmpeg, pymongo 4.10.1

**Frontend:**
- React 18.2.0, Video.js 8.10.0, react-rnd 10.4.1, Tailwind CSS 3.4.0, Vite 5.0.0

**Database:**
- MongoDB 4.4+

## Project Structure

```
RTSP_Overlay/
├── backend/
│   ├── app.py              # Flask application & API routes
│   ├── config.py           # Configuration management
│   ├── models.py           # MongoDB operations
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment template
│   └── static/stream/      # HLS output (auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoPlayer.jsx        # Video.js player
│   │   │   ├── Overlay.jsx            # Overlay component
│   │   │   ├── OverlayControls.jsx    # Creation form
│   │   │   └── OverlayList.jsx        # Management list
│   │   ├── services/api.js            # API client
│   │   ├── App.jsx                    # Main component
│   │   └── main.jsx                   # Entry point
│   ├── package.json        # Dependencies
│   ├── vite.config.js      # Build config
│   └── tailwind.config.js  # CSS config
│
├── .gitignore
├── start_app.sh            # Quick start script
└── README.md
```

## Known Limitations

1. **HLS Latency**: 6-10 second delay is inherent to HLS protocol
2. **Single Stream**: One active RTSP stream at a time
3. **Image URLs**: Must be publicly accessible and CORS-enabled
4. **Browser Support**: Requires modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

## License

Educational project created for internship assignment demonstration.

---

**Built with React, Flask, Video.js, and MongoDB**
