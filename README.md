# RTSP Livestream Overlay Application

A production-ready full-stack web application that enables real-time RTSP livestream playback in web browsers with customizable drag-and-drop overlays.

## 🎯 Project Overview

This application solves the challenge of playing RTSP streams in web browsers (which lack native RTSP support) while providing an intuitive interface for adding, positioning, and managing overlays on the live video stream.

### Key Features

- **RTSP to HLS Conversion**: Real-time stream conversion using FFmpeg
- **Browser-Compatible Playback**: HLS streaming via Video.js player
- **Drag & Drop Overlays**: Interactive overlay positioning using react-rnd
- **Persistent Storage**: MongoDB database for overlay configurations
- **Real-Time Updates**: Automatic overlay synchronization
- **Text & Image Support**: Multiple overlay types
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

```
┌─────────────┐
│ RTSP Source │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   Flask Backend (Python)    │
│  - FFmpeg RTSP→HLS Convert  │
│  - REST API Endpoints       │
│  - Stream Management        │
└──────┬────────────┬─────────┘
       │            │
       ▼            ▼
┌─────────────┐  ┌──────────┐
│     HLS     │  │ MongoDB  │
│   Segments  │  │ Overlays │
└──────┬──────┘  └────┬─────┘
       │              │
       └──────┬───────┘
              ▼
┌────────────────────────────┐
│  React Frontend (Browser)  │
│  - Video.js HLS Player     │
│  - CSS Overlay Positioning │
│  - Drag & Drop Interface   │
└────────────────────────────┘
```

### Why This Architecture?

1. **RTSP Browser Limitation**: Browsers cannot play RTSP streams directly due to lack of native codec support and the real-time nature of the protocol.

2. **FFmpeg Conversion**: FFmpeg converts RTSP to HLS (HTTP Live Streaming) format in real-time, which browsers fully support.

3. **CSS Overlays**: Overlays are positioned using CSS absolute positioning over the video element, not embedded into the stream. This allows real-time positioning changes without video re-encoding.

4. **Data Flow**:
   - RTSP stream → FFmpeg → HLS segments (.m3u8 + .ts files)
   - Frontend fetches HLS playlist and plays via Video.js
   - Overlay data stored in MongoDB
   - Frontend renders overlays as CSS layers over video
   - User interactions update overlay positions in database

## 📋 Prerequisites

Before running this application, ensure you have:

### Required Software

- **Python 3.8 or higher**
  ```bash
  python3 --version
  ```

- **Node.js 16 or higher**
  ```bash
  node --version
  npm --version
  ```

