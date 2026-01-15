/**
 * Main App component for RTSP Livestream Overlay Application.
 * Manages global state and orchestrates child components.
 */
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import VideoPlayer from './components/VideoPlayer';
import OverlayControls from './components/OverlayControls';
import OverlayList from './components/OverlayList';
import { overlayAPI } from './services/api';
import './App.css';

function App() {
  const [overlays, setOverlays] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch overlays from API on component mount
   */
  useEffect(() => {
    fetchOverlays();
  }, []);

  /**
   * Fetch all overlays from backend
   */
  const fetchOverlays = async () => {
    try {
      const response = await overlayAPI.getAll();
      if (response.success) {
        setOverlays(response.overlays);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch overlays');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new overlay
   * @param {Object} overlayData - Overlay data to create
   */
  const handleCreateOverlay = async (overlayData) => {
    try {
      const response = await overlayAPI.create(overlayData);
      if (response.success) {
        setOverlays([...overlays, response.overlay]);
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * Update existing overlay
   * @param {string} id - Overlay ID
   * @param {Object} updates - Updated overlay data
   */
  const handleUpdateOverlay = async (id, updates) => {
    try {
      const response = await overlayAPI.update(id, updates);
      if (response.success) {
        setOverlays(
          overlays.map((overlay) =>
            overlay.id === id ? response.overlay : overlay
          )
        );
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update overlay');
    }
  };

  /**
   * Delete overlay
   * @param {string} id - Overlay ID
   */
  const handleDeleteOverlay = async (id) => {
    try {
      const response = await overlayAPI.delete(id);
      if (response.success) {
        setOverlays(overlays.filter((overlay) => overlay.id !== id));
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            color: '#fff',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-2xl backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                RTSP Livestream Overlay
              </h1>
              <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Stream RTSP video with customizable overlays
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
              <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">React</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">Flask</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full border border-gray-700">MongoDB</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="text-white text-lg mt-6 animate-pulse">Loading application...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video player section - 2/3 width on large screens */}
            <div className="lg:col-span-2 space-y-4">
              <VideoPlayer
                overlays={overlays}
                onUpdateOverlay={handleUpdateOverlay}
                onDeleteOverlay={handleDeleteOverlay}
              />
            </div>

            {/* Controls sidebar - 1/3 width on large screens */}
            <div className="space-y-6">
              <OverlayControls onCreateOverlay={handleCreateOverlay} />
              <OverlayList
                overlays={overlays}
                onDelete={handleDeleteOverlay}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer with gradient */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 mt-12 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-gray-400 text-sm text-center">
            Built with ❤️ using React, Flask, Video.js, and MongoDB
          </p>
          <p className="text-gray-600 text-xs text-center mt-2">
            © 2026 RTSP Livestream Overlay Application
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
