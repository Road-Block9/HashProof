import { useState } from "react";
import { revokeDocument } from "../api/documentApi.js";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import CopyButton from "../components/CopyButton.jsx";

const shortValue = (value) => (value ? `${value.slice(0, 12)}...${value.slice(-8)}` : "Not available");

const RevokeDocumentPage = () => {
  const [docId, setDocId] = useState("");
  const [reason, setReason] = useState("");
  const [revokedBy, setRevokedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [revocation, setRevocation] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setRevocation(null);

    try {
      const response = await revokeDocument(docId.trim(), { reason, revokedBy });
      setRevocation(response.data?.revocation);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="app-card">
        <h1 className="page-title">Revoke Document</h1>
        <p className="muted-text mt-2">
          Revoke an issued document with a clear reason. Revoked documents cannot receive new versions.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="docId">
            <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
          </FormField>
          <FormField label="Reason">
            <textarea className="app-input min-h-24" value={reason} onChange={(event) => setReason(event.target.value)} required />
          </FormField>
          <FormField label="Revoked By">
            <input className="app-input" value={revokedBy} onChange={(event) => setRevokedBy(event.target.value)} placeholder="Admin Office" required />
          </FormField>
          <LoadingButton loading={loading} type="submit" className="from-rose-600 via-red-600 to-pink-700">Revoke Document</LoadingButton>
        </form>
      </section>

      <aside className="space-y-4">
        <StatusMessage type="warning" message="Once revoked, the backend blocks new version uploads for this document." />
        {message && <StatusMessage type={message.type} message={message.text} />}
        {revocation && (
          <div className="app-card">
            <h2 className="text-lg font-bold text-slate-950">Revocation Details</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Reason</dt>
                <dd className="mt-1 font-semibold text-slate-950">{revocation.reason}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Revoked By</dt>
                <dd className="font-semibold text-slate-950">{revocation.revokedBy}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Revoked At</dt>
                <dd className="font-semibold text-slate-950">{new Date(revocation.revokedAt).toLocaleString()}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <dt className="text-slate-500">Blockchain Status</dt>
                <dd><BlockchainBadge status={revocation.blockchainStatus} /></dd>
              </div>
              {revocation.blockchainTxHash && (
                <div className="grid gap-2">
                  <dt className="text-slate-500">Transaction Hash</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <code className="break-all rounded bg-cyan-50 px-2 py-1 text-xs text-cyan-900">{shortValue(revocation.blockchainTxHash)}</code>
                    <CopyButton value={revocation.blockchainTxHash} label="Copy tx" />
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </aside>
    </div>
  );
};

export default RevokeDocumentPage;
