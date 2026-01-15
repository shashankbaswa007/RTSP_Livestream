# RTSP Overlay Frontend

React-based frontend for RTSP livestream playback with interactive overlays.

## Features

- HLS video playback using Video.js
- Drag-and-drop overlay positioning with react-rnd
- Real-time overlay resizing
- Text and image overlay support
- Toast notifications for user feedback
- Responsive design with Tailwind CSS
- Dark theme interface

## Tech Stack

- **React 18.2.0**: UI framework with hooks
- **Video.js 8.10.0**: HLS video player
- **react-rnd 10.4.1**: Drag and resize
- **Axios 1.6.5**: HTTP client
- **react-hot-toast 2.4.1**: Notifications
- **lucide-react 0.263.1**: Icons
- **Tailwind CSS 3.4.0**: Styling
- **Vite 5.0.0**: Build tool

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API URL (Optional)

If backend runs on different host/port, edit `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://your-backend:5000/api';
```

### 3. Start Development Server

```bash
npm run dev
```

Application runs on http://localhost:5173

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── VideoPlayer.jsx      # Video.js player
│   │   ├── Overlay.jsx          # Draggable overlay
│   │   ├── OverlayControls.jsx  # Creation form
│   │   └── OverlayList.jsx      # Overlay list
│   ├── services/
│   │   └── api.js               # API client
│   ├── App.jsx                  # Main component
│   ├── App.css                  # Global styles
│   ├── main.jsx                 # Entry point
│   └── index.css                # Tailwind imports
├── public/
│   └── vite.svg                 # Favicon
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── vite.config.js               # Vite config
├── tailwind.config.js           # Tailwind config
└── postcss.config.js            # PostCSS config
```

## Component Architecture

### App.jsx
Main application component managing:
- Global state (overlays, loading)
- API integration
- Child component orchestration
- Toast notifications

### VideoPlayer.jsx
Video player component handling:
- RTSP URL input
- Stream start/stop
- Video.js initialization
- Overlay rendering container
- Player lifecycle management

### Overlay.jsx
Individual overlay component with:
- Drag and drop (react-rnd)
- Resize from 8 handles
- Delete button on hover
- Text/image rendering
- Position/size updates to API

### OverlayControls.jsx
Overlay creation form featuring:
- Type selection (text/image)
- Content input
- Preview area
- Form validation
- Submit handling

### OverlayList.jsx
Overlay management list showing:
- All overlays with metadata
- Type badges
- Content preview
- Delete functionality
- Empty state message

## API Service Layer

`src/services/api.js` provides:

```javascript
// Stream operations
streamAPI.start(rtspUrl)
streamAPI.stop()
streamAPI.status()

// Overlay operations
overlayAPI.getAll()
overlayAPI.getById(id)
overlayAPI.create(data)
overlayAPI.update(id, data)
overlayAPI.delete(id)
```

All API calls include:
- Error handling
- Response interceptors
- Consistent error messages

## Styling Approach

### Tailwind Utility Classes

All styling uses Tailwind CSS utilities:

```jsx
<div className="bg-gray-800 rounded-lg p-4">
  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
    Click Me
  </button>
</div>
```

### Dark Theme Colors

- Background: `bg-gray-900`
- Cards: `bg-gray-800`
- Inputs: `bg-gray-700`
- Text: `text-white`, `text-gray-300`
- Accents: `bg-blue-600`, `bg-red-600`

### Responsive Design

Grid layout adapts to screen size:

```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Video player - 2/3 width on large screens */}
  </div>
  <div>
    {/* Sidebar - 1/3 width on large screens */}
  </div>
</div>
```

## Video.js Integration

### Player Initialization

```javascript
const player = videojs(videoRef.current, {
  controls: true,
  autoplay: true,
  preload: 'auto',
  fluid: true,
  responsive: true,
  html5: {
    vhs: {
      overrideNative: true,
    },
    nativeAudioTracks: false,
    nativeVideoTracks: false,
  },
});

player.src({
  src: hlsUrl,
  type: 'application/x-mpegURL',
});
```

### Cleanup

Always dispose player on unmount:

```javascript
useEffect(() => {
  return () => {
    if (playerRef.current) {
      playerRef.current.dispose();
    }
  };
}, []);
```

## Overlay Positioning

Overlays use CSS absolute positioning:

```jsx
<div className="relative">  {/* Video container */}
  <video />
  <Rnd
    bounds="parent"  {/* Keep within video */}
    onDragStop={handleDrag}
    onResizeStop={handleResize}
  >
    {/* Overlay content */}
  </Rnd>
</div>
```

Benefits:
- No video re-encoding
- Real-time positioning
- Independent of video stream
- Full CSS control

## Error Handling

### Toast Notifications

```javascript
import toast from 'react-hot-toast';

// Success
toast.success('Overlay created!');

// Error
toast.error('Failed to create overlay');

// Loading
const loading = toast.loading('Processing...');
toast.dismiss(loading);
```

### API Error Handling

```javascript
try {
  await overlayAPI.create(data);
  toast.success('Success!');
} catch (error) {
  toast.error(error.message || 'An error occurred');
}
```

## Browser Compatibility

Tested and supported:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- HTML5 video support
- ES6+ JavaScript features
- CSS Grid and Flexbox

## Development Tips

### Hot Module Replacement

Vite provides instant HMR:
- Edit components → see changes immediately
- State preserved during updates
- No full page reload

### Browser DevTools

Use React DevTools extension:
- Inspect component tree
- View props and state
- Profile performance

### Network Debugging

Monitor API calls:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR
4. Inspect request/response

## Building for Production

```bash
# Create optimized build
npm run build

# Output in dist/ directory
# Minified and optimized
# Ready for deployment
```

Deploy `dist/` folder to:
- Static hosting (Netlify, Vercel, GitHub Pages)
- CDN (Cloudflare, AWS S3)
- Web server (Nginx, Apache)

## Environment Variables

Create `.env` file for custom configuration:

```env
VITE_API_URL=http://api.example.com
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Note:** Vite requires `VITE_` prefix for environment variables.

## Troubleshooting

**Video not playing:**
- Check browser console for errors
- Verify HLS URL is accessible
- Wait 5-10 seconds for buffering

**Overlays not updating:**
- Check Network tab for failed API calls
- Verify backend is running on port 5000
- Check CORS configuration

**Styling issues:**
- Run `npm install` to ensure Tailwind is installed
- Check `tailwind.config.js` content paths
- Verify `index.css` includes Tailwind directives

**Build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Update dependencies: `npm update`

## Performance Optimization

### Code Splitting

Vite automatically code-splits:
- Each route in separate chunk
- Lazy load components if needed
- Smaller initial bundle

### Image Optimization

For image overlays:
- Use CDN URLs
- Compress images before uploading
- Use appropriate formats (WebP, AVIF)

### Overlay Limits

Recommend maximum 10 overlays:
- More overlays = more DOM nodes
- Can impact rendering performance
- Monitor browser performance tab

## Accessibility

Current features:
- Semantic HTML elements
- Button labels
- Form labels
- Keyboard navigation

Future improvements:
- ARIA labels
- Screen reader support
- Keyboard shortcuts
- Focus management

## License

Educational project for technical internship assignment.
