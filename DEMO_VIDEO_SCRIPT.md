# Demo Video Script for RTSP Livestream Overlay Application

**Total Duration:** 3-5 minutes  
**Format:** Screen recording with voice-over narration  
**Target Audience:** Technical internship evaluators

---

## 🎬 Section 1: Introduction (30 seconds)

### Visual:
- Show landing page of application
- Display project title in browser tab

### Script:
> "Hello! Today I'm presenting the RTSP Livestream Overlay Application, a full-stack web solution that enables real-time RTSP video streaming in web browsers with customizable, drag-and-drop overlays. This project demonstrates modern web development practices, video streaming technologies, and database integration."

### Key Points to Emphasize:
- Full-stack development
- Real-time streaming capability
- Interactive overlay system

---

## 🏗️ Section 2: Architecture Overview (30 seconds)

### Visual:
- Display architecture diagram (can create simple diagram or describe flow)
- Show project folder structure briefly

### Script:
> "The architecture consists of three main components. First, a Flask backend uses FFmpeg to convert RTSP streams to HLS format, which browsers can natively play. Second, MongoDB stores all overlay configurations for persistence across sessions. Third, the React frontend uses Video.js for HLS playback and renders overlays as CSS layers positioned absolutely over the video element. This approach allows real-time overlay manipulation without video re-encoding."

### Key Points to Emphasize:
- Why RTSP needs conversion (browser limitations)
- FFmpeg for real-time conversion
- CSS overlay positioning (not embedded in stream)
- MongoDB for persistence

---

## 🖥️ Section 3: Starting the Application (30 seconds)

### Visual:
- Show three terminal windows side by side
- Execute commands in each terminal

### Script:
> "The application requires three components to run. In the first terminal, I'm starting MongoDB, which provides our database layer. In the second terminal, I'm activating the Python virtual environment and starting the Flask backend server on port 5000. You can see successful MongoDB connection and server initialization. In the third terminal, I'm starting the React development server using npm run dev, which launches on port 5173. Now I'll open the browser to localhost:5173."

### Terminal Commands to Show:

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
*Show output: "Connected to MongoDB", "Running on http://0.0.0.0:5000"*

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
*Show output: "Local: http://localhost:5173"*

### Key Points to Emphasize:
- Three-tier architecture
- Clear separation of concerns
- Professional development setup

---

## 📺 Section 4: Playing RTSP Stream (45 seconds)

### Visual:
- Focus on browser window
- Show RTSP URL input field
- Enter test URL
- Click Start Stream
- Show video loading and playing

### Script:
> "Let me demonstrate the core streaming functionality. I'll enter a test RTSP URL - in this case, rtsp://rtsp.stream/pattern - which provides a public test stream. After clicking Start Stream, the backend initiates FFmpeg to convert the RTSP stream to HLS format in real-time. There's a brief 5-10 second initialization period while FFmpeg generates the first HLS segments. And now we can see the video is playing successfully in the browser with full Video.js controls including play, pause, volume, and fullscreen."

### RTSP URL to Use:
```
rtsp://rtsp.stream/pattern
```

### Key Points to Emphasize:
- RTSP to HLS conversion happening in real-time
- Brief initialization delay is expected
- Professional video player controls
- Smooth playback

---

## ✍️ Section 5: Creating Text Overlay (60 seconds)

### Visual:
- Focus on right sidebar
- Select Text type
- Enter "LIVE" in content field
- Click Add Overlay
- Show overlay appearing on video
- Drag overlay to top-right corner
- Resize overlay using corner handles

### Script:
> "Now I'll demonstrate the overlay system. In the Add Overlay section on the right, I select Text as the overlay type and enter 'LIVE' as the content. After clicking Add Overlay, you can see the overlay appears at the default position on the video. The overlay is fully interactive - I can click and drag it anywhere on the video. Notice how smoothly it moves - this is because it's a CSS layer over the video, not embedded in the stream. I'll position it in the top-right corner. Now I can resize it by dragging any of the eight resize handles on the corners and edges. The overlay automatically saves its position and size to the MongoDB database in real-time."

