"""
MongoDB models and database operations for overlay management.
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, OperationFailure
from bson import ObjectId
from datetime import datetime
from config import Config
import logging
import urllib.parse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB client instance
_client = None
_db = None
_connection_attempted = False
_temp_overlays = {}  # In-memory storage when MongoDB is unavailable


def init_db_connection():
    """
    Initialize MongoDB database connection with proper error handling.
    Should be called once at application startup.
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    global _client, _db, _connection_attempted
    
    if _connection_attempted:
        return (_db is not None, None if _db else "Connection already attempted and failed")
    
    _connection_attempted = True
    
    try:
        # Log connection attempt (without exposing password)
        safe_uri = Config.MONGODB_URI.split('@')[1] if '@' in Config.MONGODB_URI else Config.MONGODB_URI
        logger.info(f"Attempting to connect to MongoDB Atlas: {safe_uri}")
        logger.info(f"Database name: {Config.MONGODB_DB_NAME}")
        
        # Create MongoDB client with recommended settings for Atlas
        _client = MongoClient(
            Config.MONGODB_URI,
            serverSelectionTimeoutMS=10000,  # 10 second timeout
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            retryWrites=True,
            w='majority'
        )
        
        # Test connection by pinging the server
        _client.admin.command('ping')
        
        # Get database reference
        _db = _client[Config.MONGODB_DB_NAME]
        
        # Verify database access by listing collections
        collections = _db.list_collection_names()
        logger.info(f"✅ Successfully connected to MongoDB Atlas!")
        logger.info(f"Database: {Config.MONGODB_DB_NAME}")
        logger.info(f"Existing collections: {collections if collections else 'None (will be created)'}")
        
        # Create indexes for better performance
        try:
            _db.overlays.create_index([("createdAt", -1)])
            logger.info("Created index on overlays.createdAt")
        except Exception as e:
            logger.warning(f"Could not create index: {e}")
        
        return (True, None)
        
    except ServerSelectionTimeoutError as e:
        error_msg = f"Connection timeout - could not reach MongoDB Atlas. Check: 1) Network connectivity, 2) IP whitelist in Atlas Network Access"
        logger.error(f"❌ {error_msg}")
        logger.error(f"Details: {str(e)}")
        return (False, error_msg)
        
    except OperationFailure as e:
        error_msg = f"Authentication failed. Check: 1) Username and password are correct, 2) User has access to database '{Config.MONGODB_DB_NAME}'"
        logger.error(f"❌ {error_msg}")
        logger.error(f"Details: {str(e)}")
        return (False, error_msg)
        
    except ConnectionFailure as e:
        error_msg = f"Connection failed: {str(e)}"
        logger.error(f"❌ {error_msg}")
        return (False, error_msg)
        
    except Exception as e:
        error_msg = f"Unexpected error connecting to MongoDB: {str(e)}"
        logger.error(f"❌ {error_msg}")
        logger.exception("Full traceback:")
        return (False, error_msg)


def get_db_connection():
    """
    Get MongoDB database connection.
    
    Returns:
        Database: MongoDB database instance or None if connection failed
    """
    global _db
    
    if not _connection_attempted:
        init_db_connection()
    
    return _db


def create_overlay(data):
    """
    Create a new overlay in the database.
    
    Args:
        data (dict): Overlay data containing type, content, position, size
        
    Returns:
        dict: Created overlay document with string ID
        
    Raises:
        ValueError: If required fields are missing or invalid
    """
    # Validate required fields
    if not data.get('type'):
        raise ValueError("Overlay type is required")
    
    if data['type'] not in ['text', 'image']:
        raise ValueError("Overlay type must be 'text' or 'image'")
    
    if not data.get('content'):
        raise ValueError("Overlay content is required")
    
    # Set defaults
    overlay_doc = {
        'type': data['type'],
        'content': data['content'],
        'position': data.get('position', {'x': 100, 'y': 100}),
        'size': data.get('size', {'width': 200, 'height': 100}),
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }
    
    db = get_db_connection()
    if db is None:
        # Store in memory when DB is unavailable
        overlay_id = 'temp_' + str(datetime.utcnow().timestamp())
        overlay_doc['id'] = overlay_id
        _temp_overlays[overlay_id] = overlay_doc
        logger.warning("MongoDB unavailable - overlay stored in memory")
        return overlay_doc
    
    result = db.overlays.insert_one(overlay_doc)
    
    # Convert ObjectId to string for JSON serialization
    overlay_doc['id'] = str(result.inserted_id)
    del overlay_doc['_id']
    
    logger.info(f"Created overlay: {overlay_doc['id']}")
    return overlay_doc


