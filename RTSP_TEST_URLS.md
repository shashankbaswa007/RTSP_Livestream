# RTSP Test Stream URLs

## ✅ Known Working Public RTSP Streams

### 1. Wowza Test Stream (Alternative Format)
```
rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov
```
**Note**: This is the one you tried - it may have connectivity issues

### 2. MediaMTX Test Stream
```
rtsp://rtsp.stream/pattern
```
**Status**: Usually reliable for testing

### 3. Big Buck Bunny (Alternative)
```
rtsp://wowzaec2demo.streamlock.net:1935/vod/mp4:BigBuckBunny_115k.mp4
```
**Note**: Try with explicit port 1935

### 4. For Local Testing - VLC Streaming

If external RTSP streams don't work, you can create a local test stream:

#### Using VLC:
1. Open VLC Media Player
2. Media → Stream
3. Add a local video file
4. Click "Stream"
5. Click "Next"
6. New destination: "RTSP"
7. Click "Add"
8. Port: 8554
9. Path: /test
10. Click "Next" → "Stream"

Your local RTSP URL will be:
```
rtsp://localhost:8554/test
```

## 🔧 Testing RTSP Connectivity

### Test from command line:
```bash
# Test if RTSP stream is accessible
ffmpeg -rtsp_transport tcp -i "rtsp://rtsp.stream/pattern" -frames:v 1 test.jpg

# Or use ffprobe
ffprobe -rtsp_transport tcp "rtsp://rtsp.stream/pattern"
```

### Test with VLC:
1. Open VLC
2. Media → Open Network Stream
3. Enter RTSP URL
4. Click Play

If it works in VLC, it should work in the application.

## 🐛 Common RTSP Issues

### 1. Network/Firewall
- Corporate networks often block RTSP (port 554)
- Try using a VPN or mobile hotspot

### 2. Stream Format
- Some RTSP streams use unusual codecs
- H.264 video + AAC audio works best

### 3. Authentication
- Some RTSP streams require username/password
- Format: `rtsp://username:password@server.com/stream`

## 📝 Recommended Test Streams

For this application, try these in order:

1. **First**: `rtsp://rtsp.stream/pattern`
2. **Second**: Local VLC stream (if you have a video file)
3. **Third**: `rtsp://wowzaec2demo.streamlock.net:1935/vod/mp4:BigBuckBunny_115k.mp4`

---

**Note**: Public RTSP streams can be unreliable. For production, use your own RTSP camera or streaming server.
