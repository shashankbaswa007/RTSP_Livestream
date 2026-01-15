/**
 * API client for backend communication.
 * Handles all HTTP requests to the Flask backend with error handling.
 */
import axios from 'axios';

// API base URL - update if backend runs on different host/port
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Create Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Response interceptor for global error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response;
  },
  (error) => {
    // Extract error message from response or use fallback
    let message = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      message = error.response.data?.error || error.response.data?.message || message;
    } else if (error.request) {
      // Request made but no response received
      message = 'No response from server. Please check if the backend is running.';
    } else {
      // Error in request configuration
      message = error.message || message;
    }
    
    // Throw error with extracted message
    throw new Error(message);
  }
);

/**
 * Stream API endpoints
 */
export const streamAPI = {
  /**
   * Start RTSP to HLS stream conversion
   * @param {string} rtspUrl - RTSP stream URL
   * @returns {Promise} Response with HLS URL
   */
  start: async (rtspUrl) => {
    const response = await apiClient.post('/stream/start', { rtsp_url: rtspUrl });
    return response.data;
  },

  /**
   * Stop current stream
   * @returns {Promise} Response with success status
   */
  stop: async () => {
    const response = await apiClient.post('/stream/stop');
    return response.data;
  },

  /**
   * Get current stream status
   * @returns {Promise} Response with active status and RTSP URL
   */
  status: async () => {
    const response = await apiClient.get('/stream/status');
    return response.data;
  },
};

/**
 * Overlay API endpoints
 */
export const overlayAPI = {
  /**
   * Get all overlays
   * @returns {Promise} Response with array of overlays
   */
  getAll: async () => {
    const response = await apiClient.get('/overlays');
    return response.data;
  },

  /**
   * Get single overlay by ID
   * @param {string} id - Overlay ID
   * @returns {Promise} Response with overlay data
   */
  getById: async (id) => {
    const response = await apiClient.get(`/overlays/${id}`);
    return response.data;
  },

  /**
   * Create new overlay
   * @param {Object} data - Overlay data
   * @param {string} data.type - 'text' or 'image'
   * @param {string} data.content - Text content or image URL
   * @param {Object} data.position - {x: number, y: number}
   * @param {Object} data.size - {width: number, height: number}
   * @returns {Promise} Response with created overlay
   */
  create: async (data) => {
    const response = await apiClient.post('/overlays', data);
    return response.data;
  },

  /**
   * Update existing overlay
   * @param {string} id - Overlay ID
   * @param {Object} data - Updated overlay data
   * @returns {Promise} Response with updated overlay
   */
  update: async (id, data) => {
    const response = await apiClient.put(`/overlays/${id}`, data);
    return response.data;
  },

  /**
   * Delete overlay
   * @param {string} id - Overlay ID
   * @returns {Promise} Response with success status
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/overlays/${id}`);
    return response.data;
  },
};

export default apiClient;
