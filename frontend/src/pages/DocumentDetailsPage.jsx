import { useState } from "react";
import { getDocumentDetails } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
};

const shortValue = (value) => (value ? `${value.slice(0, 12)}...${value.slice(-8)}` : "Not available");

const DetailRow = ({ label, value, copy }) => (
  <div className="grid gap-1 border-b border-slate-100 py-3 md:grid-cols-[180px_1fr] md:items-center">
    <dt className="text-sm font-medium text-slate-500">{label}</dt>
    <dd className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-950">
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
  const [latestVersion, setLatestVersion] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setDocument(null);
    setLatestVersion(null);

    try {
      const response = await getDocumentDetails(docId.trim());
      setDocument(response.data?.document);
      setLatestVersion(response.data?.latestVersion);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="app-card">
        <h1 className="page-title">Document Details</h1>
        <p className="muted-text mt-2">Enter a docId to view the stored document metadata.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <FormField label="docId">
              <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
            </FormField>
          </div>
          <LoadingButton loading={loading} type="submit">Fetch Details</LoadingButton>
        </form>
      </section>

      {message && <StatusMessage type={message.type} message={message.text} />}

      {document && (
        <section className="app-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-950">{document.title}</h2>
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
          {latestVersion && (
            <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-900">Latest Blockchain Proof</h3>
              <dl className="mt-3 grid gap-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <dt className="text-slate-600">Blockchain Status</dt>
                  <dd><BlockchainBadge status={latestVersion.blockchainStatus} /></dd>
                </div>
                {latestVersion.blockchainTxHash && (
                  <div className="grid gap-2">
                    <dt className="text-slate-600">Transaction Hash</dt>
                    <dd className="flex flex-wrap items-center gap-2">
                      <code className="break-all rounded bg-white px-2 py-1 text-xs text-cyan-900">{shortValue(latestVersion.blockchainTxHash)}</code>
                      <CopyButton value={latestVersion.blockchainTxHash} label="Copy tx" />
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default DocumentDetailsPage;
