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

  const [availabilityData, setAvailabilityData] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");

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

  useEffect(() => {
    const fetchAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      try {
        const res = await fetch(`${baseUrl}/availability/${numericId}/`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch availability");
        const data = await res.json();
        setAvailabilityData(data);
      } catch (err) {
        setAvailabilityError(err.message || "Something went wrong");
        setAvailabilityData(null);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    if (Number.isFinite(numericId)) fetchAvailability();
  }, [baseUrl, numericId]);

  const days = useMemo(
    () => [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    []
  );

  const parseTimeToMinutes = (t) => {
    if (!t || typeof t !== "string") return null;
    const parts = t.split(":");
    if (parts.length < 2) return null;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 60 + m;
  };

  const availabilityByDay = useMemo(() => {
    const list = availabilityData?.availability;
    const map = {};
    if (!Array.isArray(list)) return map;
    for (const d of list) {
      if (!d?.day) continue;
      map[d.day] = Array.isArray(d.slots) ? d.slots : [];
    }
    return map;
  }, [availabilityData]);

  const formatTime = (t) => {
    if (!t || typeof t !== "string") return "-";
    const parts = t.split(":");
    if (parts.length < 2) return t;
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  };

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
        <>
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
        </>
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

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">Availability</h2>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Booked
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              Paused
            </span>
          </div>
        </div>

        {availabilityLoading && (
          <p className="text-gray-500 text-sm">Loading availability...</p>
        )}
        {availabilityError && !availabilityLoading && (
          <p className="text-red-600 text-sm">{availabilityError}</p>
        )}

        {!availabilityLoading && !availabilityError && (
          <div className="space-y-4">
            {days.map((day) => {
              const apiSlots = availabilityByDay[day] || [];
              const sorted = [...apiSlots].sort((a, b) => {
                const aStart = parseTimeToMinutes(a?.start_time);
                const bStart = parseTimeToMinutes(b?.start_time);
                if (!Number.isFinite(aStart) && !Number.isFinite(bStart)) return 0;
                if (!Number.isFinite(aStart)) return 1;
                if (!Number.isFinite(bStart)) return -1;
                return aStart - bStart;
              });

              return (
                <div key={day} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="font-medium text-gray-900">{day}</p>
                    <p className="text-xs text-gray-500">Slots: {sorted.length}</p>
                  </div>

                  {sorted.length === 0 ? (
                    <p className="text-sm text-gray-500">No slots</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {sorted.map((s, idx) => {
                        const isPaused = Boolean(s?.is_pause);
                        const isBooked = Boolean(s?.is_booked);

                        let badgeClass = "bg-gray-50 border-gray-200 text-gray-700";
                        if (isPaused) badgeClass = "bg-yellow-50 border-yellow-200 text-yellow-900";
                        else if (isBooked)
                          badgeClass = "bg-green-50 border-green-200 text-green-800";

                        return (
                          <div
                            key={`${day}-${s?.slot_id ?? idx}`}
                            className={`rounded-md border px-3 py-2 text-sm font-medium ${badgeClass}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span>
                                {formatTime(s?.start_time)} - {formatTime(s?.end_time)}
                              </span>
                              <span className="text-xs font-semibold">
                                {isPaused ? "Paused" : isBooked ? "Booked" : "Available"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {!Array.isArray(availabilityData?.availability) && (
              <p className="text-gray-500 text-sm">No availability data found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
 }