### Demonstration Steps:
1. Click "Text" radio button
2. Type "LIVE" in textarea
3. Click "Add Overlay" button
4. Drag overlay to top-right corner
5. Resize using bottom-right corner handle
6. Show overlay maintains position

### Key Points to Emphasize:
- Easy creation process
- Smooth drag interaction
- Multi-handle resizing
- Real-time database updates
- No video re-encoding needed

---

## 🖼️ Section 6: Creating Image Overlay (60 seconds)

### Visual:
- Focus on overlay controls again
- Select Image type
- Enter image URL
- Click Add Overlay
- Show image overlay appearing
- Drag to bottom-left corner
- Resize image overlay
- Show both overlays working simultaneously

### Script:
> "The system also supports image overlays. I'll select the Image type and enter a publicly accessible image URL - let's use a logo or icon. After clicking Add Overlay, the image appears as an overlay on the video. Just like text overlays, I can drag it anywhere - I'll place it in the bottom-left corner - and resize it to an appropriate size. Notice that both the text and image overlays are working simultaneously without any performance issues. Each overlay is independently positioned and can be manipulated at any time."

### Image URL to Use:
```
https://via.placeholder.com/150/0000FF/FFFFFF?text=LOGO
```
*Or use any public image URL*

### Demonstration Steps:
1. Click "Image" radio button
2. Paste image URL
3. Click "Add Overlay" button
4. Drag to bottom-left corner
5. Resize appropriately
6. Show multiple overlays working

### Key Points to Emphasize:
- Support for multiple overlay types
- Multiple overlays simultaneously
- Independent manipulation
- No performance degradation

---

## 📋 Section 7: Managing Overlays (30 seconds)

### Visual:
- Scroll in overlay list sidebar
- Show overlay cards with metadata
- Hover over overlay on video to show delete button
- Delete one overlay using X button
- Confirm deletion in list
- Show remaining overlays still functional

### Script:
> "All overlays are listed in the sidebar with their complete metadata including type, content preview, position, and size. Each overlay has a delete button for easy removal. When I hover over an overlay on the video, you can see the delete button appears in the top-right corner. I'll delete one overlay by clicking the X button. The overlay is immediately removed from both the video and the database, while the remaining overlays continue to function normally."

### Demonstration Steps:
1. Show overlay list with 2-3 overlays
2. Hover over overlay on video
3. Click X button to delete
4. Confirm overlay removed from list
5. Show other overlays still work

### Key Points to Emphasize:
- Complete overlay management
- Easy deletion
- Immediate updates
- Sidebar list synchronization

---

## 💾 Section 8: Persistence Demonstration (15 seconds)

### Visual:
- Press F5 to refresh browser
- Show page reloading
- Show overlays reappearing in exact same positions
- Check overlay list still shows all overlays

### Script:
> "Let me demonstrate data persistence. I'll refresh the browser page by pressing F5. As the page reloads, you'll notice that all overlays reappear in their exact positions and sizes. This proves that all overlay configurations are successfully persisted in the MongoDB database and survive browser refreshes and user sessions."

### Demonstration Steps:
1. Note current overlay positions
2. Press F5 to refresh
3. Wait for page reload
4. Show overlays in same positions
5. Check overlay list populated

### Key Points to Emphasize:
- Database persistence
- Session independence
- Professional data management
- Reliable storage

---

## 🎯 Section 9: Conclusion (30 seconds)

### Visual:
- Show full application with video playing and overlays
- Briefly show terminal windows running
- End on landing page

