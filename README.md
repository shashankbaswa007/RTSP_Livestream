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

### Livestream Playback

#### How to Provide or Change RTSP URL

**Method 1: Using the Web Interface (Recommended)**

1. Open the application in your browser at `http://localhost:5173`
2. Locate the RTSP URL input field at the top of the video player section
3. Enter your RTSP stream URL (e.g., `rtsp://example.com:554/live/stream`)
4. Click the **"Start Stream"** button
5. Wait 5-10 seconds for FFmpeg to initialize and generate HLS segments
6. The video will begin playing automatically

**To Change Stream:**
1. Click the **"Stop Stream"** button (red square icon)
2. Enter a new RTSP URL in the input field
3. Click **"Start Stream"** again

**Method 2: Using API Endpoint**

```bash
curl -X POST http://localhost:5000/api/stream/start \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url": "rtsp://your-stream-url"}'
```

**Test RTSP URLs:**
```
# Pattern test stream with timestamp
rtsp://rtsp.stream/pattern

# Big Buck Bunny video stream
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4
```

**RTSP URL Format:**
```
rtsp://[username:password@]host[:port]/path
```

**Examples:**
- Without authentication: `rtsp://192.168.1.100:554/live`
- With authentication: `rtsp://admin:password@camera.local/stream1`
- Custom port: `rtsp://server.com:8554/live/channel1`

**Important Notes:**
- Only one stream can be active at a time
- Starting a new stream automatically stops the current one
- The application converts RTSP to HLS format automatically
- Initial buffering delay of 5-10 seconds is normal

### Overlay Management

#### Creating Overlays

**Text Overlay:**
1. In the right sidebar, locate **"Add Overlay"** section
2. Select **"Text"** radio button
3. Enter your text in the textarea (e.g., "LIVE", "Breaking News", "Weather Alert")
4. Adjust the **opacity slider** (10-100%) for transparency
5. Click **"Add Overlay"** button
6. The overlay appears at the default position (10% from top-left)

**Image Overlay:**
1. Select **"Image"** radio button
2. Enter a publicly accessible image URL in the textarea:
   ```
   https://example.com/logo.png
   https://i.imgur.com/sample.jpg
   ```
3. Adjust the **opacity slider** (10-100%)
4. Click **"Add Overlay"** button
5. The image appears as an overlay on the video

**Image URL Requirements:**
- Must be publicly accessible (no authentication)
- Must be a direct link to an image file
- Supported formats: PNG, JPG, JPEG, GIF, SVG
- Must have CORS enabled (allow cross-origin requests)

#### Manipulating Overlays

**Selecting an Overlay:**
- Click on any overlay to select it
- Selected overlays show a blue border
- Opacity slider appears when selected
- Auto-deselects after 5 seconds of inactivity

**Repositioning:**
- Click and drag the overlay to move it anywhere on the video
- Position is saved automatically to MongoDB
- Works in both normal and fullscreen mode

**Resizing:**
- Click and drag any corner handle to resize proportionally
- Click and drag edge handles to resize in one dimension
- Size is saved automatically to MongoDB
- Maintains aspect ratio when desired

**Adjusting Opacity:**
1. Select the overlay by clicking on it
2. Use the opacity slider that appears below the overlay
3. Drag slider left (more transparent) or right (more opaque)
4. Release to save the new opacity value

**Deleting Overlays:**
- **Method 1**: Hover over overlay and click the red **X** button in the top-right corner
- **Method 2**: Select overlay and press **Delete** or **Backspace** key on keyboard
- **Method 3**: Click the trash icon in the overlay list sidebar

**Viewing All Overlays:**
- The right sidebar shows all active overlays
- Each overlay card displays:
  - Type (Text or Image)
  - Content preview
  - Delete button (trash icon)

#### Fullscreen Mode

- Click the fullscreen button in the video player controls
- Overlays automatically maintain their relative positions
- Drag and resize functionality works in fullscreen
- Exit fullscreen to return to normal mode
- All position changes are preserved

### Persistence

All overlay modifications are automatically saved to MongoDB:
- Position changes (drag)
- Size changes (resize)
- Opacity adjustments
- Creation and deletion

Overlays persist across:
- Page refreshes
- Browser restarts
- Application restarts
- Different sessions

