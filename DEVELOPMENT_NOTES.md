# Development Notes

Technical notes and important considerations for developers working with this application.

## Architecture Decisions

### Why RTSP → HLS Conversion?

**Problem:** Browsers cannot play RTSP streams natively.

**Reasons:**
1. RTSP uses proprietary codecs (H.264, AAC) that browsers don't support directly
2. RTSP is a stateful protocol unsuitable for HTTP-based browsers
3. Real-time nature requires specialized handling

**Solution:** Convert RTSP to HLS using FFmpeg
- HLS is HTTP-based and browser-compatible
- Supported by Video.js player library
- Works across all modern browsers

### Why CSS Overlays Instead of Video Embedding?

**Alternative Approach:** Embed overlays into video stream using FFmpeg filters

**Why CSS Instead:**
1. **Real-time Updates**: CSS overlays can be moved instantly without re-encoding
2. **Performance**: No video processing overhead
3. **Flexibility**: Full control over styling, animations, interactions
4. **Separation of Concerns**: Video playback independent of overlay rendering
5. **User Interaction**: Drag-and-drop only possible with DOM elements

**Trade-off:** Overlays not part of video recording if you export/save stream

### Why MongoDB Instead of SQL?

**Reasons:**
1. **Schema Flexibility**: Overlay structure can evolve without migrations
2. **JSON-Like Documents**: Natural fit for JavaScript frontend
3. **Easy Deployment**: Simple setup, no complex configuration
4. **ObjectId**: Built-in unique identifier generation
5. **Horizontal Scaling**: Future-proof for growth

**Alternative:** PostgreSQL with JSONB would also work well

## FFmpeg Configuration Deep Dive

### Transport Protocol: TCP vs UDP

```bash
-rtsp_transport tcp
```

**Why TCP?**
- UDP: Faster but can drop packets (video artifacts)
- TCP: Reliable delivery, crucial for live streams
- Trade-off: Slightly higher latency (~100ms)

**When to use UDP:** Low-latency requirements, packet loss acceptable

### Video Codec Settings

```bash
-c:v libx264           # H.264 video codec
-preset ultrafast      # Encoding speed preset
-tune zerolatency      # Latency optimization
```

**Preset Options:**
- `ultrafast`: Fastest encoding, larger file size
- `fast`: Good balance
- `medium`: Default, better compression
- `slow`: Best compression, high CPU usage

**For Production:** Consider `fast` or `medium` for better quality

**Tune Options:**
- `zerolatency`: Minimal buffering for live streams
- `film`: For high-quality video content
- `animation`: For animated content

### HLS Segmentation

```bash
-f hls                                    # HLS format
-hls_time 2                               # 2-second segments
-hls_list_size 5                          # Keep 5 segments
-hls_flags delete_segments+append_list   # Auto-cleanup
```

**Segment Duration Trade-offs:**

| Duration | Latency | Stability | Bandwidth |
|----------|---------|-----------|-----------|
| 1s | Low (5-6s) | Less stable | Higher overhead |
| 2s | Medium (6-10s) | Balanced | Optimal |
| 4s | High (12-20s) | Very stable | Lower overhead |
| 10s | Very high | Maximum | Minimum |

**Current Choice:** 2 seconds balances latency and stability

## Backend Architecture Details

### Process Management

**Global Variable Pattern:**
```python
ffmpeg_process = None  # Global process reference
```

**Why Global?**
- Multiple endpoints need access
- Cleanup on shutdown required
- Only one stream at a time

**Alternative:** Store in Redis/database for multi-instance support

### Error Handling Strategy

**Three-Tier Error Handling:**

1. **Business Logic Errors** (ValueError)
   - Invalid input
   - Validation failures
   - Return 400 Bad Request

2. **Resource Errors** (LookupError)
   - Not found
   - Already exists
   - Return 404 Not Found

3. **System Errors** (Exception)
   - Database failures
   - Process crashes
   - Return 500 Internal Server Error

### API Response Format

**Consistent Structure:**
```json
{
  "success": true/false,
  "data": { /* response data */ },
  "error": "error message if success is false"
}
```

**Benefits:**
- Frontend always knows structure
- Easy error detection
- Consistent handling

## Frontend Architecture Details

### State Management

**Current:** React useState hooks

**Why Not Redux?**
- Application is small/medium size
- State is mostly local to components
- No complex state interactions
- Simpler maintenance

**When to Use Redux:**
- Multiple unrelated components need same state
- Complex state updates
- Time-travel debugging needed

### Component Communication

**Pattern:** Props drilling with callbacks

```
App
├─ VideoPlayer (overlays, onUpdate, onDelete)
│  └─ Overlay (overlay, onUpdate, onDelete)
├─ OverlayControls (onCreate)
└─ OverlayList (overlays, onDelete)
```

**Alternative:** Context API for deep nesting (not needed here)

### Why Tailwind CSS?

