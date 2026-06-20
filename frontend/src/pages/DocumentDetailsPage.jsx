import { useState } from "react";
import { getDocumentDetails } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
};

const DetailRow = ({ label, value, copy }) => (
  <div className="grid gap-1 border-b border-slate-100 py-3 md:grid-cols-[180px_1fr] md:items-center">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
      <span className="break-all">{value || "Not available"}</span>
      {copy && value && <CopyButton value={value} />}
    </dd>
  </div>
);

const DocumentDetailsPage = () => {
  const [docId, setDocId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [document, setDocument] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setDocument(null);

    try {
      const response = await getDocumentDetails(docId.trim());
      setDocument(response.data?.document);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Document Details</h1>
        <p className="mt-2 text-sm text-slate-600">Enter a docId to view the stored document metadata.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <FormField label="docId">
              <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
            </FormField>
          </div>
          <LoadingButton loading={loading} type="submit">Fetch Details</LoadingButton>
        </form>
      </section>

      {message && <StatusMessage type={message.type} message={message.text} />}

      {document && (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-ink">{document.title}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${document.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
              {document.status}
            </span>
          </div>
          <dl className="mt-5">
            <DetailRow label="docId" value={document.docId} copy />
            <DetailRow label="Title" value={document.title} />
            <DetailRow label="Description" value={document.description} />
            <DetailRow label="Issuer Name" value={document.issuerName} />
            <DetailRow label="Owner Name" value={document.ownerName} />
            <DetailRow label="Owner Email" value={document.ownerEmail} />
            <DetailRow label="Current Version" value={document.currentVersion} />
            <DetailRow label="Status" value={document.status} />
            <DetailRow label="Created At" value={formatDate(document.createdAt)} />
            <DetailRow label="Updated At" value={formatDate(document.updatedAt)} />
          </dl>
        </section>
      )}
    </div>
  );
};

export default DocumentDetailsPage;
