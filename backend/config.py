"""
Configuration module for Flask application.
Loads environment variables and provides application settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration class."""
    
    # MongoDB Configuration
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'rtsp_overlay_db')
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    if SECRET_KEY == 'dev-secret-key-change-in-production':
        print("WARNING: Using default SECRET_KEY. Change this in production!")
    
    # Stream Configuration
    STREAM_DIR = os.path.join(os.path.dirname(__file__), 'static', 'stream')
    
    # Environment Configuration
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # Server Configuration
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