**Advantages:**
1. No CSS file switching
2. Consistent design system
3. Responsive utilities
4. No naming conflicts
5. Purge unused styles

**Disadvantages:**
1. Verbose className strings
2. Learning curve
3. Less semantic HTML

**Alternative:** CSS Modules, Styled Components, or plain CSS

### Video.js Cleanup

**Critical:** Always dispose player on unmount

```javascript
useEffect(() => {
  return () => {
    if (playerRef.current) {
      playerRef.current.dispose();
    }
  };
}, []);
```

**Why?**
- Prevents memory leaks
- Releases video resources
- Stops network requests

## Performance Considerations

### Backend Performance

**Current Bottlenecks:**
1. FFmpeg CPU usage (can be 50-100% of one core)
2. MongoDB queries (not optimized yet)
3. Single-process Flask (not production-ready)

**Optimizations for Production:**
1. Use production WSGI server (Gunicorn, uWSGI)
2. Add MongoDB indexes on commonly queried fields
3. Implement caching for overlay queries (Redis)
4. Use FFmpeg hardware acceleration if available
5. Load balance multiple instances

### Frontend Performance

**Current Optimizations:**
1. Vite code splitting
2. React.memo for expensive components (can add)
3. Lazy loading (can add)

**Future Optimizations:**
1. Virtual scrolling for large overlay lists
2. Debounce overlay position updates
3. Throttle resize events
4. Implement React.memo on Overlay component

### Overlay Count Limits

**Recommended:** Maximum 10 overlays

**Why?**
- Each overlay is a DOM node with react-rnd
- Drag calculations on every mousemove
- Re-renders on position updates

**If More Needed:**
1. Implement virtualization
2. Optimize react-rnd settings
3. Use CSS transforms (better performance)
4. Batch position updates

## Security Considerations

### Current Security Measures

1. **Environment Variables:** Secrets not in code
2. **Input Validation:** All API inputs validated
3. **Error Messages:** No internal details exposed
4. **CORS:** Configured but permissive (development)

### Production Security Checklist

- [ ] Change SECRET_KEY to random secure value
- [ ] Enable HTTPS/TLS
- [ ] Implement authentication (JWT, OAuth)
- [ ] Add rate limiting (Flask-Limiter)
- [ ] Restrict CORS to specific origins
- [ ] Sanitize RTSP URLs (prevent command injection)
- [ ] Add input length limits
- [ ] Implement API versioning
- [ ] Add request logging
- [ ] Set up WAF (Web Application Firewall)
- [ ] Implement CSRF protection
- [ ] Validate image URLs (prevent SSRF)
- [ ] Add security headers (helmet.js equivalent)

### Command Injection Risk

**Current:**
```python
ffmpeg_cmd = ['ffmpeg', '-i', rtsp_url, ...]
```

**Safe Because:**
- Using list (not shell=True)
- subprocess.Popen doesn't execute in shell
- Arguments are separate items

**Still Validate:** Ensure RTSP URL format to prevent issues

## Database Design

### Schema Evolution

**Current Schema:**
```javascript
{
  type: "text" | "image",
  content: String,
  position: { x: Number, y: Number },
  size: { width: Number, height: Number },
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Possible Future Fields:**
```javascript
{
  // ... existing fields ...
  opacity: 0-100,              // Transparency
  rotation: 0-360,             // Rotation angle
  zIndex: Number,              // Stacking order
  animation: String,           // Animation type
  userId: String,              // Owner (multi-user)
  streamId: String,            // Associated stream (multi-stream)
  metadata: Object,            // Custom data
  permissions: Array,          // Who can edit
}
```

### Indexing Strategy

**Current:** No indexes (development)

**Production Indexes:**
```javascript
db.overlays.createIndex({ createdAt: -1 })      // List by date
db.overlays.createIndex({ userId: 1 })          // Filter by user
db.overlays.createIndex({ streamId: 1 })        // Filter by stream
db.overlays.createIndex({ type: 1 })            // Filter by type
```

## Testing Strategy

### Current Testing

**Manual Testing:** Comprehensive checklist in INSTALLATION_GUIDE.md

### Automated Testing (Future)

**Backend Tests:**
```bash
# pytest structure
tests/
  test_api.py         # API endpoint tests
  test_models.py      # Database operation tests
  test_stream.py      # FFmpeg integration tests
```

**Frontend Tests:**
```bash
# Jest + React Testing Library
src/
  components/
    __tests__/
      VideoPlayer.test.jsx
      Overlay.test.jsx
      OverlayControls.test.jsx
```

**Integration Tests:**
- End-to-end with Cypress or Playwright
- Test complete user workflows
- Mock RTSP streams for consistency

## Deployment Options

### Option 1: Traditional VPS

**Requirements:**
- Ubuntu 20.04+ server
- FFmpeg installed
- MongoDB installed or Atlas connection
- Nginx reverse proxy
- SSL certificate (Let's Encrypt)

**Setup:**
```bash
# Install dependencies
sudo apt install python3 python3-venv ffmpeg nginx

