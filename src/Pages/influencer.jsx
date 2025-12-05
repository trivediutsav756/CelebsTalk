import PageHeader from "../Components/PageHeader.jsx";
import DataTable from "../Components/DataTable.jsx";
import Pagination from "../Components/Pagination.jsx";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../Central_Store/app_context.jsx";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Customers() {
  const { fetchedData, deleteData, patchData, getServicesData } = useAppContext();

  const [influencers, setInfluencers] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openAdminDropdownId, setOpenAdminDropdownId] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    setInfluencers(fetchedData.influencers || []);
  }, [fetchedData.influencers]);

  const filtered = useMemo(() => {
    if (!query) return influencers;
    const q = query.toLowerCase();
    return influencers.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.mobile?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q)
    );
  }, [query, influencers]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id) => {
    await deleteData(`/influencers/${id}/`);
    setInfluencers((prev) => prev.filter((d) => d.id !== id));
  };

  const handleStatusToggle = async (row) => {
    const newStatus = row.status === "Active" ? "Inactive" : "Active";
    try {
      await patchData(`/influencers/${row.id}/`, { status: newStatus }, "Influencer");
      await getServicesData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleAdminStatusChange = async (id, value) => {
    try {
      await patchData(`/influencers/${id}/`, { admin_approved: value }, "Influencer");
      await getServicesData();
    } catch (err) {
      console.error(err);
      alert("Failed to update admin status");
    }
  };

  // Helper: ek hi jagah se rating count + average calculate
  const getRatingInfo = (row) => {
    // YAHAN apna actual field lagao:
    // Agar tumhare data me `reviews` hai to: const list = row.reviews || [];
    const list = row.ratings || [];

    if (!Array.isArray(list) || list.length === 0) {
      return { count: 0, avg: 0 };
    }

    let sum = 0;
    let count = 0;

    list.forEach((item) => {
      // item number ho sakta hai ya object { rating: number }
      const val =
        typeof item === "number"
          ? item
          : typeof item?.rating === "number"
          ? item.rating
          : null;

      if (val !== null) {
        sum += val;
        count += 1;
      }
    });

    if (count === 0) {
      return { count: 0, avg: 0 };
    }

    return {
      count,
      avg: sum / count,
    };
  };

  return (
    <div className="space-y-6">
      {/* Custom Big Title - Replaced default PageHeader title styling */}
      <div className="text-center py-12 bg-gradient-to-b from-indigo-50 to-white border-b">
        <h1 className="text-4xl font-extrabold text-purple-900 tracking-tight">
          Influencer
        </h1>
        <p className="mt-2 text-sm text-gray-500"></p>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name, email or mobile..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={[
          { label: "Name", key: "name", type: "text" },
          { label: "Email", key: "email", type: "text" },
          { label: "Mobile", key: "mobile", type: "text" },
          { label: "Commission Rate", key: "commission_rate", type: "text" },
          { label: "Price/Min Chat", key: "price_per_min_chat", type: "text" },
          { label: "Price/Min Audio", key: "price_per_min_audio", type: "text" },
          { label: "Price/Min Video", key: "price_per_min_video", type: "text" },

          // Rating Count (computed from ratings)
          {
            label: "Rating Count",
            key: "rating_count",
            render: (row) => {
              const { count } = getRatingInfo(row);
              return count;
            },
          },

          // Average Rating (computed from same ratings)
          {
            label: "Avg Rating",
            key: "avg_rating",
            render: (row) => {
              const { count, avg } = getRatingInfo(row);
              if (!count) return "0.0"; // koi rating nahi
              return avg.toFixed(1); // e.g. 4.3
            },
          },

          {
            label: "Status",
            key: "status",
            render: (row) => {
              const isActive = row.status === "Active" || row.status === true;
              return (
                <button
                  type="button"
                  onClick={() => handleStatusToggle(row)}
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    isActive
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </button>
              );
            },
          },
          {
            label: "Admin Approved",
            key: "admin_approved",
            render: (row) => {
              const value = row.admin_approved || "New";

              let colorClass = "bg-gray-100 text-gray-800";
              if (value === "Approved") colorClass = "bg-green-100 text-green-800";
              else if (value === "Pending" || value === "New") colorClass = "bg-yellow-100 text-yellow-800";
              else if (value === "Rejected") colorClass = "bg-red-100 text-red-800";

              const isOpen = openAdminDropdownId === row.id;

              return (
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAdminDropdownId(isOpen ? null : row.id)
                    }
                    className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
                  >
                    {value}
                  </button>

                  {isOpen && (
                    <div className="absolute z-10 mt-1 w-28 bg-white border border-gray-200 rounded shadow-lg">
                      <select
                        value={value}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setOpenAdminDropdownId(null);
                          handleAdminStatusChange(row.id, newVal);
                        }}
                        className="block w-full text-xs px-2 py-1 bg-white border-0 focus:ring-0"
                      >
                        <option value="New">New</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            label: "Login",
            key: "login_on_off",
            render: (row) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  row.login_on_off
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {row.login_on_off ? "On" : "Off"}
              </span>
            ),
          },
        ]}
        data={current}
        actions={(r) => (
          <div className="flex gap-3">
            <Link to={`/dashboard/influencer-detail/${r.id}`}>
              <EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition" />
            </Link>
            <TrashIcon
              className="h-5 w-5 text-red-600 hover:text-red-800 cursor-pointer transition"
              onClick={() => handleDelete(r.id)}
            />
          </div>
        )}
      />

      {/* Pagination */}
      <Pagination page={page} setPage={setPage} pageCount={pageCount} />
    </div>
  );
}