#!/usr/bin/env python3
"""
Simple test video server for RTSP Overlay Application.
Serves a video file via HTTP for testing when RTSP is blocked.
"""

from flask import Flask, send_file, Response
import os
import sys

app = Flask(__name__)

# Video file path
VIDEO_PATH = os.path.expanduser("~/Downloads/bunny.mp4")

@app.route('/video')
def serve_video():
    """Serve video file"""
    if not os.path.exists(VIDEO_PATH):
        return "Video file not found. Please place bunny.mp4 in ~/Downloads/", 404
    
    return send_file(VIDEO_PATH, mimetype='video/mp4')

@app.route('/')
def index():
    """Info page"""
    return f"""
    <html>
    <body>
        <h1>Test Video Server</h1>
        <p>Video URL: <a href="http://localhost:9000/video">http://localhost:9000/video</a></p>
        <p>Video file: {VIDEO_PATH}</p>
        <p>Exists: {os.path.exists(VIDEO_PATH)}</p>
        <hr>
        <video width="640" height="360" controls>
            <source src="/video" type="video/mp4">
        </video>
    </body>
    </html>
    """

if __name__ == '__main__':
    if not os.path.exists(VIDEO_PATH):
        print(f"ERROR: Video file not found at {VIDEO_PATH}")
        print(f"Please download a test video:")
        print(f'curl -L -o ~/Downloads/bunny.mp4 "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"')
        sys.exit(1)
    
    print(f"Serving video from: {VIDEO_PATH}")
    print(f"Video URL: http://localhost:9000/video")
    app.run(host='0.0.0.0', port=9000, debug=False)