- **MongoDB** (Local or Atlas)
  - Local: [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

- **FFmpeg** (Required for RTSP conversion)

  **Ubuntu/Debian:**
  ```bash
  sudo apt update
  sudo apt install ffmpeg
  ffmpeg -version
  ```

  **macOS (with Homebrew):**
  ```bash
  brew install ffmpeg
  ffmpeg -version
  ```

  **Windows:**
  1. Download from [FFmpeg Official Website](https://ffmpeg.org/download.html)
  2. Extract to `C:\ffmpeg`
  3. Add `C:\ffmpeg\bin` to System PATH
  4. Verify in Command Prompt:
     ```cmd
     ffmpeg -version
     ```

## 🚀 Installation

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create Python virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate virtual environment:**
   
   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```
   
   **Windows:**
   ```cmd
   venv\Scripts\activate
   ```

4. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/
   MONGODB_DB_NAME=rtsp_overlay_db
   SECRET_KEY=your-secret-key-here
   FLASK_ENV=development
   HOST=0.0.0.0
   PORT=5000
   ```
   
   **For MongoDB Atlas:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

## 🎬 Running the Application

You need **three terminal windows**:

### Terminal 1: Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
No action needed - already running in cloud

### Terminal 2: Start Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

Expected output:
```
INFO - Connected to MongoDB: rtsp_overlay_db
INFO - Starting Flask application on 0.0.0.0:5000
INFO - Debug mode: True
* Running on http://0.0.0.0:5000
```

### Terminal 3: Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.x:5173/
```

### Access Application

Open your browser and navigate to: **http://localhost:5173**

## 🧪 Testing with Sample RTSP URLs

Here are working public RTSP test streams:

### Test Stream 1: Pattern Test
```
rtsp://rtsp.stream/pattern
```
- Displays color pattern with timestamp
- Good for testing basic functionality

### Test Stream 2: Big Buck Bunny
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```
- Open-source animation video
- Good for testing with actual video content

### How to Test

1. **Enter RTSP URL** in the input field on the main page
2. **Click "Start Stream"** button
3. **Wait 5-10 seconds** for stream initialization (FFmpeg needs time to generate HLS segments)
4. **Video should begin playing** in the browser with full controls

**Note:** If video doesn't play immediately, wait a few more seconds. Initial buffering is normal.

## 🎨 Using the Overlay System

### Creating Text Overlay

1. In the **Add Overlay** section on the right sidebar
2. Select **Text** radio button
3. Enter your text in the textarea (e.g., "LIVE", "Breaking News", etc.)
4. Click **Add Overlay** button
5. Overlay appears at default position (100, 100)
6. **Drag** the overlay to reposition anywhere on the video
7. **Drag corner handles** to resize the overlay
8. Changes save automatically to MongoDB

### Creating Image Overlay

1. Select **Image** radio button
2. Enter a **publicly accessible image URL**:
   ```
   https://example.com/logo.png
   ```
3. Click **Add Overlay** button
4. Image appears as overlay on video
5. **Drag** to reposition
6. **Resize** using corner handles
7. Changes persist automatically

**Important:** Image URLs must be:
- Publicly accessible (no authentication required)
- CORS-enabled (allow cross-origin requests)
- Valid image formats (PNG, JPG, GIF, SVG)

### Managing Overlays

- **View All Overlays**: Listed in the "Overlays" section of sidebar
- **Delete Overlay**: Click the red trash icon on any overlay card or the X button when hovering over the overlay on video
- **Reposition**: Drag overlay to new location on video
- **Resize**: Drag any of the 8 resize handles (corners and edges)
- **Persistence**: All changes are automatically saved to MongoDB
- **Refresh Safe**: Overlays remain in exact positions after page refresh

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Stream Endpoints

#### Start Stream

**POST** `/stream/start`

Start RTSP to HLS conversion.

**Request Body:**
```json
{
  "rtsp_url": "rtsp://example.com/stream"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "hls_url": "http://localhost:5000/static/stream/playlist.m3u8",
  "message": "Stream started successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or missing RTSP URL
- `500 Internal Server Error`: FFmpeg not installed or stream error

#### Stop Stream

**POST** `/stream/stop`

Stop current stream and cleanup FFmpeg process.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stream stopped successfully"
}
```

#### Stream Status

**GET** `/stream/status`

Get current stream status.

**Response (200 OK):**
```json
{
  "success": true,
  "active": true,
  "rtsp_url": "rtsp://example.com/stream"
}
```

### Overlay Endpoints

#### Get All Overlays

**GET** `/overlays`

Retrieve all overlays from database.

**Response (200 OK):**
```json
{
  "success": true,
  "overlays": [
    {
      "id": "507f1f77bcf86cd799439011",
      "type": "text",
      "content": "LIVE",
      "position": { "x": 100, "y": 100 },
      "size": { "width": 200, "height": 100 },
      "createdAt": "2026-01-14T10:30:00.000Z",
      "updatedAt": "2026-01-14T10:35:00.000Z"
    }
  ]
}
```

#### Create Overlay

**POST** `/overlays`

Create new overlay in database.

**Request Body:**
```json
{
  "type": "text",
  "content": "LIVE BROADCAST",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 200, "height": 100 }
}
```

**Fields:**
- `type` (required): "text" or "image"
- `content` (required): Text string or image URL
- `position` (optional): Defaults to {x: 100, y: 100}
- `size` (optional): Defaults to {width: 200, height: 100}

**Response (201 Created):**
```json
{
  "success": true,
  "id": "507f1f77bcf86cd799439011",
  "overlay": { /* overlay object */ }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid type

#### Get Single Overlay

**GET** `/overlays/:id`

Retrieve specific overlay by ID.

**Response (200 OK):**
```json
{
  "success": true,
  "overlay": { /* overlay object */ }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ID format
- `404 Not Found`: Overlay doesn't exist

#### Update Overlay

**PUT** `/overlays/:id`

Update existing overlay properties.

**Request Body (all fields optional):**
```json
{
  "position": { "x": 150, "y": 200 },
  "size": { "width": 250, "height": 120 },
  "content": "UPDATED TEXT"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "overlay": { /* updated overlay object */ }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ID or data
- `404 Not Found`: Overlay doesn't exist

#### Delete Overlay

**DELETE** `/overlays/:id`

Delete overlay from database.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Overlay deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid ID format
- `404 Not Found`: Overlay doesn't exist

## 🔧 Troubleshooting

### FFmpeg Not Found Error

**Symptom:** Backend error: "FFmpeg is not installed or not in PATH"

**Solutions:**

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
which ffmpeg  # Verify installation
```

**macOS:**
```bash
brew install ffmpeg
which ffmpeg  # Verify installation
```

**Windows:**
1. Download FFmpeg from official website
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to System PATH:
   - Open System Properties → Environment Variables
   - Edit PATH variable
   - Add new entry: `C:\ffmpeg\bin`
4. Restart terminal and verify: `ffmpeg -version`

### MongoDB Connection Errors

**Symptom:** "Failed to connect to MongoDB"

**Solutions:**

**Local MongoDB:**
```bash
# Check if MongoDB is running
pgrep mongod

# Start MongoDB
mongod

# Verify connection
mongosh  # or mongo
```

**MongoDB Atlas:**
1. Verify connection string format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```
2. Whitelist your IP address in Atlas:
   - Go to Network Access → Add IP Address
   - Add current IP or use `0.0.0.0/0` for testing
3. Check username/password are correct
4. Ensure database user has read/write permissions

### Video Not Playing

**Symptom:** Stream starts but video doesn't appear

**Solutions:**

1. **Wait Longer**: HLS initialization takes 5-10 seconds
2. **Validate RTSP URL**: Test with known working URLs:
   ```
   rtsp://rtsp.stream/pattern
   rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
   ```
3. **Check Browser Console** (F12 → Console):
   - Look for Video.js or network errors
   - Check if HLS files are being requested
4. **Verify FFmpeg Process**:
   ```bash
   # Check Flask terminal for FFmpeg logs
   # Should see "Starting FFmpeg with command..."
   ```
5. **Check HLS Files Generated**:
   ```bash
   ls backend/static/stream/
   # Should see playlist.m3u8 and segment*.ts files
   ```

### CORS Errors

**Symptom:** "CORS policy blocked" in browser console

**Solutions:**

1. **Verify Flask-CORS Installed**:
   ```bash
   pip list | grep Flask-CORS
   ```

2. **Check Flask CORS Configuration** in `app.py`:
   ```python
   from flask_cors import CORS
   CORS(app)
   ```

3. **Verify Frontend API URL** in `src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

4. **Check Both Servers Running**:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

### Overlays Not Saving

**Symptom:** Overlays disappear after page refresh

**Solutions:**

1. **Check MongoDB Connection**:
   ```bash
   # In backend terminal, look for:
   # "Connected to MongoDB: rtsp_overlay_db"
   ```

2. **Test API Endpoints**:
   ```bash
   # Test overlay creation
   curl -X POST http://localhost:5000/api/overlays \
     -H "Content-Type: application/json" \
     -d '{"type":"text","content":"Test"}'
   ```

3. **Check Browser Console** (F12):
   - Look for API errors during overlay operations
   - Verify network requests are returning 200 status

4. **Review Flask Error Logs**:
   - Check backend terminal for error messages
   - Look for database connection or validation errors

## ⚠️ Known Limitations

1. **HLS Latency**: HLS streaming has inherent 6-10 second latency due to segment buffering. This is a protocol limitation, not a bug.

2. **RTSP URL Requirements**: RTSP URLs must be publicly accessible. The application does not currently support:
   - Authentication (username/password in URL)
   - Private networks requiring VPN
   - Streams behind firewalls

3. **FFmpeg Dependency**: FFmpeg must be installed on the system running the backend. It's not bundled with the application.

4. **Concurrent Streams**: Only one RTSP stream can be active at a time. Starting a new stream stops the previous one.

5. **Overlay Performance**: Recommend maximum 10 concurrent overlays for optimal performance. More overlays may impact browser rendering.

6. **Image URL Requirements**: Image overlay URLs must be:
   - Publicly accessible
   - CORS-enabled
   - Valid image formats (PNG, JPG, GIF, SVG)

7. **Browser Compatibility**: Requires modern browsers with HTML5 video support. Tested on:
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

## 🚀 Future Enhancements

Potential improvements for future versions:

### Authentication & Security
- RTSP stream authentication with username/password
- User authentication and authorization
- API key authentication for endpoints
- HTTPS/WSS support for secure streaming

### Streaming Features
- **WebRTC Support**: Lower latency streaming (< 1 second)
- **Multi-Stream Support**: Display multiple RTSP streams simultaneously
- **Stream Recording**: Save streams to video files
- **Playback Controls**: Pause, rewind (for recorded streams)
- **Quality Selection**: Multiple quality/bitrate options

### Overlay Features
- **Overlay Templates**: Pre-designed overlay layouts
- **Animations**: Fade in/out, slide, pulse effects
- **Opacity Control**: Adjustable transparency (0-100%)
- **Rotation**: Rotate overlays to any angle
- **Z-Index Management**: Control overlay stacking order
- **Rich Text**: Font selection, colors, styles, sizes
- **Drawing Tools**: Arrows, shapes, highlights
- **Timestamps**: Auto-updating time overlays

### User Experience
- **Drag Guidelines**: Snap-to-grid and alignment guides
- **Keyboard Shortcuts**: Quick overlay manipulation
- **Undo/Redo**: Operation history
- **Overlay Groups**: Save and load overlay configurations
- **Export/Import**: Share overlay setups between users

### Advanced Features
- **Analytics Dashboard**: Stream viewer statistics
- **Motion Detection**: Alert overlays on movement
- **AI Integration**: Object detection, face blur
- **Multi-Language**: Internationalization support
- **Mobile App**: Native iOS/Android applications

## 📚 Tech Stack Summary

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Backend programming language |
| Flask | 3.0.0 | Web framework and REST API |
| Flask-CORS | 4.0.0 | Cross-origin resource sharing |
| pymongo | 4.6.0 | MongoDB driver |
| python-dotenv | 1.0.0 | Environment variable management |
| FFmpeg | Latest | RTSP to HLS stream conversion |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Video.js | 8.10.0 | HLS video player |
| react-rnd | 10.4.1 | Drag and resize functionality |
| Axios | 1.6.5 | HTTP client |
| react-hot-toast | 2.4.1 | Toast notifications |
| lucide-react | 0.263.1 | Icon library |
| Tailwind CSS | 3.4.0 | Utility-first CSS framework |
| Vite | 5.0.0 | Build tool and dev server |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | 4.4+ | NoSQL database for overlay storage |

### Development Tools

| Tool | Purpose |
|------|---------|
| Python venv | Virtual environment isolation |
| npm | Node package management |
| ESLint | JavaScript linting |
| PostCSS | CSS processing |
| Autoprefixer | CSS vendor prefixing |

## 📝 Project Structure

```
rtsp-overlay-app/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── config.py              # Configuration management
│   ├── models.py              # MongoDB models and operations
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment variables template
│   ├── .gitignore             # Git ignore patterns
│   ├── static/
│   │   └── stream/            # HLS output directory (auto-created)
│   │       ├── playlist.m3u8  # HLS playlist (generated)
│   │       └── segment*.ts    # Video segments (generated)
│   └── README.md              # Backend documentation
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoPlayer.jsx      # Video.js player component
│   │   │   ├── Overlay.jsx          # Individual overlay component
│   │   │   ├── OverlayControls.jsx  # Overlay creation form
│   │   │   └── OverlayList.jsx      # Overlay management list
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── App.jsx                  # Main application component
│   │   ├── App.css                  # Minimal global styles
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind imports
│   ├── public/
│   │   └── vite.svg                 # Favicon
│   ├── index.html                   # HTML template
│   ├── package.json                 # NPM dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── .gitignore                   # Git ignore patterns
│   └── README.md                    # Frontend documentation
│
└── README.md                        # This file - main documentation
```

## 📄 License

This project is created for educational and demonstration purposes as part of a technical internship assignment.

## 🤝 Contributing

This is an internship assignment project. For suggestions or issues, please contact the project maintainer.

## 📞 Support

For questions or issues:
1. Check the Troubleshooting section above
2. Review API documentation
3. Check browser console for errors
4. Review Flask terminal logs
5. Verify all prerequisites are installed

---

**Built with ❤️ using React, Flask, Video.js, and MongoDB**
# RTSP_Livestream
