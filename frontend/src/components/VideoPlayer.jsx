/**
 * VideoPlayer component using Video.js for HLS playback.
 * Manages stream playback and overlay container.
 */
import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import toast from 'react-hot-toast';
import { streamAPI } from '../services/api';
import Overlay from './Overlay';
import { Play, Square } from 'lucide-react';

export default function VideoPlayer({ overlays, onUpdateOverlay, onDeleteOverlay }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [rtspUrl, setRtspUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOverlayId, setSelectedOverlayId] = useState(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * Initialize Video.js player
   * @param {string} hlsUrl - HLS stream URL
   */
  const initializePlayer = (hlsUrl) => {
    if (!videoRef.current) return;

    // Dispose existing player if any
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // Create new Video.js player
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

    // Set HLS source
    player.src({
      src: hlsUrl,
      type: 'application/x-mpegURL',
    });

    // Handle player errors
    player.on('error', (error) => {
      const playerError = player.error();
      toast.error(`Video player error: ${playerError?.message || 'Unknown error'}`);
    });

    playerRef.current = player;
  };

  /**
   * Start RTSP stream
   */
  const startStream = async () => {
    if (!rtspUrl.trim()) {
      toast.error('Please enter a stream URL');
      return;
    }

    // Accept RTSP, HTTP, and HTTPS URLs
    if (!rtspUrl.startsWith('rtsp://') && !rtspUrl.startsWith('http://') && !rtspUrl.startsWith('https://')) {
      toast.error('Invalid stream URL. Must start with rtsp://, http://, or https://');
      return;
    }

    setIsLoading(true);

    try {
      // If it's an HTTP/HTTPS HLS URL, play directly without backend processing
      if ((rtspUrl.startsWith('http://') || rtspUrl.startsWith('https://')) && 
          (rtspUrl.includes('.m3u8') || rtspUrl.includes('.M3U8'))) {
        toast.success('Playing HLS stream directly...');
        initializePlayer(rtspUrl);
        setIsPlaying(true);
        setIsLoading(false);
        return;
      }

      // For RTSP or non-HLS HTTP URLs, use backend conversion
      const response = await streamAPI.start(rtspUrl);

      if (response.success) {
        toast.success('Stream started successfully! Initializing player...');
        
        // Wait a moment for FFmpeg to start generating segments
        setTimeout(() => {
          initializePlayer(response.hls_url);
          setIsPlaying(true);
          setIsLoading(false);
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to start stream');
      setIsLoading(false);
    }
  };

  /**
   * Stop RTSP stream
   */
  const stopStream = async () => {
    setIsLoading(true);

    try {
      // Dispose Video.js player
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      // Stop stream on backend
      const response = await streamAPI.stop();

      if (response.success) {
        toast.success('Stream stopped successfully');
        setIsPlaying(false);
        setRtspUrl('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to stop stream');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key removes selected overlay
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedOverlayId) {
        e.preventDefault();
        onDeleteOverlay(selectedOverlayId);
        setSelectedOverlayId(null);
        toast.success('Overlay deleted');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOverlayId, onDeleteOverlay]);

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  /**
   * Move overlay container into fullscreen element when entering fullscreen
   */
  useEffect(() => {
    if (!playerRef.current || !isPlaying) return;

    const moveOverlaysToFullscreen = () => {
      const overlayContainer = document.getElementById('overlay-container-wrapper');
      if (!overlayContainer) return;

      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      
      if (fullscreenElement && playerRef.current) {
        // In fullscreen: move overlay container to fullscreen element
        const playerEl = playerRef.current.el();
        if (playerEl && !playerEl.contains(overlayContainer)) {
          playerEl.appendChild(overlayContainer);
        }
      } else {
        // Exiting fullscreen: move overlay container back to original parent
        if (containerRef.current && !containerRef.current.contains(overlayContainer)) {
          containerRef.current.appendChild(overlayContainer);
        }
      }
    };

    const handleFullscreenChange = () => {
      setTimeout(moveOverlaysToFullscreen, 50); // Small delay to ensure DOM is ready
    };

    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    if (playerRef.current) {
      playerRef.current.on('fullscreenchange', handleFullscreenChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (playerRef.current) {
        playerRef.current.off('fullscreenchange', handleFullscreenChange);
      }
    };
  }, [isPlaying]);

  /**
   * Track container dimensions for percentage-based positioning
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      // Check if in fullscreen
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      const inFullscreen = !!fullscreenElement;
      setIsFullscreen(inFullscreen);

      if (inFullscreen && playerRef.current) {
        // In fullscreen: get dimensions from video player element
        const playerEl = playerRef.current.el();
        if (playerEl) {
          const { width, height } = playerEl.getBoundingClientRect();
          setContainerDimensions({ width, height });
          return;
        }
      }

      // Not in fullscreen: use container dimensions
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width, height });
      }
    };

    // Initial measurement
    updateDimensions();

    // Use ResizeObserver to track all size changes (including fullscreen)
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    // Also listen for fullscreen changes
    const handleFullscreenChange = () => {
      setTimeout(updateDimensions, 100); // Small delay for layout to settle
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    // Listen to Video.js fullscreen events
    if (playerRef.current) {
      playerRef.current.on('fullscreenchange', handleFullscreenChange);
    }

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (playerRef.current) {
        playerRef.current.off('fullscreenchange', handleFullscreenChange);
      }
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          Video Stream
        </h2>
        <p className="text-gray-400 text-xs">
          {isPlaying ? 'Streaming' : 'Ready'}
          {isPlaying && <span className="ml-2 text-gray-500">• <kbd className="px-1.5 py-0.5 bg-gray-900 rounded border border-gray-700 text-xs font-mono">Del</kbd> to remove overlay</span>}
        </p>
      </div>

      {/* Stream control section */}
      {!isPlaying && (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            placeholder="Enter stream URL..."
            className="w-full px-3 py-2 bg-gray-900 text-white rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={startStream}
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Play size={16} />
            {isLoading ? 'Starting Stream...' : 'Start Stream'}
          </button>
        </div>
      )}

      {/* Video player container with overlays */}
      <div 
        ref={containerRef}
        className="relative bg-black rounded-md overflow-hidden border border-gray-700" 
        style={{ minHeight: '400px' }}
      >
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered w-full"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Overlay container wrapper - gets moved into fullscreen element */}
        {isPlaying && (
          <div 
            id="overlay-container-wrapper"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 9999, // Very high z-index to ensure visibility above video controls
            }}
          >
            {overlays.map((overlay) => (
              <Overlay
                key={overlay.id}
                overlay={overlay}
                onUpdate={onUpdateOverlay}
                onDelete={onDeleteOverlay}
                onSelect={setSelectedOverlayId}
                containerDimensions={containerDimensions}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center px-6">
              <Play className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No stream active</p>
              <p className="text-gray-600 text-xs mt-1">Enter a URL above to start streaming</p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-400 text-sm">Connecting...</p>
            </div>
          </div>
        )}
      </div>

      {/* Stop stream button */}
      {isPlaying && (
        <button
          onClick={stopStream}
          disabled={isLoading}
          className="w-full mt-3 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <Square size={16} />
          {isLoading ? 'Stopping...' : 'Stop Stream'}
        </button>
      )}
    </div>
  );
}
