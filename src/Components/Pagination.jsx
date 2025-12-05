export default function Pagination({ page, setPage, pageCount }) {
  return (
    <div className="flex items-center justify-center gap-2 p-4">
      
      {/* Prev */}
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
      >
        «
      </button>

      {/* Page Numbers */}
      {Array.from({ length: pageCount }).slice(0, 5).map((_, i) => {
        const num = i + 1;
        return (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={`px-3 py-1 rounded text-sm border ${
              page === num ? "bg-[#940aea] text-white border-[#940aea]" : "bg-white"
            }`}
          >
            {num}
          </button>
        );
      })}

      {/* Next */}
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        disabled={page === pageCount}
      >
        »
      </button>
    </div>
  );
}
