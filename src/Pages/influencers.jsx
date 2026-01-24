import DataTable from "../Components/DataTable.jsx";
import Pagination from "../Components/Pagination.jsx";
import Form from "../Components/Form.jsx";
import Modal from "../Components/Modal.jsx";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../Central_Store/app_context.jsx";
import { useEffect, useMemo, useState } from "react";

export default function Influencers() {
  const { fetchedData, deleteData, postData, patchData, getServicesData } = useAppContext();

  const [influencers, setInfluencers] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const pageSize = 10;
  const STATIC_URL = import.meta?.env?.DEV ? "http://127.0.0.1:8000" : "https://celebstalks.pythonanywhere.com";

  useEffect(() => {
    setInfluencers(Array.isArray(fetchedData.influencers) ? fetchedData.influencers : []);
  }, [fetchedData.influencers]);

  const categoryOptions = useMemo(() => {
    const cats = Array.isArray(fetchedData.categories) ? fetchedData.categories : [];
    return cats
      .filter((c) => c && c.id != null)
      .map((c) => ({ value: String(c.id), label: c.name || `Category #${c.id}` }));
  }, [fetchedData.categories]);

  const filtered = useMemo(() => {
    const safe = Array.isArray(influencers) ? influencers : [];
    if (!query) return safe;

    const q = query.toLowerCase();
    return safe.filter((i) => {
      return (
        String(i?.influencer_id || "").toLowerCase().includes(q) ||
        String(i?.full_name || "").toLowerCase().includes(q) ||
        String(i?.mobile || "").toLowerCase().includes(q) ||
        String(i?.email || "").toLowerCase().includes(q)
      );
    });
  }, [influencers, query]);

  const pageCount = Math.ceil(filtered.length / pageSize) || 1;
  const current = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize).map((row, idx) => ({
      ...row,
      index: startIndex + idx + 1,
    }));
  }, [filtered, page]);

  const normalizeLanguagesToText = (value) => {
    if (Array.isArray(value)) {
      const parts = value.filter((v) => v != null).map((v) => String(v));

      // Handles API returning split JSON fragments like: ["[\"Hindi\"", "\"English\"]"]
      const joined = parts.join(",");
      if (joined.includes("[") && joined.includes("]")) {
        try {
          const parsed = JSON.parse(joined);
          if (Array.isArray(parsed)) return parsed.filter(Boolean).join(", ");
        } catch (e) {}
      }

      return parts.filter(Boolean).join(", ");
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.filter(Boolean).join(", ");
        } catch (e) {}
      }
      return value;
    }
    return "";
  };

  const normalizeSocialLinksToText = (value) => {
    if (!value) return "{}";
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      return "{}";
    }
  };

  const handleAdd = () => {
    setEditData({
      influencer_id: "",
      full_name: "",
      category_id: "",
      dob: "",
      email: "",
      mobile: "",
      gender: "",
      bio: "",
      languages: "",
      social_links: "{}",
      price_per_min_chat: "",
      price_per_min_audio: "",
      price_per_min_video: "",
      status: "",
      image: "",
      verification_video: "",
    });
    setOpen(true);
  };

  const handleEdit = (row) => {
    const firstCategoryId =
      Array.isArray(row?.categories) && row.categories[0]?.id != null
        ? String(row.categories[0].id)
        : "";

    setEditData({
      id: row.id,
      influencer_id: row.influencer_id || "",
      full_name: row.full_name || row.name || "",
      category_id: firstCategoryId,
      dob: row.dob || "",
      email: row.email || "",
      mobile: row.mobile || "",
      gender: row.gender || "",
      bio: row.bio || "",
      languages: normalizeLanguagesToText(row.languages),
      social_links: normalizeSocialLinksToText(row.social_links),
      price_per_min_chat: row.price_per_min_chat ?? "",
      price_per_min_audio: row.price_per_min_audio ?? "",
      price_per_min_video: row.price_per_min_video ?? "",
      status: row.status ?? "",
      image: row.image ? STATIC_URL + row.image : "",
      verification_video: row.verification_video ? STATIC_URL + row.verification_video : "",
    });
    setOpen(true);
  };

  const handleDelete = async (row) => {
    const influencerId = row?.influencer_id;
    if (!influencerId) return;

    if (!window.confirm("Delete this influencer?")) return;
    await deleteData(`/influencers/${influencerId}/`);
    await getServicesData("influencers");
  };

  const parseLanguages = (text) => {
    if (!text) return [];
    if (Array.isArray(text)) return text;

    return String(text)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const safeParseJson = (text) => {
    if (text == null || text === "") return {};
    if (typeof text === "object") return text;
    try {
      return JSON.parse(text);
    } catch (e) {
      return {};
    }
  };

  const buildInfluencerFormData = (formValues, { isEdit }) => {
    const fd = new FormData();

    const influencer_id = String(formValues.influencer_id || "").trim();
    if (!isEdit) {
      fd.append("influencer_id", influencer_id);
    }

    fd.append("full_name", String(formValues.full_name || "").trim());

    const categoryId = String(formValues.category_id || "").trim();
    if (categoryId) {
      fd.append("categories", categoryId);
    }

    if (formValues.dob) fd.append("dob", String(formValues.dob));
    if (formValues.email) fd.append("email", String(formValues.email).trim());
    if (formValues.mobile) fd.append("mobile", String(formValues.mobile).trim());
    if (formValues.gender) fd.append("gender", String(formValues.gender).trim());
    if (formValues.bio) fd.append("bio", String(formValues.bio || ""));

    const languages = parseLanguages(formValues.languages);
    languages.forEach((lang) => {
      fd.append("languages", String(lang));
    });

    const socialLinksObj = safeParseJson(formValues.social_links);
    if (socialLinksObj && typeof socialLinksObj === "object") {
      fd.append("social_links", JSON.stringify(socialLinksObj));
      Object.entries(socialLinksObj)
        .filter(([k, v]) => k && v != null && String(v).trim() !== "")
        .forEach(([k, v]) => {
          fd.append(`social_links.${k}`, String(v));
          fd.append(`social_links[${k}]`, String(v));
        });
    }

    if (formValues.price_per_min_chat !== "") {
      fd.append("price_per_min_chat", String(formValues.price_per_min_chat));
    }
    if (formValues.price_per_min_audio !== "") {
      fd.append("price_per_min_audio", String(formValues.price_per_min_audio));
    }
    if (formValues.price_per_min_video !== "") {
      fd.append("price_per_min_video", String(formValues.price_per_min_video));
    }

    if (formValues.status !== "") {
      fd.append("status", String(formValues.status));
    }

    if (formValues.image && formValues.image instanceof File) {
      fd.append("image", formValues.image);
    }

    if (formValues.verification_video && formValues.verification_video instanceof File) {
      fd.append("verification_video", formValues.verification_video);
    }

    return fd;
  };

  const handleSubmit = async (formValues) => {
    try {
      const influencerId = String(formValues.influencer_id || "").trim();

      const hasFileUpload =
        (formValues.image && formValues.image instanceof File) ||
        (formValues.verification_video && formValues.verification_video instanceof File);

      const categoryId = String(formValues.category_id || "").trim();
      const languagesArr = parseLanguages(formValues.languages);
      const socialLinksObj = safeParseJson(formValues.social_links);

      const jsonPayload = {
        influencer_id: influencerId,
        full_name: String(formValues.full_name || "").trim(),
        category_id: categoryId || undefined,
        categories: categoryId ? [Number(categoryId)] : undefined,
        dob: formValues.dob || undefined,
        email: formValues.email ? String(formValues.email).trim() : undefined,
        mobile: formValues.mobile ? String(formValues.mobile).trim() : undefined,
        gender: formValues.gender ? String(formValues.gender).trim() : undefined,
        bio: formValues.bio != null ? String(formValues.bio) : undefined,
        languages: languagesArr,
        social_links: socialLinksObj,
        price_per_min_chat:
          formValues.price_per_min_chat !== "" ? String(formValues.price_per_min_chat) : undefined,
        price_per_min_audio:
          formValues.price_per_min_audio !== "" ? String(formValues.price_per_min_audio) : undefined,
        price_per_min_video:
          formValues.price_per_min_video !== "" ? String(formValues.price_per_min_video) : undefined,
        status: formValues.status !== "" ? String(formValues.status) : undefined,
      };

      // Clean undefined keys (keeps payload neat for backend)
      Object.keys(jsonPayload).forEach((k) => {
        if (jsonPayload[k] === undefined) delete jsonPayload[k];
      });

      if (editData?.id) {
        if (!influencerId) throw new Error("Missing influencer_id");
        if (hasFileUpload) {
          const fd = buildInfluencerFormData(formValues, { isEdit: true });
          await patchData(`/influencers/${influencerId}/`, fd, "Influencer");
        } else {
          await patchData(`/influencers/${influencerId}/`, jsonPayload, "Influencer");
        }
      } else {
        if (!influencerId) throw new Error("influencer_id is required");
        if (hasFileUpload) {
          const fd = buildInfluencerFormData(formValues, { isEdit: false });
          await postData("/influencers/", fd, "Influencer");
        } else {
          await postData("/influencers/", jsonPayload, "Influencer");
        }
      }

      await getServicesData("influencers");
      setOpen(false);
      setEditData(null);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed: " + (error.message || "Unknown error"));
    }
  };

  const fields = [
    { label: "Influencer ID", name: "influencer_id", type: "text", required: true },
    { label: "Full Name", name: "full_name", type: "text", required: true },
    {
      label: "Category",
      name: "category_id",
      type: "select",
      options: categoryOptions,
      required: true,
    },
    { label: "DOB", name: "dob", type: "date" },
    { label: "Email", name: "email", type: "text" },
    { label: "Mobile", name: "mobile", type: "text" },
    { label: "Gender", name: "gender", type: "select", options: ["Male", "Female", "Other"] },
    { label: "Bio", name: "bio", type: "textarea" },
    {
      label: "Languages (comma separated)",
      name: "languages",
      type: "text",
      placeholder: "Hindi, English",
    },
    {
      label: "Social Links (JSON)",
      name: "social_links",
      type: "textarea",
      rows: 6,
      placeholder: '{"instagram": "https://...", "youtube": "https://..."}',
    },
    { label: "Price/Min Chat", name: "price_per_min_chat", type: "text" },
    { label: "Price/Min Audio", name: "price_per_min_audio", type: "text" },
    { label: "Price/Min Video", name: "price_per_min_video", type: "text" },
    { label: "Status", name: "status", type: "text" },
    { label: "Image", name: "image", type: "image" },
    { label: "Verification Video", name: "verification_video", type: "file", accept: "video/*" },
  ];

  const columns = [
    { label: "#", key: "index", type: "text" },
    {
      label: "Image",
      key: "image",
      render: (row) =>
        row.image ? (
          <img
            src={STATIC_URL + row.image}
            alt="influencer"
            className="h-16 w-16 object-cover rounded-full shadow"
          />
        ) : (
          <div className="h-16 w-16 bg-gray-200 border-2 border-dashed rounded-full flex items-center justify-center text-xs text-gray-500">
            No Image
          </div>
        ),
    },
    { label: "Influencer ID", key: "influencer_id", type: "text" },
    { label: "Name", key: "full_name", type: "text" },
    { label: "Mobile", key: "mobile", type: "text" },
    { label: "Gender", key: "gender", type: "text" },
    {
      label: "Languages",
      key: "languages",
      render: (row) => normalizeLanguagesToText(row.languages) || "--",
    },
    {
      label: "Categories",
      key: "categories",
      render: (row) =>
        Array.isArray(row.categories) && row.categories.length
          ? row.categories.map((c) => c?.name).filter(Boolean).join(", ")
          : "--",
    },
    {
      label: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex gap-3">
          <button onClick={() => handleEdit(row)} className="text-indigo-600 hover:text-indigo-900">
            <PencilIcon className="h-5 w-5" />
          </button>
          <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-900">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-10 border-b border-gray-200 bg-gradient-to-b from-purple-50 to-white">
        <h1 className="text-4xl font-extrabold text-purple-700 tracking-tight">Influencers</h1>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-6 lg:px-8">
        <input
          type="text"
          placeholder="Search by influencer id, name, mobile or email..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Influencer
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <DataTable columns={columns} data={current} />
      </div>

      {pageCount > 1 && (
        <div className="px-4 sm:px-6 lg:px-8">
          <Pagination page={page} setPage={setPage} pageCount={pageCount} />
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditData(null);
        }}
        title={editData?.id ? "Edit Influencer" : "Add New Influencer"}
      >
        <Form
          fields={fields}
          initialData={editData || { social_links: "{}" }}
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
