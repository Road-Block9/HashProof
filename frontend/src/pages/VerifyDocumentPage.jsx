import { useMemo, useState } from "react";
import { verifyDocument } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";

const shortHash = (hash) => (hash ? `${hash.slice(0, 16)}...${hash.slice(-10)}` : "Not available");

const statusLabels = {
  VALID_LATEST_VERSION: "Valid Latest Version",
  VALID_OLD_VERSION: "Valid Old Version",
  REVOKED: "Revoked",
  INVALID_DOCUMENT_ID: "Invalid Document ID",
  DOCUMENT_ID_NOT_FOUND: "Document ID Not Found",
  TAMPERED_OR_UNKNOWN: "Tampered or Unknown",
  NOT_REGISTERED: "Not Registered",
  RECORD_FOUND: "Record Found",
  RECORD_FOUND_REVOKED: "Record Found - Revoked"
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
    if (status === "RECORD_FOUND") return "border-cyan-300 bg-cyan-50 text-cyan-900";
    if (status === "RECORD_FOUND_REVOKED") return "border-rose-300 bg-rose-50 text-rose-900";
    if (status === "NOT_REGISTERED") return "border-slate-300 bg-slate-50 text-slate-900";
    return "border-slate-300 bg-slate-50 text-slate-900";
  }, [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setResult(null);

    if (!docId.trim() && !file) {
      setMessage({ type: "error", text: "Enter a docId, upload a PDF file, or provide both." });
      setLoading(false);
      return;
    }

    const payload = new FormData();

    if (docId.trim()) {
      payload.append("docId", docId.trim());
    }

    if (file) {
      payload.append("file", file);
    }

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
      <section className="app-card">
        <h1 className="page-title">Verify Document</h1>
        <p className="muted-text mt-2">
          Verify with a docId, a PDF file, or both. Full file integrity checking happens when a PDF is uploaded.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="docId">
            <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." />
          </FormField>
          <FormField label="PDF File">
            <input className="app-input" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0] || null)} />
          </FormField>
          <LoadingButton loading={loading} type="submit">Verify Document</LoadingButton>
        </form>
      </section>

      <aside className="space-y-4">
        {message && <StatusMessage type={message.type} message={message.text} />}
        {result && (
          <div className={`rounded-2xl border p-5 shadow-xl ${cardStyle}`}>
            <p className="text-sm font-semibold uppercase tracking-wide">Verification Status</p>
            <h2 className="mt-2 text-2xl font-bold">{statusLabels[result.status] || "Invalid"}</h2>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt>docId</dt>
                <dd className="font-semibold">{result.document?.docId || result.matchedDocId || "Not available"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Matched Version</dt>
                <dd className="font-semibold">{result.matchedVersion?.versionNumber || result.latestVersion?.versionNumber || "None"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Document Status</dt>
                <dd className="font-semibold">{result.document?.status || (result.status === "REVOKED" ? "REVOKED" : "Not available")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Integrity Checked</dt>
                <dd className="font-semibold">{result.integrityChecked ? "Yes" : "No"}</dd>
              </div>
              {result.note && (
                <div className="rounded-xl bg-white/70 p-3 text-xs leading-5">
                  {result.note}
                </div>
              )}
              {result.versions && (
                <div className="flex justify-between gap-4">
                  <dt>Total Versions</dt>
                  <dd className="font-semibold">{result.versions.length}</dd>
                </div>
              )}
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
              {result.blockchainVerification && (
                <div className="grid gap-2 border-t border-current/15 pt-3">
                  <dt>Blockchain Verification</dt>
                  <dd className="grid gap-2">
                    <BlockchainBadge status={result.blockchainVerification.status} />
                    {result.blockchainVerification.data && (
                      <span className="text-xs leading-5">
                        Hash exists: <strong>{result.blockchainVerification.data.hashExists ? "Yes" : "No"}</strong>
                        {" | "}Matched version: <strong>{result.blockchainVerification.data.matchedVersionNumber || "None"}</strong>
                        {" | "}Revoked: <strong>{result.blockchainVerification.data.isRevoked ? "Yes" : "No"}</strong>
                      </span>
                    )}
                    {result.blockchainVerification.message && (
                      <span className="text-xs leading-5">{result.blockchainVerification.message}</span>
                    )}
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

export default VerifyDocumentPage;
