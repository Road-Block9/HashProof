import { useState } from "react";
import { revokeDocument } from "../api/documentApi.js";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

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
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Revoke Document</h1>
        <p className="mt-2 text-sm text-slate-600">
          Revoke an issued document with a clear reason. Revoked documents cannot receive new versions.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="docId">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
          </FormField>
          <FormField label="Reason">
            <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2" value={reason} onChange={(event) => setReason(event.target.value)} required />
          </FormField>
          <FormField label="Revoked By">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={revokedBy} onChange={(event) => setRevokedBy(event.target.value)} placeholder="Admin Office" required />
          </FormField>
          <LoadingButton loading={loading} type="submit" className="bg-rose-700 hover:bg-rose-800">Revoke Document</LoadingButton>
        </form>
      </section>

      <aside className="space-y-4">
        <StatusMessage type="warning" message="Once revoked, the backend blocks new version uploads for this document." />
        {message && <StatusMessage type={message.type} message={message.text} />}
        {revocation && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Revocation Details</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Reason</dt>
                <dd className="mt-1 font-semibold text-ink">{revocation.reason}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Revoked By</dt>
                <dd className="font-semibold text-ink">{revocation.revokedBy}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Revoked At</dt>
                <dd className="font-semibold text-ink">{new Date(revocation.revokedAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        )}
      </aside>
    </div>
  );
};

export default RevokeDocumentPage;