### Script:
> "This demonstration showcases a complete full-stack application built with modern technologies. The backend uses Python Flask for the REST API, FFmpeg for video stream conversion, and MongoDB for data persistence. The frontend leverages React for the user interface, Video.js for HLS playback, and react-rnd for the interactive drag-and-drop overlay system. The application demonstrates proper separation of concerns, RESTful API design, real-time data synchronization, and professional error handling. Key features include RTSP to HLS conversion, browser-compatible video streaming, interactive overlay management, persistent data storage, and a responsive, user-friendly interface. Thank you for watching this demonstration."

### Key Points to Emphasize:
- Full-stack development skills
- Modern technology stack
- Professional architecture
- CRUD operations
- Real-time updates
- Database integration
- Responsive UI/UX

---

## 📝 Recording Tips

### Technical Setup:
1. **Screen Recording Software:**
   - macOS: QuickTime Player or built-in screen recording (Cmd+Shift+5)
   - Windows: Xbox Game Bar (Win+G) or OBS Studio
   - Linux: OBS Studio or SimpleScreenRecorder

2. **Recording Settings:**
   - Resolution: 1920x1080 (Full HD)
   - Frame Rate: 30 fps minimum
   - Audio: Enable microphone for voice-over

3. **Browser Setup:**
   - Close unnecessary tabs
   - Disable notifications
   - Use incognito/private mode for clean browser
   - Zoom level: 100%

4. **Preparation:**
   - Test RTSP URLs before recording
   - Have image URL ready to paste
   - Practice script 2-3 times
   - Prepare all terminals in advance

### Voice-Over Tips:
1. **Audio Quality:**
   - Use external microphone if available
   - Record in quiet environment
   - Speak clearly and at moderate pace
   - Maintain consistent volume

2. **Narration Style:**
   - Professional and confident tone
   - Technical but accessible language
   - Emphasize key features
   - Avoid filler words ("um", "uh", "like")

3. **Pacing:**
   - Don't rush through demonstrations
   - Pause briefly between sections
   - Allow time for viewers to see actions
   - Match narration to on-screen activity

### Editing Recommendations:
1. **Video Editing:**
   - Trim dead air and mistakes
   - Add smooth transitions between sections
   - Highlight cursor when important
   - Zoom in on specific UI elements if needed

2. **Enhancements:**
   - Add title card at beginning
   - Include section labels
   - Highlight clicked buttons
   - Add timestamps in description

3. **Export Settings:**
   - Format: MP4 (H.264)
   - Resolution: 1920x1080
   - Bitrate: 5-10 Mbps
   - File size: Keep under 500 MB if possible

### Common Mistakes to Avoid:
- ❌ Speaking too fast
- ❌ Not showing important terminal output
- ❌ Skipping explanation of why things work
- ❌ Forgetting to wait for video to load
- ❌ Mouse cursor moving erratically
- ❌ Not demonstrating persistence
- ❌ Rushing through overlay creation
- ❌ Poor audio quality

### Checklist Before Recording:
- [ ] All three servers running and tested
- [ ] Test RTSP URL works
- [ ] Image URL is accessible
- [ ] MongoDB connected successfully
- [ ] Browser zoom at 100%
- [ ] Notifications disabled
- [ ] Script practiced
- [ ] Microphone tested
- [ ] Screen recording tested
- [ ] Terminal windows arranged
- [ ] Browser window sized appropriately

---

## 🎥 Alternative: Separate Audio Recording

If preferred, you can:
1. Record screen activity without audio
2. Write detailed script
3. Record voice-over separately
4. Combine in video editor

This approach allows:
- Multiple takes for audio
- Better audio quality
- Easier editing
- More polished result

---

## 📤 Submission Format

**Video File:**
- Filename: `RTSP_Overlay_Demo_[YourName].mp4`
- Duration: 3-5 minutes
- Resolution: 1920x1080
- Format: MP4

**Accompanying Document:**
- Include this script
- Add timestamps for each section
- Note any deviations from script
- List technical specifications used

---

**Good luck with your demo! This script ensures comprehensive coverage of all features while maintaining professional presentation quality.**