# Clone repo and setup
# Configure Gunicorn
# Configure Nginx
# Setup SSL
# Configure MongoDB
```

### Option 2: Docker Containers

**Benefits:**
- Consistent environment
- Easy deployment
- Scalability
- Isolation

**Structure:**
```
docker-compose.yml
  - backend (Python + FFmpeg)
  - frontend (Nginx + static files)
  - mongodb
```

### Option 3: Cloud Platform

**AWS:**
- EC2 for backend
- S3 + CloudFront for frontend
- MongoDB Atlas for database
- ELB for load balancing

**Azure:**
- App Service for backend
- Static Web Apps for frontend
- Cosmos DB or MongoDB Atlas
- Application Gateway

**Google Cloud:**
- Compute Engine or Cloud Run
- Cloud Storage + CDN
- MongoDB Atlas
- Cloud Load Balancing

### Option 4: Serverless

**Challenges:**
- FFmpeg process management
- Long-running connections
- Stateful video streaming

**Not Recommended:** Traditional server better for this use case

## Monitoring and Logging

### Current Logging

**Backend:**
```python
import logging
logger = logging.getLogger(__name__)
logger.info("message")
logger.error("error")
```

### Production Logging

**Structured Logging:**
```python
import structlog

logger.info("stream_started", 
    rtsp_url=rtsp_url,
    pid=ffmpeg_process.pid,
    timestamp=datetime.now()
)
```

**Log Aggregation:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- DataDog
- CloudWatch (AWS)

**Metrics to Track:**
- Request count and latency
- Error rates
- FFmpeg process status
- MongoDB query times
- Active stream count
- Overlay CRUD operations
- Memory and CPU usage

## Known Issues and Limitations

### 1. Single Stream Limitation

**Issue:** Only one RTSP stream at a time

**Reason:** Global process variable

**Solution for Multi-Stream:**
```python
# Dictionary of streams
active_streams = {
    'stream_id': {
        'process': subprocess.Popen(...),
        'rtsp_url': '...',
        'overlays': [...]
    }
}
```

### 2. HLS Latency

**Issue:** 6-10 second delay

**Reason:** HLS protocol design (segmentation)

**Alternatives:**
- WebRTC (< 1 second latency)
- LL-HLS (Low-Latency HLS, ~2-3 seconds)
- DASH (similar to HLS)

### 3. No Authentication

**Issue:** Anyone can access and modify

**Solution:** Add JWT authentication
```python
from flask_jwt_extended import JWTManager, jwt_required

@app.route('/api/overlays', methods=['POST'])
@jwt_required()
def create_overlay():
    # Only authenticated users can create
```

### 4. RTSP URL Must Be Public

**Issue:** Cannot access password-protected streams

**Solution:** Add credential support
```python
# RTSP URL with credentials
rtsp://username:password@host/stream

# FFmpeg handles authentication automatically
```

### 5. No Video Recording

**Issue:** Overlays not saved with video

**Reason:** CSS overlays, not embedded

**Solution if Recording Needed:**
- Use FFmpeg overlay filters
- Composite overlays into video stream
- Trade-off: Lose real-time positioning

## Useful Commands

### Development

```bash
# Backend
cd backend
source venv/bin/activate
python app.py

# Frontend
cd frontend
npm run dev

# MongoDB
mongod
mongosh  # Connect to database

# Check processes
ps aux | grep ffmpeg
ps aux | grep python
ps aux | grep mongod
```

### Debugging

```bash
# Test RTSP stream with FFmpeg
ffmpeg -rtsp_transport tcp -i rtsp://rtsp.stream/pattern -t 10 test.mp4

# Test MongoDB connection
mongosh mongodb://localhost:27017/

# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/overlays

# Check port usage
lsof -i :5000  # Backend
lsof -i :5173  # Frontend
lsof -i :27017 # MongoDB
```

### Production

```bash
# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Build frontend
cd frontend
npm run build
# Serve dist/ with Nginx

# MongoDB production
mongod --auth --port 27017 --dbpath /data/db
```

## Additional Resources

### FFmpeg Documentation
- Official: https://ffmpeg.org/documentation.html
- HLS Guide: https://trac.ffmpeg.org/wiki/StreamingGuide

### Video.js
- Documentation: https://videojs.com/guides/
- Plugins: https://videojs.com/plugins/

### React
- Documentation: https://react.dev/
- Hooks: https://react.dev/reference/react

### MongoDB
- Documentation: https://docs.mongodb.com/
- PyMongo: https://pymongo.readthedocs.io/

### Flask
- Documentation: https://flask.palletsprojects.com/
- Best Practices: https://flask.palletsprojects.com/en/2.3.x/patterns/

---

**Last Updated:** January 2026  
**Maintained By:** Project Developer
