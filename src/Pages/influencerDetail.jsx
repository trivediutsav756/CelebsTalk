import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppContext } from "../Central_Store/app_context.jsx";

export default function InfluencerDetail() {
  const { id } = useParams();
  const numericId = Number(id);
  const { baseUrl, fetchedData } = useAppContext();

  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const influencer = useMemo(
    () => fetchedData.influencers?.find((inf) => inf.id === numericId),
    [fetchedData.influencers, numericId]
  );

  useEffect(() => {
    const fetchInfluencerCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/influencer-category/`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch influencer categories");
        const data = await res.json();

        const all = Array.isArray(data) ? data : data.results || [];
        const match = all.find((item) => item.influencer_id === numericId);
        setCategoriesData(match?.categories || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencerCategories();
  }, [baseUrl, numericId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Influencer Detail</h1>
          <p className="text-sm text-gray-500">ID: {id}</p>
        </div>
        <Link
          to="/dashboard/influencers"
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
        >
          Back to Influencers
        </Link>
      </div>

      {influencer && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Basic Info</h2>
            <p><span className="font-medium">Name:</span> {influencer.name}</p>
            <p><span className="font-medium">Email:</span> {influencer.email}</p>
            <p><span className="font-medium">Mobile:</span> {influencer.mobile}</p>
            <p><span className="font-medium">Bio:</span> {influencer.bio}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Status</h2>
            <p>
              <span className="font-medium">Active:</span>{" "}
              {influencer.status ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Admin Approved:</span>{" "}
              {influencer.admin_approved ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-medium">Login On/Off:</span>{" "}
              {influencer.login_on_off ? "On" : "Off"}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>

        {loading && <p className="text-gray-500 text-sm">Loading categories...</p>}
        {error && !loading && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {!loading && !error && categoriesData.length === 0 && (
          <p className="text-gray-500 text-sm">No categories found for this influencer.</p>
        )}

        {!loading && !error && categoriesData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesData.map((cat) => (
              <div
                key={cat.category_id}
                className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 bg-gray-50"
              >
                {cat.category_image && (
                  <img
                    src={cat.category_image}
                    alt={cat.category_name}
                    className="h-16 w-16 object-cover rounded-full border"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{cat.category_name}</p>
                  <p className="text-xs text-gray-500">ID: {cat.category_id}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      cat.category_status
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cat.category_status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
