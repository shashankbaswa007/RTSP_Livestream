/**
 * Overlay component using react-rnd for drag and resize functionality.
 * Lightweight, transparent overlays that blend naturally with video content.
 */
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Overlay({ overlay, onUpdate, onDelete, onSelect, containerDimensions }) {
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localOpacity, setLocalOpacity] = useState((overlay.opacity !== undefined ? overlay.opacity : 1) * 100);
  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 });
  const [localSize, setLocalSize] = useState({ width: 200, height: 100 });
  const inactivityTimerRef = useRef(null);
  
  // Update local position/size when container dimensions or overlay data changes
  useEffect(() => {
    if (isDragging) return; // Don't update during drag
    
    // Convert stored percentages to pixels for rendering
    if (!containerDimensions.width || !containerDimensions.height) {
      // Fallback to absolute pixels if container dimensions not ready
      setLocalPosition(overlay.position || { x: 100, y: 100 });
      setLocalSize(overlay.size || { width: 200, height: 100 });
      return;
    }
    
    // If overlay has percentage-based position, convert to pixels
    if (overlay.positionPercent) {
      setLocalPosition({
        x: (overlay.positionPercent.x / 100) * containerDimensions.width,
        y: (overlay.positionPercent.y / 100) * containerDimensions.height,
      });
    } else {
      // Legacy support
      setLocalPosition(overlay.position || { x: 100, y: 100 });
    }
    
    // If overlay has percentage-based size, convert to pixels
    if (overlay.sizePercent) {
      setLocalSize({
        width: (overlay.sizePercent.width / 100) * containerDimensions.width,
        height: (overlay.sizePercent.height / 100) * containerDimensions.height,
      });
    } else {
      // Legacy support
      setLocalSize(overlay.size || { width: 200, height: 100 });
    }
  }, [containerDimensions, overlay.positionPercent, overlay.sizePercent, overlay.position, overlay.size, isDragging]);

  /**
   * Toggle selection and start inactivity timer
   */
  const handleSelect = () => {
    if (isSelected) {
      // Toggle off - deselect if already selected
      setIsSelected(false);
      clearInactivityTimer();
    } else {
      // Select and start timer
      setIsSelected(true);
      if (onSelect) onSelect(overlay.id);
      startInactivityTimer();
    }
  };

  /**
   * Start 5-second inactivity timer
   */
  const startInactivityTimer = () => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      setIsSelected(false);
      if (onSelect) onSelect(null); // Clear parent selection tracking
    }, 5000); // 5 seconds
  };

  /**
   * Clear inactivity timer
   */
  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  /**
   * Handle deselection from parent
   */
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Check if click is outside this overlay
      if (isSelected && !e.target.closest('.overlay-container-' + overlay.id)) {
        setIsSelected(false);
        clearInactivityTimer();
      }
    };

    if (isSelected) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInactivityTimer();
    };
  }, [isSelected, overlay.id]);

  /**
   * Ensure timer cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearInactivityTimer();
    };
  }, []);

  /**
   * Sync local position when overlay prop changes externally
   */
  useEffect(() => {
    setLocalPosition(overlay.position);
    setLocalSize(overlay.size);
  }, [overlay.position.x, overlay.position.y, overlay.size.width, overlay.size.height]);

  /**
   * Handle opacity change
   */
  const handleOpacityChange = (e) => {
    const newOpacity = parseInt(e.target.value);
    setLocalOpacity(newOpacity);
    startInactivityTimer(); // Reset timer on interaction
  };

  /**
   * Save opacity when slider is released
   */
  const handleOpacitySave = () => {
    onUpdate(overlay.id, {
      opacity: localOpacity / 100,
    });
    startInactivityTimer(); // Reset timer after save
  };

  /**
   * Handle drag stop event - convert pixels to percentages
   */
  const handleDragStop = (e, data) => {
    const newPosition = { x: data.x, y: data.y };
    
    // Update local position immediately to prevent flicker
    setLocalPosition(newPosition);
    setIsDragging(false);
    
    // Convert pixel position to percentage for storage
    const positionPercent = {
      x: (newPosition.x / containerDimensions.width) * 100,
      y: (newPosition.y / containerDimensions.height) * 100,
    };
    
    // Update parent with percentage-based position
    onUpdate(overlay.id, {
      position: newPosition, // Keep for legacy support
      positionPercent,
    });
    
    if (isSelected) {
      startInactivityTimer(); // Reset timer after drag
    }
  };

  /**
   * Handle resize stop event - convert pixels to percentages
   */
  const handleResizeStop = (e, direction, ref, delta, position) => {
    const newPosition = { x: position.x, y: position.y };
    const newSize = {
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
    };
    
    // Update local state immediately to prevent flicker
    setLocalPosition(newPosition);
    setLocalSize(newSize);
    
    // Convert to percentages for storage
    const positionPercent = {
      x: (newPosition.x / containerDimensions.width) * 100,
      y: (newPosition.y / containerDimensions.height) * 100,
    };
    const sizePercent = {
      width: (newSize.width / containerDimensions.width) * 100,
      height: (newSize.height / containerDimensions.height) * 100,
    };
    
    // Update parent with percentage-based values
    onUpdate(overlay.id, {
      position: newPosition, // Keep for legacy support
      size: newSize,
      positionPercent,
      sizePercent,
    });
    
    if (isSelected) {
      startInactivityTimer(); // Reset timer after resize
    }
  };

  return (
    <Rnd
      position={{
        x: localPosition.x,
        y: localPosition.y,
      }}
      size={{
        width: localSize.width,
        height: localSize.height,
      }}
      bounds="parent"
      onDragStart={() => {
        setIsDragging(true);
        if (isSelected) clearInactivityTimer();
      }}
      onDrag={() => {
        // This fires during drag for smooth visual feedback
        // No state updates needed - react-rnd handles position internally
      }}
      onDragStop={handleDragStop}
      onResizeStart={() => {
        if (isSelected) clearInactivityTimer();
      }}
      onResizeStop={handleResizeStop}
      dragHandleClassName="overlay-drag-handle"
      scale={1}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      className={`overlay-container-${overlay.id} group cursor-move`}
      style={{
        zIndex: 9999, // Very high z-index for fullscreen visibility
        opacity: localOpacity / 100,
        pointerEvents: 'auto', // Allow interaction with overlay
        border: isSelected ? '2px solid rgba(59, 130, 246, 0.6)' : '1px solid transparent',
        boxShadow: isSelected 
          ? '0 0 0 1px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)' 
          : 'none',
        // Disable transitions during drag for smooth performance
        transition: isDragging ? 'none' : 'border 0.15s, box-shadow 0.15s, opacity 0.1s',
        // Optimize rendering during drag
        willChange: isDragging ? 'transform' : 'auto',
      }}
    >
      {/* Delete button - only visible on hover/selection */}
      <button
        onClick={() => onDelete(overlay.id)}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-lg transform hover:scale-110"
        title="Delete overlay"
      >
        <X size={16} />
      </button>

      {/* Opacity control - only visible when selected */}
      {isSelected && (
        <div 
          className="absolute -bottom-10 left-0 right-0 bg-gray-900/95 border border-blue-500/50 rounded-md p-2 shadow-lg z-20"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="text-white text-xs whitespace-nowrap">Opacity:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={localOpacity}
              onChange={handleOpacityChange}
              onMouseUp={handleOpacitySave}
              onTouchEnd={handleOpacitySave}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-mini"
              style={{
                background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${localOpacity}%, rgb(55, 65, 81) ${localOpacity}%, rgb(55, 65, 81) 100%)`
              }}
            />
            <span className="text-blue-400 text-xs font-mono w-10 text-right">{localOpacity}%</span>
          </div>
        </div>
      )}

      {/* Text Overlay - Semi-transparent background with readable text */}
      {overlay.type === 'text' ? (
        <div 
          className="overlay-drag-handle w-full h-full flex items-center justify-center p-4 rounded-lg"
          onClick={handleSelect}
          style={{
            // Very subtle background - lets video show through
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3))',
            backdropFilter: 'blur(4px)',
            cursor: 'move',
            WebkitUserDrag: 'none',
          }}
        >
          <p 
            className="text-white text-center break-words font-semibold leading-tight"
            style={{
              // Strong text shadow for readability on any background
              textShadow: `
                2px 2px 4px rgba(0, 0, 0, 0.9),
                -1px -1px 2px rgba(0, 0, 0, 0.7),
                1px 1px 3px rgba(0, 0, 0, 0.8)
              `,
              fontSize: 'clamp(14px, 2vw, 24px)', // Responsive text size
              userSelect: 'none', // Prevent text selection during drag
            }}
          >
            {overlay.content}
          </p>
        </div>
      ) : overlay.type === 'image' ? (
        /* Image Overlay - Transparent background, preserve aspect ratio */
        <div 
          className="overlay-drag-handle w-full h-full rounded-lg overflow-hidden"
          onClick={handleSelect}
          style={{
            cursor: 'move',
            WebkitUserDrag: 'none',
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.1)', // Subtle background to ensure visibility
          }}
        >
          <img
            src={overlay.content}
            alt="Overlay"
            className="w-full h-full"
            style={{
              objectFit: 'contain', // Preserve aspect ratio
              mixBlendMode: 'normal', // Natural blending with video
              pointerEvents: 'none', // Allow drag events to pass through
              userSelect: 'none', // Prevent image selection
              display: 'block', // Ensure image is displayed
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            draggable={false}
            onError={(e) => {
              e.target.onerror = null;
              // Fallback with semi-transparent error message
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="rgba(0,0,0,0.3)" width="100" height="100"/%3E%3Ctext fill="white" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="10" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8)"%3EImage Error%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      ) : null}

      {/* Resize handles indicator - only visible on hover */}
      {isSelected && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            // Corner dots to indicate resize handles
            background: `
              radial-gradient(circle at 0 0, rgba(59, 130, 246, 0.5) 3px, transparent 3px),
              radial-gradient(circle at 100% 0, rgba(59, 130, 246, 0.5) 3px, transparent 3px),
              radial-gradient(circle at 0 100%, rgba(59, 130, 246, 0.5) 3px, transparent 3px),
              radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.5) 3px, transparent 3px)
            `,
          }}
        />
      )}
    </Rnd>
  );
}
