/**
 * OverlayList component displaying all overlays with action buttons.
 * Shows overlay type, content preview, and delete functionality.
 */
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OverlayList({ overlays, onDelete }) {
  /**
   * Handle overlay deletion with confirmation
   * @param {string} id - Overlay ID
   * @param {string} content - Overlay content for confirmation message
   */
  const handleDelete = async (id, content) => {
    const confirmMessage = `Delete overlay "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await onDelete(id);
        toast.success('Overlay deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete overlay');
      }
    }
  };

  /**
   * Truncate text for preview
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Overlays
        </h3>
        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
          {overlays.length}
        </span>
      </div>

      {overlays.length === 0 ? (
        <div className="text-center py-12">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-3xl">📋</span>
            </div>
            <div className="absolute inset-0 bg-gray-500 blur-xl opacity-20"></div>
          </div>
          <p className="text-gray-300 font-medium mb-2">No overlays yet</p>
          <p className="text-gray-500 text-sm">
            Create your first overlay using the form above
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {overlays.map((overlay) => (
            <div
              key={overlay.id}
              className="group bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg hover:shadow-blue-500/10 transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Type badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full shadow-lg ${
                        overlay.type === 'text'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      }`}
                    >
                      {overlay.type === 'text' ? '📝' : '🖼️'}
                      {overlay.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Content preview */}
                  <div className="mb-3">
                    {overlay.type === 'text' ? (
                      <p className="text-white text-sm break-words leading-relaxed">
                        {truncateText(overlay.content)}
                      </p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-700 rounded-lg overflow-hidden border border-gray-600 flex-shrink-0">
                          <img
                            src={overlay.content}
                            alt="Overlay preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                        <p className="text-gray-300 text-xs break-all flex-1">
                          {truncateText(overlay.content, 40)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Position and size info */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded-md border border-gray-700">
                      📍 ({overlay.position.x}, {overlay.position.y})
                    </span>
                    <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded-md border border-gray-700">
                      📏 {overlay.size.width}×{overlay.size.height}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(overlay.id, overlay.content)}
                  className="p-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all opacity-70 group-hover:opacity-100 shadow-lg hover:shadow-red-500/50 transform hover:scale-110 flex-shrink-0"
                  title="Delete overlay"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