## API Documentation

### Base URL
```
http://localhost:5000/api
```

All endpoints return JSON responses with the following structure:
```json
{
  "success": true/false,
  "data": {},
  "message": "Description",
  "error": "Error details (if applicable)"
}
```

---

### Stream Management Endpoints

#### 1. Start Stream

Starts RTSP to HLS conversion and begins streaming.

**Endpoint:** `POST /api/stream/start`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "rtsp_url": "rtsp://example.com:554/stream"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rtsp_url | string | Yes | Valid RTSP stream URL |

**Success Response (200 OK):**
```json
{
  "success": true,
  "hls_url": "http://localhost:5000/static/stream/playlist.m3u8",
  "message": "Stream started successfully"
}
```

**Error Responses:**

*400 Bad Request - Missing RTSP URL:*
```json
{
  "success": false,
  "error": "RTSP URL is required"
}
```

*400 Bad Request - Invalid URL Format:*
```json
{
  "success": false,
  "error": "Invalid RTSP URL format"
}
```

*500 Internal Server Error - FFmpeg Failed:*
```json
{
  "success": false,
  "error": "Failed to start stream: FFmpeg not found"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/stream/start \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url": "rtsp://rtsp.stream/pattern"}'
```

---

#### 2. Stop Stream

Stops the current stream and terminates FFmpeg process.

**Endpoint:** `POST /api/stream/stop`

**Request Headers:** None required

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Stream stopped successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "No active stream to stop"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/stream/stop
```

---

#### 3. Get Stream Status

Retrieves current stream status and information.

**Endpoint:** `GET /api/stream/status`

**Request Headers:** None required

**Request Body:** None

**Success Response (200 OK) - Active Stream:**
```json
{
  "success": true,
  "active": true,
  "rtsp_url": "rtsp://example.com/stream",
  "hls_url": "http://localhost:5000/static/stream/playlist.m3u8"
}
```

**Success Response (200 OK) - No Active Stream:**
```json
{
  "success": true,
  "active": false,
  "rtsp_url": null
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/stream/status
```

---

### Overlay Management Endpoints (CRUD Operations)

#### 1. Get All Overlays (READ)

Retrieves all overlays from the database.

**Endpoint:** `GET /api/overlays`

**Request Headers:** None required

**Request Body:** None

**Success Response (200 OK):**
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
      "positionPercent": { "x": 10, "y": 10 },
      "sizePercent": { "width": 20, "height": 15 },
      "opacity": 1.0,
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-01-15T10:35:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "type": "image",
      "content": "https://example.com/logo.png",
      "position": { "x": 300, "y": 200 },
      "size": { "width": 150, "height": 150 },
      "positionPercent": { "x": 30, "y": 20 },
      "sizePercent": { "width": 15, "height": 15 },
      "opacity": 0.8,
      "createdAt": "2026-01-15T11:00:00.000Z",
      "updatedAt": "2026-01-15T11:05:00.000Z"
    }
  ]
}
```

**Empty Response (200 OK):**
```json
{
  "success": true,
  "overlays": []
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/overlays
```

---

#### 2. Create Overlay (CREATE)

Creates a new overlay in the database.

**Endpoint:** `POST /api/overlays`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "text",
  "content": "LIVE BROADCAST",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 200, "height": 100 },
  "positionPercent": { "x": 10, "y": 10 },
  "sizePercent": { "width": 20, "height": 15 },
  "opacity": 0.9
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | "text" or "image" |
| content | string | Yes | Text content or image URL |
| position | object | No | {x, y} pixel coordinates (default: {x:100, y:100}) |
| size | object | No | {width, height} in pixels (default: {width:200, height:100}) |
| positionPercent | object | No | {x, y} percentage coordinates (default: {x:10, y:10}) |
| sizePercent | object | No | {width, height} percentages (default: {width:20, height:15}) |
| opacity | number | No | 0.0 to 1.0 (default: 1.0) |

