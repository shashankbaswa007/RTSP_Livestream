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
  const [opacity, setOpacity] = useState(100);
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

    // Create overlay data with defaults (using percentage-based positioning)
    const overlayData = {
      type,
      content: content.trim(),
      position: { x: 100, y: 100 }, // Keep for legacy support
      size: { width: 200, height: 100 },
      positionPercent: { x: 10, y: 10 }, // Default to 10% from top-left
      sizePercent: { width: 20, height: 15 }, // Default to 20% width, 15% height
      opacity: opacity / 100, // Convert 0-100 to 0-1
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
    setOpacity(100);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-medium text-white">
          Add Overlay
        </h3>
        <div className="text-xs text-gray-500 px-2.5 py-1 bg-gray-900 rounded border border-gray-700">
          {type === 'text' ? 'Text' : 'Image'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className={`relative flex items-center justify-center cursor-pointer p-3 rounded-md border transition-colors ${
              type === 'text' 
                ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="type"
                value="text"
                checked={type === 'text'}
                onChange={(e) => setType(e.target.value)}
                className="sr-only"
              />
              <span className="font-medium text-sm">Text</span>
            </label>
            <label className={`relative flex items-center justify-center cursor-pointer p-3 rounded-md border transition-colors ${
              type === 'image' 
                ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
            }`}>
              <input
                type="radio"
                name="type"
                value="image"
                checked={type === 'image'}
                onChange={(e) => setType(e.target.value)}
                className="sr-only"
              />
              <span className="font-medium text-sm">Image</span>
            </label>
          </div>
        </div>

        {/* Content input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {type === 'text' ? 'Content' : 'Image URL'}
          </label>
          {type === 'text' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter text..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-900 text-white rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors placeholder-gray-500 text-sm"
              disabled={isSubmitting}
            />
          ) : (
            <input
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full px-3 py-2 bg-gray-900 text-white rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500 text-sm"
              disabled={isSubmitting}
            />
          )}
        </div>

        {/* Opacity slider */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Opacity: <span className="text-blue-400">{opacity}%</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            disabled={isSubmitting}
            style={{
              background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${opacity}%, rgb(55, 65, 81) ${opacity}%, rgb(55, 65, 81) 100%)`
            }}
          />
        </div>

        {/* Preview area */}
        {content && (
          <div className="border border-gray-700 rounded-md p-3 bg-gray-900\">\n            <p className="text-xs text-gray-500 mb-2">Preview</p>
            {type === 'text' ? (
              <div className="bg-black/50 p-2 rounded">
                <p className="text-white text-sm">{content}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 bg-gray-800 rounded border border-gray-700">
                <img
                  src={content}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Plus size={16} />
            {isSubmitting ? 'Adding...' : 'Add Overlay'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="px-3 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-md border border-gray-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Clear"
          >
            <X size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
