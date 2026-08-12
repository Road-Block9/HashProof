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
  const [versionNumber, setVersionNumber] = useState("");
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
      const payload = { reason, revokedBy };
      if (versionNumber.trim()) {
        payload.versionNumber = Number(versionNumber.trim());
      }
      const response = await revokeDocument(docId.trim(), payload);
      setRevocation(response.data?.revocation);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
      <section className="app-card">
        <h1 className="page-title text-rose-500">Revoke Document</h1>
        <p className="muted-text mt-3">
          Revoke an individual version of a document. Leave the version number blank to automatically revoke the latest active version.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <FormField label="docId" labelClassName="text-rose-500">
            <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
          </FormField>
          <FormField label="Version Number (Optional)" labelClassName="text-rose-500">
            <input className="app-input" type="number" min="1" value={versionNumber} onChange={(event) => setVersionNumber(event.target.value)} placeholder="e.g. 1" />
          </FormField>
          <FormField label="Reason" labelClassName="text-rose-500">
            <textarea className="app-input min-h-32 resize-y" value={reason} onChange={(event) => setReason(event.target.value)} required />
          </FormField>
          <FormField label="Revoked By" labelClassName="text-rose-500">
            <input className="app-input" value={revokedBy} onChange={(event) => setRevokedBy(event.target.value)} placeholder="Admin Office" required />
          </FormField>
          <LoadingButton loading={loading} type="submit" className="mt-4">Revoke Document</LoadingButton>
        </form>
      </section>

      <aside className="space-y-6">
        <StatusMessage type="warning" message="Revoking a version will not block future version uploads. The document remains active if it has other valid versions." />
        {message && <StatusMessage type={message.type} message={message.text} />}
        {revocation && (
          <div className="rounded-3xl border border-rose-500 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-rose-600">Revocation Details</h2>
            <dl className="mt-6 grid gap-4 text-sm text-gray-800">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 font-bold">Version Revoked</dt>
                <dd className="font-bold text-rose-600 text-lg">v{revocation.versionNumber || "Global"}</dd>
              </div>
              <div>
                <dt className="text-gray-500 font-bold mb-1">Reason</dt>
                <dd className="font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-200">{revocation.reason}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 font-bold">Revoked By</dt>
                <dd className="font-bold text-gray-900">{revocation.revokedBy}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 font-bold">Revoked At</dt>
                <dd className="font-bold text-gray-900">{new Date(revocation.revokedAt).toLocaleString()}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <dt className="text-gray-500 font-bold">Blockchain Status</dt>
                <dd><BlockchainBadge status={revocation.blockchainStatus} /></dd>
              </div>
              {revocation.blockchainTxHash && (
                <div className="grid gap-3 border-t border-gray-200 pt-5 mt-2">
                  <dt className="text-gray-500 font-bold">Transaction Hash</dt>
                  <dd className="flex flex-wrap items-center gap-3">
                    <code className="break-all rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs text-indigo-600">{shortValue(revocation.blockchainTxHash)}</code>
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