**Success Response (201 Created):**
```json
{
  "success": true,
  "id": "507f1f77bcf86cd799439011",
  "overlay": {
    "id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "LIVE BROADCAST",
    "position": { "x": 100, "y": 100 },
    "size": { "width": 200, "height": 100 },
    "positionPercent": { "x": 10, "y": 10 },
    "sizePercent": { "width": 20, "height": 15 },
    "opacity": 0.9,
    "createdAt": "2026-01-15T12:00:00.000Z",
    "updatedAt": "2026-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**

*400 Bad Request - Missing Required Fields:*
```json
{
  "success": false,
  "error": "Missing required fields: type, content"
}
```

*400 Bad Request - Invalid Type:*
```json
{
  "success": false,
  "error": "Invalid overlay type. Must be 'text' or 'image'"
}
```

**cURL Examples:**

*Text Overlay:*
```bash
curl -X POST http://localhost:5000/api/overlays \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "LIVE",
    "opacity": 0.9
  }'
```

*Image Overlay:*
```bash
curl -X POST http://localhost:5000/api/overlays \
  -H "Content-Type: application/json" \
  -d '{
    "type": "image",
    "content": "https://example.com/logo.png",
    "opacity": 0.8
  }'
```

---

#### 3. Get Single Overlay (READ)

Retrieves a specific overlay by its ID.

**Endpoint:** `GET /api/overlays/:id`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId of the overlay |

**Success Response (200 OK):**
```json
{
  "success": true,
  "overlay": {
    "id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "LIVE",
    "position": { "x": 100, "y": 100 },
    "size": { "width": 200, "height": 100 },
    "positionPercent": { "x": 10, "y": 10 },
    "sizePercent": { "width": 20, "height": 15 },
    "opacity": 1.0,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:35:00.000Z"
  }
}
```

**Error Responses:**

*400 Bad Request - Invalid ID Format:*
```json
{
  "success": false,
  "error": "Invalid overlay ID format"
}
```

*404 Not Found:*
```json
{
  "success": false,
  "error": "Overlay not found"
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/overlays/507f1f77bcf86cd799439011
```

---

#### 4. Update Overlay (UPDATE)

Updates an existing overlay's properties.

**Endpoint:** `PUT /api/overlays/:id`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId of the overlay |

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "position": { "x": 150, "y": 200 },
  "size": { "width": 250, "height": 120 },
  "positionPercent": { "x": 15, "y": 20 },
  "sizePercent": { "width": 25, "height": 12 },
  "content": "UPDATED TEXT",
  "opacity": 0.85
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| position | object | No | Updated {x, y} pixel coordinates |
| size | object | No | Updated {width, height} in pixels |
| positionPercent | object | No | Updated {x, y} percentages |
| sizePercent | object | No | Updated {width, height} percentages |
| content | string | No | Updated text or image URL |
| opacity | number | No | Updated opacity (0.0 to 1.0) |

**Success Response (200 OK):**
```json
{
  "success": true,
  "overlay": {
    "id": "507f1f77bcf86cd799439011",
    "type": "text",
    "content": "UPDATED TEXT",
    "position": { "x": 150, "y": 200 },
    "size": { "width": 250, "height": 120 },
    "positionPercent": { "x": 15, "y": 20 },
    "sizePercent": { "width": 25, "height": 12 },
    "opacity": 0.85,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T12:30:00.000Z"
  }
}
```

**Error Responses:**

*400 Bad Request - Invalid ID:*
```json
{
  "success": false,
  "error": "Invalid overlay ID format"
}
```

*404 Not Found:*
```json
{
  "success": false,
  "error": "Overlay not found"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/overlays/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "position": {"x": 200, "y": 150},
    "opacity": 0.7
  }'
```

---

#### 5. Delete Overlay (DELETE)

Deletes an overlay from the database.

**Endpoint:** `DELETE /api/overlays/:id`

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | MongoDB ObjectId of the overlay |

**Request Headers:** None required

**Request Body:** None

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Overlay deleted successfully"
}
```

**Error Responses:**

*400 Bad Request - Invalid ID:*
```json
{
  "success": false,
  "error": "Invalid overlay ID format"
}
```

*404 Not Found:*
```json
{
  "success": false,
  "error": "Overlay not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/overlays/507f1f77bcf86cd799439011
```

---

### Error Handling

All API endpoints follow consistent error response format:

**Client Errors (4xx):**
```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

**Server Errors (5xx):**
```json
{
  "success": false,
  "error": "Internal server error description"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

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
