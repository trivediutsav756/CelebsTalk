export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start sm:items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-3xl relative max-h-[calc(100vh-2rem)] overflow-y-auto">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-black hover:text-gray-700"
          >
            ✕
          </button>

          {/* Title */}
          {title && <h2 className="text-lg font-semibold mb-4 pr-8">{title}</h2>}

          {/* Inner Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
