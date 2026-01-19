import PageHeader from "../Components/PageHeader.jsx";
import DataTable from "../Components/DataTable.jsx";
import Pagination from "../Components/Pagination.jsx";
import Form from "../Components/Form.jsx";
import Modal from "../Components/Modal.jsx";
import { EyeIcon, TrashIcon, PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../Central_Store/app_context.jsx";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Customers() {
  const { fetchedData, deleteData, postData, patchData, getServicesData } = useAppContext();

  const [influencers, setInfluencers] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openAdminDropdownId, setOpenAdminDropdownId] = useState(null);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    setInfluencers(fetchedData.influencers || []);
  }, [fetchedData.influencers]);

  const filtered = useMemo(() => {
    const safeInfluencers = Array.isArray(influencers) ? influencers : [];
    if (!query) return safeInfluencers;
    const q = query.toLowerCase();
    return safeInfluencers.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.mobile?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q)
    );
  }, [query, influencers]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id) => {
    try {
      await deleteData(`/influencers/pass/${id}/`);
      setInfluencers((prev) => prev.filter((d) => d.id !== id));
      await getServicesData("influencers");
    } catch (err) {
      console.error(err);
      alert("Failed to delete influencer: " + (err?.message || "Unknown error"));
    }
  };

  const handleAdd = () => {
    setEditData({
      full_name: "",
      email: "",
      mobile: "",
      gender: "Male",
      dob: "",
      bio: "",
      languages: "",
      price_per_min_chat: "",
      price_per_min_audio: "",
      price_per_min_video: "",
      categories: "",
      services: "",
      expertise_data: "",
      services_data: "",
      instagram: "",
      youtube: "",
      image: null,
      verification_video: null,
    });
    setOpen(true);
  };

  const handleEdit = (row) => {
    const getName = row.full_name || row.name || "";
    const social = row.social_links && typeof row.social_links === "object" ? row.social_links : {};

    setEditData({
      id: row.id,
      full_name: getName,
      email: row.email || "",
      mobile: row.mobile || "",
      gender: row.gender || "Male",
      dob: row.dob || row.date_of_birth || "",
      bio: row.bio || "",
      languages: Array.isArray(row.languages) ? row.languages.join(",") : row.languages || "",
      price_per_min_chat: row.price_per_min_chat ?? "",
      price_per_min_audio: row.price_per_min_audio ?? "",
      price_per_min_video: row.price_per_min_video ?? "",
      categories: Array.isArray(row.categories) ? row.categories.join(",") : row.categories || "",
      services: Array.isArray(row.services) ? row.services.join(",") : row.services || "",
      expertise_data: Array.isArray(row.expertise_data) ? row.expertise_data.join(",") : row.expertise_data || "",
      services_data:
        Array.isArray(row.services_data) || typeof row.services_data === "object"
          ? JSON.stringify(row.services_data)
          : row.services_data || "",
      instagram: social.instagram || "",
      youtube: social.youtube || "",
      image: row.image || null,
      verification_video: row.verification_video || null,
    });
    setOpen(true);
  };

  const handleStatusToggle = async (row) => {
    const newStatus = row.status === "Active" ? "Inactive" : "Active";
    try {
      await patchData(`/influencers/pass/${row.id}/`, { status: newStatus }, "Influencer");
      await getServicesData("influencers");
    } catch (err) {
      console.error(err);
      alert("Failed to update status: " + (err?.message || "Unknown error"));
    }
  };

  const handleAdminStatusChange = async (id, value) => {
    try {
      await patchData(`/influencers/pass/${id}/`, { admin_approved: value }, "Influencer");
      await getServicesData("influencers");
    } catch (err) {
      console.error(err);
      alert("Failed to update admin status: " + (err?.message || "Unknown error"));
    }
  };

  const parseCsvNumbers = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v) => Number(v)).filter((n) => Number.isFinite(n));
    if (typeof value !== "string") return [];
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n));
  };

  const parseLanguages = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
    if (typeof value !== "string") return [];
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (values) => {
    const fd = new FormData();

    fd.append("full_name", (values.full_name || "").trim());
    fd.append("email", (values.email || "").trim());
    fd.append("mobile", (values.mobile || "").trim());
    fd.append("gender", values.gender || "");
    fd.append("dob", (values.dob || "").trim());
    fd.append("bio", (values.bio || "").trim());

    fd.append("price_per_min_chat", String(values.price_per_min_chat ?? "").trim());
    fd.append("price_per_min_audio", String(values.price_per_min_audio ?? "").trim());
    fd.append("price_per_min_video", String(values.price_per_min_video ?? "").trim());

    const languages = parseLanguages(values.languages);
    const categories = parseCsvNumbers(values.categories);
    const services = parseCsvNumbers(values.services);
    const expertise_data = parseCsvNumbers(values.expertise_data);

    fd.append("languages", JSON.stringify(languages));
    fd.append("categories", JSON.stringify(categories));
    fd.append("services", JSON.stringify(services));
    fd.append("expertise_data", JSON.stringify(expertise_data));

    const social_links = {
      instagram: (values.instagram || "").trim(),
      youtube: (values.youtube || "").trim(),
    };
    fd.append("social_links", JSON.stringify(social_links));

    if (values.services_data && String(values.services_data).trim()) {
      try {
        const parsed = JSON.parse(values.services_data);
        fd.append("services_data", JSON.stringify(parsed));
      } catch (e) {
        alert("services_data must be valid JSON");
        return;
      }
    } else {
      fd.append("services_data", JSON.stringify([]));
    }

    if (values.image && values.image instanceof File) {
      fd.append("image", values.image);
    }
    if (values.verification_video && values.verification_video instanceof File) {
      fd.append("verification_video", values.verification_video);
    }

    try {
      if (editData?.id) {
        await patchData(`/influencers/pass/${editData.id}/`, fd, "Influencer");
      } else {
        await postData("/influencers/", fd, "Influencer");
      }

      await getServicesData("influencers");
      setOpen(false);
      setEditData(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save influencer: " + (err?.message || "Unknown error"));
    }
  };

  const fields = [
    { label: "Full Name", name: "full_name", type: "text", required: true },
    { label: "Email", name: "email", type: "text", required: true },
    { label: "Mobile", name: "mobile", type: "text", required: true },
    { label: "Gender", name: "gender", type: "select", options: ["Male", "Female", "Other"], required: true },
    { label: "DOB", name: "dob", type: "date" },
    { label: "Bio", name: "bio", type: "textarea" },

    { label: "Languages (comma separated)", name: "languages", type: "text" },

    { label: "Price/Min Chat", name: "price_per_min_chat", type: "text" },
    { label: "Price/Min Audio", name: "price_per_min_audio", type: "text" },
    { label: "Price/Min Video", name: "price_per_min_video", type: "text" },

    { label: "Categories IDs (comma separated)", name: "categories", type: "text" },
    { label: "Services IDs (comma separated)", name: "services", type: "text" },
    { label: "Expertise IDs (comma separated)", name: "expertise_data", type: "text" },

    { label: "Services Data (JSON)", name: "services_data", type: "textarea", rows: 6 },
    { label: "Instagram", name: "instagram", type: "text" },
    { label: "YouTube", name: "youtube", type: "text" },

    { label: "Image", name: "image", type: "image" },
    { label: "Verification Video", name: "verification_video", type: "file", accept: "video/*" },
  ];

  const getRatingInfo = (row) => {
    const list = row.ratings || [];

    if (!Array.isArray(list) || list.length === 0) {
      return { count: 0, avg: 0 };
    }

    let sum = 0;
    let count = 0;

    list.forEach((item) => {
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
      <div className="text-center py-12 bg-gradient-to-b from-indigo-50 to-white border-b">
        <h1 className="text-4xl font-extrabold text-purple-900 tracking-tight">
          Influencer
        </h1>
        <p className="mt-2 text-sm text-gray-500"></p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Influencer
        </button>
      </div>

      <DataTable
        columns={[
          { label: "Name", key: "full_name", render: (row) => row.full_name || row.name || "-" },
          { label: "Email", key: "email", type: "text" },
          { label: "Mobile", key: "mobile", type: "text" },
          { label: "Commission Rate", key: "commission_rate", type: "text" },
          { label: "Price/Min Chat", key: "price_per_min_chat", type: "text" },
          { label: "Price/Min Audio", key: "price_per_min_audio", type: "text" },
          { label: "Price/Min Video", key: "price_per_min_video", type: "text" },

          {
            label: "Rating Count",
            key: "rating_count",
            render: (row) => {
              const { count } = getRatingInfo(row);
              return count;
            },
          },

          {
            label: "Avg Rating",
            key: "avg_rating",
            render: (row) => {
              const { count, avg } = getRatingInfo(row);
              if (!count) return "0.0"; 
              return avg.toFixed(1); 
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
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-900"
              onClick={() => handleEdit(r)}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
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

      <Pagination page={page} setPage={setPage} pageCount={pageCount} />

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditData(null);
        }}
        title={editData?.id ? "Edit Influencer" : "Add Influencer"}
      >
        <Form
          fields={fields}
          initialData={editData || {}}
          onSubmit={handleSubmit}
          submitLabel={editData?.id ? "Update Influencer" : "Create Influencer"}
          onCancel={() => {
            setOpen(false);
            setEditData(null);
          }}
        />
      </Modal>
    </div>
  );
}