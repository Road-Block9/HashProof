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
  <div className="grid gap-2 border-b border-white/5 py-4 md:grid-cols-[180px_1fr] md:items-center">
    <dt className="text-sm font-bold text-slate-400">{label}</dt>
    <dd className="flex flex-wrap items-center gap-3 text-sm font-bold text-white">
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
    <div className="space-y-8">
      <section className="app-card">
        <h1 className="page-title">Document Details</h1>
        <p className="muted-text mt-3">Enter a docId to view the stored document metadata.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5 md:flex-row md:items-end">
          <div className="flex-1">
            <FormField label="docId">
              <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
            </FormField>
          </div>
          <LoadingButton loading={loading} type="submit" className="mb-1">Fetch Details</LoadingButton>
        </form>
      </section>

      {message && <StatusMessage type={message.type} message={message.text} />}

      {document && (
        <section className="app-card shadow-neo-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-white">{document.title}</h2>
            <span className={`rounded-full px-4 py-1.5 text-xs font-black tracking-wide border ${document.status === "ACTIVE" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]"}`}>
              {document.status}
            </span>
          </div>
          <dl className="mt-6">
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
            <div className="mt-8 rounded-3xl border border-electricBlue/20 bg-spaceBlack p-6 shadow-neo-in">
              <h3 className="text-sm font-black uppercase tracking-widest text-electricBlue">Latest Blockchain Proof</h3>
              <dl className="mt-5 grid gap-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <dt className="text-slate-400 font-bold">Blockchain Status</dt>
                  <dd><BlockchainBadge status={latestVersion.blockchainStatus} /></dd>
                </div>
                {latestVersion.blockchainTxHash && (
                  <div className="grid gap-3">
                    <dt className="text-slate-400 font-bold">Transaction Hash</dt>
                    <dd className="flex flex-wrap items-center gap-3">
                      <code className="break-all rounded-lg bg-spaceCard border border-white/5 px-3 py-1.5 text-xs text-white shadow-neo-out">{shortValue(latestVersion.blockchainTxHash)}</code>
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
