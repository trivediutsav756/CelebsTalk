import DataTable from "../Components/DataTable.jsx";
import Pagination from "../Components/Pagination.jsx";
import Form from "../Components/Form.jsx";
import Modal from "../Components/Modal.jsx";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../Central_Store/app_context.jsx";
import { useMemo, useState } from "react";

export default function Reviews() {
  const { fetchedData, deleteData, postData, patchData, getServicesData } =
    useAppContext();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const pageSize = 10;

  // Raw data coming from context
  const reviews = Array.isArray(fetchedData.reviews) ? fetchedData.reviews : [];
  const users = Array.isArray(fetchedData.users) ? fetchedData.users : [];
  const influencers = Array.isArray(fetchedData.influencers) ? fetchedData.influencers : [];

  // Helpers to build a nice display name from different possible fields.
  const getUserDisplayName = (user) => {
    if (!user) return "";
    const name =
      user.name ||
      user.username ||
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      "";
    const id = user.user_id || user.email || user.username || user.id;
    return name ? `${name} (${id})` : `User #${id}`;
  };

  const getInfluencerDisplayName = (influencer) => {
    if (!influencer) return "";
    const name =
      influencer.name ||
      influencer.username ||
      [influencer.first_name, influencer.last_name].filter(Boolean).join(" ") ||
      "";
    const id = influencer.influencer_id || influencer.id;
    return name ? `${name} (${id})` : `Influencer #${id}`;
  };

  const userOptions = useMemo(() => {
    return users
      .filter((u) => u && (u.user_id || u.email || u.username || u.id != null))
      .map((u) => ({
        value: String(u.user_id ?? u.email ?? u.username ?? u.id),
        label: getUserDisplayName(u),
      }));
  }, [users]);

  const influencerOptions = useMemo(() => {
    return influencers
      .filter((i) => i && i.influencer_id != null)
      .map((i) => ({
        value: String(i.influencer_id),
        label: getInfluencerDisplayName(i),
      }));
  }, [influencers]);

  // Map user_id -> user name
  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      map.set(u.id, getUserDisplayName(u));
    });
    return map;
  }, [users]);

  // Map influencer_id(string) and internal id(number) -> influencer name
  const influencerMap = useMemo(() => {
    const map = new Map();
    influencers.forEach((i) => {
      if (i?.id != null) map.set(String(i.id), getInfluencerDisplayName(i));
      if (i?.influencer_id != null) map.set(String(i.influencer_id), getInfluencerDisplayName(i));
    });
    return map;
  }, [influencers]);

  // Enrich reviews with userName and influencerName
  const enrichedReviews = useMemo(() => {
    return reviews.map((r) => ({
      ...r,
      userName: userMap.get(r.user_id) || `User #${r.user_id}`,
      influencerName:
        influencerMap.get(String(r.influencer_id)) || `Influencer #${r.influencer_id}`,
    }));
  }, [reviews, userMap, influencerMap]);

  // Filter by ID, name, or review text
  const filtered = useMemo(() => {
    if (!query) return enrichedReviews;
    const q = query.toLowerCase();
    return enrichedReviews.filter((r) => {
      return (
        String(r.user_id || "").toLowerCase().includes(q) ||
        (r.userName || "").toLowerCase().includes(q) ||
        String(r.influencer_id || "").toLowerCase().includes(q) ||
        (r.influencerName || "").toLowerCase().includes(q) ||
        (r.review || "").toLowerCase().includes(q)
      );
    });
  }, [enrichedReviews, query]);

  const pageCount = Math.ceil(filtered.length / pageSize) || 1;

  // Add an index field for display in the table (1-based, across all pages)
  const current = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize).map((row, idx) => ({
      ...row,
      index: startIndex + idx + 1,
    }));
  }, [filtered, page]);

  const handleDelete = async (id) => {
    await deleteData(`/reviews/${id}/`);
    await getServicesData("reviews");
  };

  const handleAdd = () => {
    setEditData({
      user_id: "",
      influencer_id: "",
      review: "",
      rating: "",
    });
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditData({
      id: row.id,
      user_id: row.user_id != null ? String(row.user_id) : "",
      influencer_id: row.influencer_id != null ? String(row.influencer_id) : "",
      review: row.review || "",
      rating: row.rating || "",
    });
    setOpen(true);
  };

  const handleSubmit = async (formValues) => {
    const payload = {
      user_id: String(formValues.user_id),
      influencer_id: String(formValues.influencer_id),
      review: (formValues.review || "").trim(),
      rating: String(formValues.rating || "").trim(),
    };

    try {
      if (editData?.id) {
        await patchData(`/reviews/${editData.id}/`, payload, "Review");
      } else {
        await postData("/reviews/", payload, "Review");
      }

      await getServicesData("reviews");
      setOpen(false);
      setEditData(null);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed: " + (error.message || "Unknown error"));
    }
  };

  // Form still uses IDs for saving
  const fields = [
    {
      label: "User",
      name: "user_id",
      type: "select",
      options: userOptions,
      required: true,
    },
    {
      label: "Influencer",
      name: "influencer_id",
      type: "select",
      options: influencerOptions,
      required: true,
    },
    { label: "Review", name: "review", type: "textarea", required: true },
    { label: "Rating", name: "rating", type: "text", required: true },
  ];

  // First column now shows index number instead of DB id
  const columns = [
    { label: "#", key: "index", type: "text" },
    { label: "User", key: "userName", type: "text" },
    { label: "Influencer", key: "influencerName", type: "text" },
    { label: "Review", key: "review", type: "text" },
    { label: "Rating", key: "rating", type: "text" },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-10 border-b border-gray-200 bg-gradient-to-b from-purple-50 to-white">
        <h1 className="text-4xl font-extrabold text-purple-700 tracking-tight">
          Reviews
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-6 lg:px-8">
        <input
          type="text"
          placeholder="Search by user, influencer or review text..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#940aea] text-white rounded-lg hover:bg-[#7d07c2] text-sm font-medium shadow-sm"
        >
          <PlusIcon className="h-4 w-4" />
          Add Review
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <DataTable
          columns={columns}
          data={current}
          actions={(row) => (
            <div className="flex gap-3">
              <button
                type="button"
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                onClick={() => handleEdit(row)}
              >
                Edit
              </button>
              <TrashIcon
                className="h-5 w-5 text-red-600 hover:text-red-800 cursor-pointer transition"
                onClick={() => handleDelete(row.id)}
              />
            </div>
          )}
        />
      </div>

      {pageCount > 1 && (
        <div className="px-4 sm:px-6 lg:px-8">
          <Pagination
            currentPage={page}
            totalPages={pageCount}
            onPageChange={setPage}
          />
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditData(null);
        }}
        title={editData ? "Edit Review" : "Add New Review"}
      >
        <Form
          fields={fields}
          initialData={editData || {}}
          onSubmit={handleSubmit}
          submitLabel={editData ? "Update Review" : "Create Review"}
          onCancel={() => {
            setOpen(false);
            setEditData(null);
          }}
        />
      </Modal>
    </div>
  );
}