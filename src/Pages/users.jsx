// src/pages/Users.jsx
import DataTable from "../Components/DataTable.jsx";
import Pagination from "../Components/Pagination.jsx";
import Form from "../Components/Form.jsx";
import Modal from "../Components/Modal.jsx";
import { EyeIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../Central_Store/app_context.jsx";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Users() {
  const { fetchedData, deleteData, postData, patchData, getServicesData } = useAppContext();

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    setUsers(fetchedData.users || []);
  }, [fetchedData.users]);

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobile?.toLowerCase().includes(q)
    );
  }, [users, query]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await deleteData(`/register/${id}/`);
    await getServicesData();
  };

  const handleAdd = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditData({
      id: row.id,
      full_name: row.full_name || "",
      email: row.email || "",
      mobile: row.mobile || "",
      gender: row.gender || "",
      interests: row.interests || "",
      referral_code: row.referral_code || "",
      is_active: row.is_active ? "Active" : "Inactive",
      is_staff: row.is_staff ? "Yes" : "No",
    });
    setOpen(true);
  };

  const handleSubmit = async (formValues) => {
    const payload = {
      full_name: (formValues.full_name || "").trim(),
      email: (formValues.email || "").trim(),
      mobile: (formValues.mobile || "").trim(),
      gender: formValues.gender || "",
      interests: formValues.interests || "",
      referral_code: (formValues.referral_code || "").trim(),
      is_active: formValues.is_active === "Active",
      is_staff: formValues.is_staff === "Yes",
    };

    try {
      if (editData?.id) {
        await patchData(`/register/${editData.id}/`, payload, "User");
      } else {
        await postData("/register/", payload, "User");
      }

      await getServicesData();
      setOpen(false);
      setEditData(null);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed: " + (error.message || "Unknown error"));
    }
  };

  const fields = [
    { label: "Full Name", name: "full_name", type: "text", required: true },
    { label: "Email", name: "email", type: "text", required: true },
    { label: "Mobile", name: "mobile", type: "text", required: true },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      options: ["M", "F", "O"],
      required: false,
    },
    { label: "Interests", name: "interests", type: "text" },
    { label: "Referral Code", name: "referral_code", type: "text" },
    {
      label: "Active Status",
      name: "is_active",
      type: "select",
      options: ["Active", "Inactive"],
      required: true,
    },
    {
      label: "Staff",
      name: "is_staff",
      type: "select",
      options: ["Yes", "No"],
      required: true,
    },
  ];

  const columns = [
    { label: "Name", key: "full_name", type: "text" },
    { label: "Email", key: "email", type: "text" },
    { label: "Mobile", key: "mobile", type: "text" },
    { label: "Gender", key: "gender", type: "text" },
    { label: "Interests", key: "interests", type: "text" },
    { label: "Referral Code", key: "referral_code", type: "text" },
    {
      label: "Active",
      key: "is_active",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      label: "Staff",
      key: "is_staff",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.is_staff ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"
          }`}
        >
          {row.is_staff ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center py-10 border-b border-gray-200 bg-gradient-to-b from-purple-50 to-white">
        <h1 className="text-4xl font-extrabold text-purple-700 tracking-tight">
          Users Management
        </h1>
      </div>

      {/* Search + Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 sm:px-6 lg:px-8">
        <input
          type="text"
          placeholder="Search by name, email or mobile..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="w-full sm:max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
        <button
          onClick={handleAdd}
        >
        
        
        </button>
      </div>

      {/* Table */}
      <div className="px-4 sm:px-6 lg:px-8">
        <DataTable
          columns={columns}
          data={current}
          actions={(row) => (
            <div className="flex gap-3">
              <Link to={`/dashboard/user-detail/${row.id}`}>
                <EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition" />
              </Link>
              <TrashIcon
                className="h-5 w-5 text-red-600 hover:text-red-800 cursor-pointer transition"
                onClick={() => handleDelete(row.id)}
              />
            </div>
          )}
        />
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="px-4 sm:px-6 lg:px-8">
          <Pagination currentPage={page} totalPages={pageCount} onPageChange={setPage} />
        </div>
      )}

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditData(null);
        }}
        title={editData ? "Edit User" : "Add New User"}
      >
        <Form
          fields={fields}
          initialData={editData || {}}
          onSubmit={handleSubmit}
          submitLabel={editData ? "Update User" : "Create User"}
          onCancel={() => {
            setOpen(false);
            setEditData(null);
          }}
        />
      </Modal>
    </div>
  );
}
