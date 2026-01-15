/**
 * OverlayControls component for creating new overlays.
 * Provides form with type selection and content input.
 */
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OverlayControls({ onCreateOverlay }) {
  const [type, setType] = useState('text');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter content for the overlay');
      return;
    }

    setIsSubmitting(true);

    // Create overlay data with defaults
    const overlayData = {
      type,
      content: content.trim(),
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
    };

    try {
      await onCreateOverlay(overlayData);
      
      // Clear form after successful creation
      setContent('');
      toast.success('Overlay created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create overlay');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Clear form
   */
  const handleClear = () => {
    setContent('');
    setType('text');
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          Add Overlay
        </h3>
        <div className="text-xs text-gray-500 px-3 py-1 bg-gray-900 rounded-full border border-gray-700">
          {type === 'text' ? 'Text Mode' : 'Image Mode'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Overlay Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`relative flex items-center justify-center cursor-pointer p-4 rounded-xl border-2 transition-all ${
              type === 'text' 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-700 bg-gray-900 hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="type"
                value="text"
                checked={type === 'text'}
                onChange={(e) => setType(e.target.value)}
                className="sr-only"
              />
              <span className={`font-medium ${type === 'text' ? 'text-blue-400' : 'text-gray-400'}`}>
                📝 Text
              </span>
            </label>
            <label className={`relative flex items-center justify-center cursor-pointer p-4 rounded-xl border-2 transition-all ${
              type === 'image' 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-gray-700 bg-gray-900 hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="type"
                value="image"
                checked={type === 'image'}
                onChange={(e) => setType(e.target.value)}
                className="sr-only"
              />
              <span className={`font-medium ${type === 'image' ? 'text-purple-400' : 'text-gray-400'}`}>
                🖼️ Image
              </span>
            </label>
          </div>
        </div>

        {/* Content input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            {type === 'text' ? 'Text Content' : 'Image URL'}
          </label>
          {type === 'text' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter text to display..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all placeholder-gray-500"
              disabled={isSubmitting}
            />
          ) : (
            <input
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl border border-gray-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-500"
              disabled={isSubmitting}
            />
          )}
        </div>

        {/* Preview area */}
        {content && (
          <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50 backdrop-blur-sm">
            <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Preview:</p>
            {type === 'text' ? (
              <div className="bg-black bg-opacity-70 p-3 rounded-lg border border-gray-700">
                <p className="text-white text-sm">{content}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 bg-gray-800 rounded-lg border border-gray-700">
                <img
                  src={content}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 transform hover:scale-[1.02]"
          >
            <Plus size={18} className={isSubmitting ? 'animate-pulse' : ''} />
            {isSubmitting ? 'Adding...' : 'Add Overlay'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="px-4 py-3 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl border border-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Clear form"
          >
            <X size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
