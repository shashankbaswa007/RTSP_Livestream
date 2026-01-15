"""
Flask backend for RTSP Livestream Overlay Application.
Handles RTSP to HLS conversion using FFmpeg and overlay CRUD operations.
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import logging
import signal
import sys
import os
import atexit
import threading
from config import Config
from models import (
    init_db_connection,
    create_overlay,
    get_all_overlays,
    get_overlay_by_id,
    update_overlay,
    delete_overlay
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask application
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Global FFmpeg process management
ffmpeg_process = None
current_rtsp_url = None


def cleanup_ffmpeg():
    """
    Cleanup FFmpeg process on application shutdown.
    Ensures no zombie processes are left running.
    """
    global ffmpeg_process
    
    if ffmpeg_process:
        logger.info("Cleaning up FFmpeg process...")
        try:
            ffmpeg_process.terminate()
            ffmpeg_process.wait(timeout=5)
            logger.info("FFmpeg process terminated successfully")
        except subprocess.TimeoutExpired:
            logger.warning("FFmpeg process did not terminate, forcing kill")
            ffmpeg_process.kill()
        except Exception as e:
            logger.error(f"Error cleaning up FFmpeg: {str(e)}")
        finally:
            ffmpeg_process = None


def monitor_ffmpeg_output(process):
    """
    Monitor FFmpeg stderr output in a separate thread.
    """
    try:
        for line in process.stderr:
            if line:
                logger.info(f"FFmpeg: {line.strip()}")
    except Exception as e:
        logger.error(f"Error monitoring FFmpeg: {str(e)}")


def signal_handler(signum, frame):
    """
    Handle termination signals gracefully.
    
    Args:
        signum: Signal number
        frame: Current stack frame
    """
    logger.info(f"Received signal {signum}, shutting down...")
    cleanup_ffmpeg()
    sys.exit(0)


# Register cleanup handlers
atexit.register(cleanup_ffmpeg)
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)


@app.route('/api/stream/start', methods=['POST'])
def start_stream():
    """
    Start RTSP to HLS stream conversion using FFmpeg.
    
    Request Body:
        rtsp_url (str): RTSP stream URL to convert
    
    Returns:
        JSON response with success status, HLS URL, and message
    """
    global ffmpeg_process, current_rtsp_url
    
    try:
        data = request.get_json()
        rtsp_url = data.get('rtsp_url')
        
        # Validate URL
        if not rtsp_url:
            return jsonify({
                'success': False,
                'error': 'Stream URL is required'
            }), 400
        
        # Check if URL is HTTP/HTTPS (direct HLS) or RTSP (needs conversion)
        if rtsp_url.startswith('http://') or rtsp_url.startswith('https://'):
            # Direct HLS stream - no conversion needed
            logger.info(f"Direct HLS stream detected: {rtsp_url}")
            return jsonify({
                'success': True,
                'hls_url': rtsp_url,
                'message': 'Direct HLS stream - no conversion needed'
            }), 200
        
        if not rtsp_url.startswith('rtsp://'):
            return jsonify({
                'success': False,
                'error': 'Invalid stream URL format. Must start with rtsp://, http://, or https://'
            }), 400
        
        # Stop existing stream if running
        if ffmpeg_process:
            logger.info("Stopping existing stream before starting new one")
            cleanup_ffmpeg()
        
        # Ensure stream directory exists
        os.makedirs(Config.STREAM_DIR, exist_ok=True)
        
        # Define output paths
        output_playlist = os.path.join(Config.STREAM_DIR, 'playlist.m3u8')
        output_segment = os.path.join(Config.STREAM_DIR, 'segment%03d.ts')
        
        # Build FFmpeg command with optimized settings for live streaming
        # Use full path to ffmpeg for reliability
        ffmpeg_path = '/opt/homebrew/bin/ffmpeg'
        ffmpeg_cmd = [
            ffmpeg_path,
            '-rtsp_transport', 'tcp',  # Use TCP for reliability
            '-i', rtsp_url,  # Input RTSP stream
            '-c:v', 'libx264',  # Video codec
            '-preset', 'ultrafast',  # Prioritize speed over compression
            '-tune', 'zerolatency',  # Minimize latency
            '-c:a', 'aac',  # Audio codec
            '-b:a', '128k',  # Audio bitrate
            '-f', 'hls',  # Output format HLS
            '-hls_time', '2',  # 2-second segments
            '-hls_list_size', '5',  # Keep last 5 segments
            '-hls_flags', 'delete_segments+append_list',  # Auto-delete old segments
            '-hls_segment_filename', output_segment,
            output_playlist
        ]
        
        logger.info(f"Starting FFmpeg with command: {' '.join(ffmpeg_cmd)}")
        
        # Start FFmpeg process
        ffmpeg_process = subprocess.Popen(
            ffmpeg_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Start monitoring thread for FFmpeg output
        monitor_thread = threading.Thread(target=monitor_ffmpeg_output, args=(ffmpeg_process,), daemon=True)
        monitor_thread.start()
        
        current_rtsp_url = rtsp_url
        
        logger.info(f"FFmpeg process started with PID: {ffmpeg_process.pid}")
        logger.info(f"Streaming from: {rtsp_url}")
        logger.info(f"Output playlist: {output_playlist}")
        logger.info(f"Output segments: {output_segment}")
        
        # Generate HLS URL for frontend
        # Use localhost instead of 0.0.0.0 for browser compatibility
        hls_url = f'http://localhost:{Config.PORT}/static/stream/playlist.m3u8'
        
        return jsonify({
            'success': True,
            'hls_url': hls_url,
            'message': 'Stream started successfully'
        }), 200
        
    except FileNotFoundError:
        logger.error("FFmpeg not found on system")
        return jsonify({
            'success': False,
            'error': 'FFmpeg is not installed or not in PATH'
        }), 500
        
    except Exception as e:
        logger.error(f"Error starting stream: {str(e)}")
        cleanup_ffmpeg()
        return jsonify({
            'success': False,
            'error': f'Failed to start stream: {str(e)}'
        }), 500


@app.route('/api/stream/stop', methods=['POST'])
def stop_stream():
    """
    Stop the current RTSP to HLS stream conversion.
    
    Returns:
        JSON response with success status and message
    """
    global current_rtsp_url
    
    try:
        cleanup_ffmpeg()
        current_rtsp_url = None
        
        return jsonify({
            'success': True,
            'message': 'Stream stopped successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error stopping stream: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to stop stream: {str(e)}'
        }), 500


@app.route('/api/stream/status', methods=['GET'])
def get_stream_status():
    """
    Get current stream status.
    
    Returns:
        JSON response with active status and RTSP URL if streaming
    """
    try:
        is_active = ffmpeg_process is not None and ffmpeg_process.poll() is None
        
        return jsonify({
            'success': True,
            'active': is_active,
            'rtsp_url': current_rtsp_url if is_active else None
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting stream status: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to get stream status: {str(e)}'
        }), 500


@app.route('/api/overlays', methods=['GET'])
def get_overlays():
    """
    Retrieve all overlays from database.
    
    Returns:
        JSON response with success status and array of overlays
    """
    try:
        overlays = get_all_overlays()
        
        return jsonify({
            'success': True,
            'overlays': overlays
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving overlays: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve overlays'
        }), 500


@app.route('/api/overlays', methods=['POST'])
def create_new_overlay():
    """
    Create a new overlay in database.
    
    Request Body:
        type (str): 'text' or 'image'
        content (str): Text content or image URL
        position (dict): {x: int, y: int} in pixels (optional, defaults to 100, 100)
        size (dict): {width: int, height: int} in pixels (optional, defaults to 200, 100)
    
    Returns:
        JSON response with success status, generated ID, and overlay data
    """
    try:
        data = request.get_json()
        
        # Create overlay using model function
        overlay = create_overlay(data)
        
        return jsonify({
            'success': True,
            'id': overlay['id'],
            'overlay': overlay
        }), 201
        
    except ValueError as e:
        logger.warning(f"Validation error creating overlay: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        logger.error(f"Error creating overlay: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create overlay'
        }), 500


@app.route('/api/overlays/<overlay_id>', methods=['GET'])
def get_overlay(overlay_id):
    """
    Retrieve a single overlay by ID.
    
    Args:
        overlay_id (str): Overlay ID
    
    Returns:
        JSON response with success status and overlay data
    """
    try:
        overlay = get_overlay_by_id(overlay_id)
        
        return jsonify({
            'success': True,
            'overlay': overlay
        }), 200
        
    except ValueError as e:
        logger.warning(f"Invalid overlay ID: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except LookupError as e:
        logger.warning(f"Overlay not found: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404
        
    except Exception as e:
        logger.error(f"Error retrieving overlay: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve overlay'
        }), 500


@app.route('/api/overlays/<overlay_id>', methods=['PUT'])
def update_existing_overlay(overlay_id):
    """
    Update an existing overlay.
    
    Args:
        overlay_id (str): Overlay ID
    
    Request Body:
        position (dict): {x: int, y: int} (optional)
        size (dict): {width: int, height: int} (optional)
        content (str): Updated content (optional)
    
    Returns:
        JSON response with success status and updated overlay data
    """
    try:
        data = request.get_json()
        
        # Update overlay using model function
        overlay = update_overlay(overlay_id, data)
        
        return jsonify({
            'success': True,
            'overlay': overlay
        }), 200
        
    except ValueError as e:
        logger.warning(f"Invalid overlay ID or data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except LookupError as e:
        logger.warning(f"Overlay not found: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404
        
    except Exception as e:
        logger.error(f"Error updating overlay: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update overlay'
        }), 500


@app.route('/api/overlays/<overlay_id>', methods=['DELETE'])
def delete_existing_overlay(overlay_id):
    """
    Delete an overlay from database.
    
    Args:
        overlay_id (str): Overlay ID
    
    Returns:
        JSON response with success status and deletion message
    """
    try:
        delete_overlay(overlay_id)
        
        return jsonify({
            'success': True,
            'message': 'Overlay deleted successfully'
        }), 200
        
    except ValueError as e:
        logger.warning(f"Invalid overlay ID: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except LookupError as e:
        logger.warning(f"Overlay not found: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404
        
    except Exception as e:
        logger.error(f"Error deleting overlay: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete overlay'
        }), 500


@app.route('/static/stream/<path:filename>')
def serve_stream_file(filename):
    """
    Serve HLS playlist and segment files.
    
    Args:
        filename (str): Filename to serve
    
    Returns:
        Static file with appropriate Content-Type header
    """
    try:
        file_path = os.path.join(Config.STREAM_DIR, filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            logger.warning(f"Stream file not found: {filename} at {file_path}")
            return jsonify({
                'success': False,
                'error': f'File not found: {filename}'
            }), 404
        
        # Set appropriate Content-Type based on file extension
        if filename.endswith('.m3u8'):
            return send_from_directory(
                Config.STREAM_DIR,
                filename,
                mimetype='application/vnd.apple.mpegurl'
            )
        elif filename.endswith('.ts'):
            return send_from_directory(
                Config.STREAM_DIR,
                filename,
                mimetype='video/mp2t'
            )
        else:
            return send_from_directory(Config.STREAM_DIR, filename)
            
    except FileNotFoundError:
        logger.warning(f"Stream file not found: {filename}")
        return jsonify({
            'success': False,
            'error': 'File not found'
        }), 404
        
    except Exception as e:
        logger.error(f"Error serving stream file: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to serve file'
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for monitoring.
    
    Returns:
        JSON response with service status
    """
    return jsonify({
        'success': True,
        'status': 'healthy',
        'service': 'RTSP Overlay Backend'
    }), 200


if __name__ == '__main__':
    logger.info("="*60)
    logger.info("RTSP Livestream Overlay Application - Starting...")
    logger.info("="*60)
    
    # Initialize MongoDB connection
    logger.info("Initializing MongoDB connection...")
    success, error_msg = init_db_connection()
    
    if success:
        logger.info("✅ MongoDB connected successfully!")
    else:
        logger.warning("⚠️  MongoDB connection failed - running with in-memory storage")
        logger.warning(f"Error: {error_msg}")
        logger.warning("Overlays will not be persisted between restarts")
    
    logger.info(f"Starting Flask server on {Config.HOST}:{Config.PORT}")
    logger.info(f"Debug mode: {Config.DEBUG}")
    logger.info(f"Stream directory: {Config.STREAM_DIR}")
    logger.info("="*60)
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
