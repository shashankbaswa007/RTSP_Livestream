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
  const [rtspUrl, setRtspUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
          Video Stream
        </h2>
        <p className="text-gray-400 text-sm">
          {isPlaying ? '🔴 Live streaming' : 'Ready to stream'}
        </p>
      </div>

      {/* Stream control section */}
      {!isPlaying && (
        <div className="mb-6 space-y-3">
          <input
            type="text"
            value={rtspUrl}
            onChange={(e) => setRtspUrl(e.target.value)}
            placeholder="Enter RTSP URL (e.g., rtsp://rtsp.stream/pattern)"
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={startStream}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 transform hover:scale-[1.02]"
          >
            <Play size={20} className={isLoading ? 'animate-pulse' : ''} />
            {isLoading ? 'Starting Stream...' : 'Start Stream'}
          </button>
        </div>
      )}

      {/* Video player container with overlays */}
      <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700" style={{ minHeight: '400px' }}>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered w-full"
        />

        {/* Render overlays on top of video */}
        {isPlaying && overlays.map((overlay) => (
          <Overlay
            key={overlay.id}
            overlay={overlay}
            onUpdate={onUpdateOverlay}
            onDelete={onDeleteOverlay}
          />
        ))}

        {/* Empty state */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-center px-6">
              <div className="relative inline-block mb-6">
                <Play className="w-20 h-20 text-blue-400 animate-pulse" />
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 animate-pulse"></div>
              </div>
              <p className="text-white text-xl font-semibold mb-3">No stream active</p>
              <p className="text-gray-400 text-sm max-w-md">
                Enter an RTSP URL above and click <span className="text-blue-400 font-medium">Start Stream</span> to begin
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="text-white text-lg font-medium mb-2">Initializing stream...</p>
              <p className="text-gray-400 text-sm">Please wait while we connect to the RTSP source</p>
            </div>
          </div>
        )}
      </div>

      {/* Stop stream button */}
      {isPlaying && (
        <button
          onClick={stopStream}
          disabled={isLoading}
          className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/30 transform hover:scale-[1.02]"
        >
          <Square size={20} />
          {isLoading ? 'Stopping Stream...' : 'Stop Stream'}
        </button>
      )}
    </div>
  );
}
