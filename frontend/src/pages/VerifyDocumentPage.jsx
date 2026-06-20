import { useMemo, useState } from "react";
import { verifyDocument } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

const shortHash = (hash) => (hash ? `${hash.slice(0, 16)}...${hash.slice(-10)}` : "Not available");

const statusLabels = {
  VALID_LATEST_VERSION: "Valid Latest Version",
  VALID_OLD_VERSION: "Valid Old Version",
  REVOKED: "Revoked",
  INVALID_DOCUMENT_ID: "Invalid Document ID",
  TAMPERED_OR_UNKNOWN: "Tampered or Unknown"
};

const VerifyDocumentPage = () => {
  const [docId, setDocId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);

  const cardStyle = useMemo(() => {
    const status = result?.status;
    if (status === "VALID_LATEST_VERSION") return "border-emerald-300 bg-emerald-50 text-emerald-900";
    if (status === "VALID_OLD_VERSION") return "border-amber-300 bg-amber-50 text-amber-900";
    if (status === "REVOKED") return "border-rose-300 bg-rose-50 text-rose-900";
    return "border-slate-300 bg-slate-50 text-slate-900";
  }, [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setResult(null);

    const payload = new FormData();
    payload.append("docId", docId.trim());
    payload.append("file", file);

    try {
      const response = await verifyDocument(payload);
      setResult(response.data);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const hash = result?.uploadedHash || result?.matchedVersion?.hash;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Verify Document</h1>
        <p className="mt-2 text-sm text-slate-600">
          Upload a PDF with its docId. The backend hashes the PDF and compares it with stored versions.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="docId">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
          </FormField>
          <FormField label="PDF File">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0])} required />
          </FormField>
          <LoadingButton loading={loading} type="submit">Verify Document</LoadingButton>
        </form>
      </section>

      <aside className="space-y-4">
        {message && <StatusMessage type={message.type} message={message.text} />}
        {result && (
          <div className={`rounded-lg border p-5 shadow-sm ${cardStyle}`}>
            <p className="text-sm font-semibold uppercase tracking-wide">Verification Status</p>
            <h2 className="mt-2 text-2xl font-bold">{statusLabels[result.status] || "Invalid"}</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt>Matched Version</dt>
                <dd className="font-semibold">{result.matchedVersion?.versionNumber || "None"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Document Status</dt>
                <dd className="font-semibold">{result.document?.status || (result.status === "REVOKED" ? "REVOKED" : "Not available")}</dd>
              </div>
              {result.revocation?.reason && (
                <div className="grid gap-1">
                  <dt>Revocation Reason</dt>
                  <dd className="font-semibold">{result.revocation.reason}</dd>
                </div>
              )}
              <div className="grid gap-2">
                <dt>Hash</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <code className="break-all rounded bg-white/70 px-2 py-1 text-xs">{shortHash(hash)}</code>
                  {hash && <CopyButton value={hash} label="Copy hash" />}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </aside>
    </div>
  );
};

export default VerifyDocumentPage;
