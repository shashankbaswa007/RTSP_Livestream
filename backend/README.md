# RTSP Overlay Backend

Flask backend for RTSP to HLS stream conversion and overlay management.

## Features

- RTSP to HLS conversion using FFmpeg
- RESTful API for stream and overlay management
- MongoDB integration for persistent storage
- Comprehensive error handling and logging
- Graceful FFmpeg process cleanup

## Tech Stack

- **Flask 3.0.0**: Web framework
- **Flask-CORS 4.0.0**: Cross-origin support
- **pymongo 4.6.0**: MongoDB driver
- **python-dotenv 1.0.0**: Environment management
- **FFmpeg**: Stream conversion (external dependency)

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=rtsp_overlay_db
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
HOST=0.0.0.0
PORT=5000
```

### 4. Install FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:** Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

### 5. Start MongoDB

```bash
mongod
```

Or use MongoDB Atlas cloud database.

### 6. Run Application

```bash
python app.py
```

Server runs on http://localhost:5000

## API Endpoints

### Stream Management

- `POST /api/stream/start` - Start RTSP stream
- `POST /api/stream/stop` - Stop current stream
- `GET /api/stream/status` - Get stream status

### Overlay CRUD

- `GET /api/overlays` - Get all overlays
- `POST /api/overlays` - Create overlay
- `GET /api/overlays/<id>` - Get single overlay
- `PUT /api/overlays/<id>` - Update overlay
- `DELETE /api/overlays/<id>` - Delete overlay

### Static Files

- `GET /static/stream/<filename>` - Serve HLS files

## Project Structure

```
backend/
├── app.py              # Main Flask application
├── config.py           # Configuration management
├── models.py           # MongoDB operations
├── requirements.txt    # Python dependencies
├── .env.example        # Environment template
├── .gitignore          # Git ignore patterns
└── static/
    └── stream/         # HLS output directory
```

## FFmpeg Configuration

The application uses these FFmpeg settings for optimal live streaming:

- **Transport**: TCP (reliable)
- **Video Codec**: H.264 (libx264)
- **Preset**: ultrafast (low latency)
- **Tune**: zerolatency (live streaming)
- **Audio Codec**: AAC (128k bitrate)
- **HLS Settings**:
  - 2-second segments
  - Keep last 5 segments
  - Auto-delete old segments

## Error Handling

All endpoints return consistent JSON responses:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Logging

Application uses Python's `logging` module with INFO level:

```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

Check terminal output for:
- MongoDB connection status
- FFmpeg process lifecycle
- API request handling
- Error messages

## Process Management

FFmpeg processes are carefully managed:

1. **Start**: New process spawned with `subprocess.Popen`
2. **Monitor**: Process stored in global variable
3. **Cleanup**: Terminated on stream stop or application exit
4. **Signals**: SIGTERM and SIGINT handled gracefully

## Development

### Testing Endpoints

Use curl or Postman:

```bash
# Start stream
curl -X POST http://localhost:5000/api/stream/start \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url": "rtsp://rtsp.stream/pattern"}'

# Get overlays
curl http://localhost:5000/api/overlays

# Create overlay
curl -X POST http://localhost:5000/api/overlays \
  -H "Content-Type: application/json" \
  -d '{"type": "text", "content": "LIVE"}'
```

### Debug Mode

Set `FLASK_ENV=development` in `.env` for:
- Auto-reload on code changes
- Detailed error pages
- Debug logging

## Production Considerations

Before deploying to production:

1. Change `SECRET_KEY` to a secure random value
2. Set `FLASK_ENV=production`
3. Use production WSGI server (Gunicorn, uWSGI)
4. Configure reverse proxy (Nginx, Apache)
5. Enable HTTPS
6. Implement authentication
7. Set up monitoring and logging
8. Configure firewall rules

## Troubleshooting

**FFmpeg not found:**
- Verify installation: `ffmpeg -version`
- Check PATH environment variable

**MongoDB connection failed:**
- Ensure MongoDB is running: `pgrep mongod`
- Verify connection string in `.env`
- Check firewall rules

**Stream not starting:**
- Validate RTSP URL format
- Check FFmpeg logs in terminal
- Verify network connectivity to stream source

## License

Educational project for technical internship assignment.
