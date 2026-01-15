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

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                RTSP Livestream Overlay
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Stream video with customizable overlays
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
              <span className="px-3 py-1.5 bg-gray-800 rounded-md border border-gray-700">React</span>
              <span className="px-3 py-1.5 bg-gray-800 rounded-md border border-gray-700">Flask</span>
              <span className="px-3 py-1.5 bg-gray-800 rounded-md border border-gray-700">MongoDB</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-3 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm mt-4">Loading application...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video player section - 2/3 width on large screens */}
            <div className="lg:col-span-2">
              <VideoPlayer
                overlays={overlays}
                onUpdateOverlay={handleUpdateOverlay}
                onDeleteOverlay={handleDeleteOverlay}
              />
            </div>

            {/* Controls sidebar - 1/3 width on large screens */}
            <div className="space-y-5">
              <OverlayControls onCreateOverlay={handleCreateOverlay} />
              <OverlayList
                overlays={overlays}
                onDelete={handleDeleteOverlay}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-gray-500 text-xs text-center">
            Built with React, Flask, Video.js, and MongoDB
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
