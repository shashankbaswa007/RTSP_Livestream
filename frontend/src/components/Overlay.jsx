/**
 * Overlay component using react-rnd for drag and resize functionality.
 * Renders text or image overlays with delete button.
 */
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';

export default function Overlay({ overlay, onUpdate, onDelete }) {
  /**
   * Handle drag stop event
   * @param {Event} e - Drag event
   * @param {Object} data - Drag data with x, y coordinates
   */
  const handleDragStop = (e, data) => {
    onUpdate(overlay.id, {
      position: {
        x: data.x,
        y: data.y,
      },
    });
  };

  /**
   * Handle resize stop event
   * @param {Event} e - Resize event
   * @param {string} direction - Resize direction
   * @param {Object} ref - Reference to element
   * @param {Object} delta - Size delta
   * @param {Object} position - New position
   */
  const handleResizeStop = (e, direction, ref, delta, position) => {
    onUpdate(overlay.id, {
      position: {
        x: position.x,
        y: position.y,
      },
      size: {
        width: parseInt(ref.style.width, 10),
        height: parseInt(ref.style.height, 10),
      },
    });
  };

  return (
    <Rnd
      default={{
        x: overlay.position.x,
        y: overlay.position.y,
        width: overlay.size.width,
        height: overlay.size.height,
      }}
      bounds="parent"
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
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
      className="border-2 border-blue-500 hover:border-purple-500 cursor-move group shadow-2xl hover:shadow-blue-500/50 transition-all"
      style={{
        zIndex: 10,
      }}
    >
      {/* Delete button - only visible on hover */}
      <button
        onClick={() => onDelete(overlay.id)}
        className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg transform hover:scale-110"
        title="Delete overlay"
      >
        <X size={14} />
      </button>

      {/* Overlay content based on type */}
      {overlay.type === 'text' ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/70 to-gray-900/70 backdrop-blur-sm p-3 rounded border border-gray-600">
          <p className="text-white text-center break-words font-medium shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {overlay.content}
          </p>
        </div>
      ) : overlay.type === 'image' ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded overflow-hidden">
          <img
            src={overlay.content}
            alt="Overlay"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%231f2937" width="100" height="100"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3EImage Error%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      ) : null}
    </Rnd>
  );
}
