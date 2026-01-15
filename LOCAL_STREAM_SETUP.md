# Local Video Testing Guide

## 🎬 Create Local Test Stream (Without RTSP)

Since RTSP streams are blocked on your network, here are alternatives:

### Method 1: Use MediaMTX for Local RTSP Server

1. **Install MediaMTX** (lightweight RTSP server):
```bash
# macOS
brew install mediamtx

# Or download from: https://github.com/bluenviron/mediamtx/releases
```

2. **Start MediaMTX**:
```bash
mediamtx
```

3. **Stream a video file to it**:
```bash
ffmpeg -re -stream_loop -1 -i /path/to/your/video.mp4 -c copy -f rtsp rtsp://localhost:8554/mystream
```

4. **Use this RTSP URL in the app**:
```
rtsp://localhost:8554/mystream
```

### Method 2: Use VLC to Create RTSP Stream

1. **Open VLC Media Player**
2. **Media** → **Stream** → **Add** your video file
3. **Click Stream button**
4. **New destination**: Select **RTP / MPEG Transport Stream**
5. **Add** destination
6. **Settings**:
   - Address: `127.0.0.1`
   - Port: `5004`
   - Stream name: `test`
7. **Next** → **Stream**

8. **Use in app**:
```
rtp://127.0.0.1:5004
```

### Method 3: Download Sample Video and Use HTTP

1. **Download a test video**:
```bash
cd /Users/shashi/RTSP_Overlay/backend/static
wget https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4 -O test.mp4
```

2. **Access via HTTP**:
```
http://localhost:5001/static/test.mp4
```

## 🚀 Quick Test with Python HTTP Server

```bash
# Download a sample video
cd ~/Downloads
curl -L -o sample.mp4 "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

# Check your IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Start simple HTTP server
python3 -m http.server 8000

# Use this URL (replace YOUR_IP):
http://YOUR_IP:8000/sample.mp4
```

## 📝 Recommended: Use MediaMTX

This is the easiest way to get a working local RTSP server:

```bash
# Install
brew install mediamtx

# Run (in a new terminal)
mediamtx

# In another terminal, stream any video
ffmpeg -re -stream_loop -1 -i ~/Downloads/sample.mp4 -c copy -f rtsp rtsp://localhost:8554/test

# Use in app:
rtsp://localhost:8554/test
```

---

**Your network is blocking external RTSP streams. Use one of these local methods instead!**