def get_all_overlays():
    """
    Retrieve all overlays from the database.
    
    Returns:
        list: List of overlay documents with string IDs
    """
    db = get_db_connection()
    if db is None:
        # Return in-memory overlays
        return list(_temp_overlays.values())
    
    overlays = list(db.overlays.find())
    
    # Convert ObjectId to string
    for overlay in overlays:
        overlay['id'] = str(overlay['_id'])
        del overlay['_id']
    
    logger.info(f"Retrieved {len(overlays)} overlays")
    return overlays


def get_overlay_by_id(overlay_id):
    """
    Retrieve a single overlay by ID.
    
    Args:
        overlay_id (str): Overlay ID string
        
    Returns:
        dict: Overlay document with string ID
        
    Raises:
        ValueError: If ID format is invalid
        LookupError: If overlay not found
    """
    try:
        object_id = ObjectId(overlay_id)
    except Exception:
        # Check if it's a temp ID in memory
        if overlay_id.startswith('temp_') and overlay_id in _temp_overlays:
            return _temp_overlays[overlay_id]
        raise ValueError(f"Invalid overlay ID format: {overlay_id}")
    
    db = get_db_connection()
    if db is None:
        raise LookupError("MongoDB unavailable")
    
    overlay = db.overlays.find_one({'_id': object_id})
    
    if not overlay:
        raise LookupError(f"Overlay not found: {overlay_id}")
    
    # Convert ObjectId to string
    overlay['id'] = str(overlay['_id'])
    del overlay['_id']
    
    return overlay


def update_overlay(overlay_id, data):
    """
    Update an existing overlay.
    
    Args:
        overlay_id (str): Overlay ID string
        data (dict): Updated overlay data (position, size, content)
        
    Returns:
        dict: Updated overlay document with string ID
        
    Raises:
        ValueError: If ID format is invalid
        LookupError: If overlay not found
    """
    try:
        object_id = ObjectId(overlay_id)
    except Exception:
        # Handle temp IDs
        if overlay_id.startswith('temp_') and overlay_id in _temp_overlays:
            # Update in-memory overlay
            update_doc = {'updatedAt': datetime.utcnow()}
            if 'position' in data:
                update_doc['position'] = data['position']
            if 'size' in data:
                update_doc['size'] = data['size']
            if 'content' in data:
                update_doc['content'] = data['content']
            
            _temp_overlays[overlay_id].update(update_doc)
            logger.info(f"Updated in-memory overlay: {overlay_id}")
            return _temp_overlays[overlay_id]
        raise ValueError(f"Invalid overlay ID format: {overlay_id}")
    
    # Build update document
    update_doc = {'updatedAt': datetime.utcnow()}
    
    if 'position' in data:
        update_doc['position'] = data['position']
    
    if 'size' in data:
        update_doc['size'] = data['size']
    
    if 'content' in data:
        update_doc['content'] = data['content']
    
    db = get_db_connection()
    if db is None:
        raise LookupError("MongoDB unavailable")
    
    result = db.overlays.update_one(
        {'_id': object_id},
        {'$set': update_doc}
    )
    
    if result.matched_count == 0:
        raise LookupError(f"Overlay not found: {overlay_id}")
    
    logger.info(f"Updated overlay: {overlay_id}")
    
    # Return updated document
    return get_overlay_by_id(overlay_id)


def delete_overlay(overlay_id):
    """
    Delete an overlay from the database.
    
    Args:
        overlay_id (str): Overlay ID string
        
    Raises:
        ValueError: If ID format is invalid
        LookupError: If overlay not found
    """
    try:
        object_id = ObjectId(overlay_id)
    except Exception:
        # Handle temp IDs
        if overlay_id.startswith('temp_') and overlay_id in _temp_overlays:
            del _temp_overlays[overlay_id]
            logger.info(f"Deleted in-memory overlay: {overlay_id}")
            return
        raise ValueError(f"Invalid overlay ID format: {overlay_id}")
    
    db = get_db_connection()
    if db is None:
        raise LookupError("MongoDB unavailable")
    
    result = db.overlays.delete_one({'_id': object_id})
    
    if result.deleted_count == 0:
        raise LookupError(f"Overlay not found: {overlay_id}")
    
    logger.info(f"Deleted overlay: {overlay_id}")
