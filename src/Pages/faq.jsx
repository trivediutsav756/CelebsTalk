import PageHeader from "../Components/PageHeader.jsx";
import DataTable from "../Components/DataTable.jsx";
import Pagination from "../Components/Pagination.jsx";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAppContext } from "../Central_Store/app_context.jsx";
import { useEffect, useMemo, useState } from "react";
import Form from "../Components/Form.jsx";
import Modal from "../Components/Modal.jsx";

export default function FaqPage() {
  const { fetchedData, deleteData, postData, patchData, getServicesData } = useAppContext();
  const [faqs, setFaqs] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    setFaqs(Array.isArray(fetchedData.faqs) ? fetchedData.faqs : []);
  }, [fetchedData.faqs]);

  const filtered = useMemo(() => {
    if (!query) return faqs;
    const q = query.toLowerCase();
    return faqs.filter(
      (r) =>
        r.question?.toLowerCase().includes(q) ||
        r.answer?.toLowerCase().includes(q)
    );
  }, [query, faqs]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id) => {
    await deleteData(`/faqs/${id}/`);
    await getServicesData();
  };

  const handleAdd = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditData({
      id: row.id,
      question: row.question || "",
      answer: row.answer || "",
      order: row.order || "",
      status: row.status ? "Active" : "Inactive",
    });

    setOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = {
      question: (values.question || "").trim(),
      answer: (values.answer || "").trim(),
      order: values.order ?? "",
      status: values.status === "Active",
    };

    try {
      if (editData?.id) {
        await patchData(`/faqs/${editData.id}/`, payload, "FAQ");
      } else {
        await postData("/faqs/", payload, "FAQ");
      }

      await getServicesData();
      setOpen(false);
      setEditData(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save FAQ");
    }
  };

  const fields = [
    { label: "Question", name: "question", type: "text", placeholder: "Enter question", required: true },
    { label: "Answer", name: "answer", type: "textarea", placeholder: "Enter answer", required: true },
    { label: "Order", name: "order", type: "text", placeholder: "Display order" },
    { label: "Status", name: "status", type: "select", options: ["Active", "Inactive"], required: true },
  ];

  return (
    <div className="space-y-4">

      <PageHeader
        title="FAQs"
        breadcrumb={["FAQs"]}
        query={query}
        setQuery={(v) => {
          setPage(1);
          setQuery(v);
        }}
        buttonLabel="Add FAQ"
        onButtonClick={handleAdd}
      />

      <DataTable
        columns={[
          { label: "Question", key: "question", type: "text" },
          { label: "Answer", key: "answer", type: "text" },
          { label: "Order", key: "order", type: "text" },
          {
            label: "Status",
            key: "status",
            render: (row) => (
              <span
                className={`px-2 py-1 text-xs rounded ${
                  row.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {row.status ? "Active" : "Inactive"}
              </span>
            ),
          },
        ]}
        data={current}
        actions={(r) => (
          <>
            <PencilIcon
              className="h-5 w-5 text-gray-600 cursor-pointer"
              onClick={() => handleEdit(r)}
            />
            <TrashIcon
              className="h-5 w-5 text-red-600 cursor-pointer"
              onClick={() => handleDelete(r.id)}
            />
          </>
        )}
      />

      {/* Add / Edit FAQ Popup */}
      <Modal open={open} onClose={() => { setOpen(false); setEditData(null); }} title={editData ? "Edit FAQ" : "Add FAQ"}>
        <Form
          fields={fields}
          initialData={editData || {}}
          submitLabel={editData ? "Update" : "Submit"}
          onSubmit={handleSubmit}
          onCancel={() => { setOpen(false); setEditData(null); }}
        />
      </Modal>

      <Pagination page={page} setPage={setPage} pageCount={pageCount} />
    </div>
  );
}
