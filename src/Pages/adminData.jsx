// src/pages/AdminData.jsx
import DataTable from "../Components/DataTable.jsx";
import Pagination from "../Components/Pagination.jsx";
import Form from "../Components/Form.jsx";
import Modal from "../Components/Modal.jsx";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../Central_Store/app_context.jsx";
import { useEffect, useMemo, useState } from "react";

export default function AdminData() {
  const { fetchedData, deleteData, postData, patchData, getServicesData } = useAppContext();

  const [admins, setAdmins] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    setAdmins(fetchedData.adminData || []);
  }, [fetchedData.adminData]);

  const filtered = useMemo(() => {
    if (!query) return admins;
    const q = query.toLowerCase();
    return admins.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.mobile?.toLowerCase().includes(q)
    );
  }, [admins, query]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin record?")) return;
    await deleteData(`/admin_data/${id}/`);
    await getServicesData();
  };

  const handleAdd = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditData({
      id: row.id,
      name: row.name || "",
      email: row.email || "",
      mobile: row.mobile || "",
      password: "", // do not prefill password
      status: row.status || "Pending",
    });
    setOpen(true);
  };

  const handleSubmit = async (formValues) => {
    const payload = {
      name: (formValues.name || "").trim(),
      email: (formValues.email || "").trim(),
      mobile: (formValues.mobile || "").trim(),
      status: formValues.status || "Pending",
    };

    // Only send password if user actually entered something
    if (formValues.password && formValues.password.trim()) {
      payload.password = formValues.password.trim();
    }

    try {
      if (editData?.id) {
        await patchData(`/admin_data/${editData.id}/`, payload, "Admin Data");
      } else {
        await postData("/admin_data/", payload, "Admin Data");
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
    { label: "Name", name: "name", type: "text", required: true },
    { label: "Email", name: "email", type: "text", required: true },
    { label: "Mobile", name: "mobile", type: "text", required: true },
    { label: "Password", name: "password", type: "password" }, // changed to password type
    {
      label: "Status",
      name: "status",
      type: "select",
      options: ["New", "Pending", "Approved", "Rejected"], // Fixed: capitalized, matched with render logic
      required: true,
    },
  ];

  const columns = [
    { label: "Name", key: "name", type: "text" },
    { label: "Email", key: "email", type: "text" },
    { label: "Mobile", key: "mobile", type: "text" },
    {
      label: "Status",
      key: "status",
      render: (row) => {
        const status = row.status || "Pending";
        let colorClass = "";

        // Match the status options exactly
        if (status === "Active" || status === "Approved") {
          colorClass = "bg-green-100 text-green-800";
        } else if (status === "Pending") {
          colorClass = "bg-yellow-100 text-yellow-800";
        } else if (status === "Rejected") {
          colorClass = "bg-red-100 text-red-800";
        } else {
          colorClass = "bg-gray-100 text-gray-800";
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-10 border-b border-gray-200 bg-gradient-to-b from-purple-50 to-white">
        <h1 className="text-4xl font-extrabold text-purple-700 tracking-tight">
          Admin Data
        </h1>
      </div>

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
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Admin
        </button>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <DataTable
          columns={columns}
          data={current}
          actions={(row) => (
            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(row)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        />
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
        title={editData ? "Edit Admin" : "Add New Admin"}
      >
        <Form
          fields={fields}
          initialData={editData || {}}
          onSubmit={handleSubmit}
          submitLabel={editData ? "Update Admin" : "Create Admin"}
          onCancel={() => {
            setOpen(false);
            setEditData(null);
          }}
        />
      </Modal>
    </div>
  );
}