import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function PageHeader({ title, breadcrumb = [], query, setQuery, buttonLabel, onButtonClick, }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        {/* Title + Breadcrumb */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

          {breadcrumb.length > 0 && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              Dashboard
              {breadcrumb.map((item, index) => (
                <span key={index} className="flex items-center gap-1">
                  <span className="text-gray-400">/</span>
                  <span className={index === breadcrumb.length - 1 ? "text-[#940aea]" : ""}>
                    {item}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">

          {/* Search (optional) */}
          {setQuery && (
            <div className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search here"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#940aea]"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Optional Button */}
          {buttonLabel && onButtonClick && (
            <button
              onClick={onButtonClick}
              className="px-4 py-2 bg-[#940aea] text-white rounded-lg shadow hover:bg-[#7d07c2] transition cursor-pointer"
            >
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
