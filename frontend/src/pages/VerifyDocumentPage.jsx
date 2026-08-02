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
    if (status === "VALID_LATEST_VERSION") return "border-emerald-500 bg-spaceCard text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
    if (status === "VALID_OLD_VERSION") return "border-amber-500 bg-spaceCard text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
    if (status === "REVOKED") return "border-rose-500 bg-spaceCard text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
    if (status === "RECORD_FOUND") return "border-electricBlue bg-spaceCard text-electricBlue shadow-[0_0_15px_rgba(0,240,255,0.15)]";
    if (status === "RECORD_FOUND_REVOKED") return "border-rose-500 bg-spaceCard text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
    if (status === "NOT_REGISTERED") return "border-slate-500 bg-spaceCard text-slate-400 shadow-neo-card";
    return "border-slate-500 bg-spaceCard text-slate-400 shadow-neo-card";
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
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <section className="app-card">
        <h1 className="page-title">Verify Document</h1>
        <p className="muted-text mt-3">
          Verify with a docId, a PDF file, or both. Full file integrity checking happens when a PDF is uploaded.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <FormField label="docId">
            <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." />
          </FormField>
          <FormField label="PDF File">
            <div className="relative">
              <input className="app-input file:mr-4 file:rounded-xl file:border-0 file:bg-cryptoBlack file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:shadow-md hover:file:bg-cryptoYellow hover:file:text-cryptoBlack transition-colors" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0] || null)} />
            </div>
          </FormField>
          <LoadingButton loading={loading} type="submit" className="mt-4">Verify Document</LoadingButton>
        </form>
      </section>

      <aside className="space-y-6">
        {message && <StatusMessage type={message.type} message={message.text} />}
        {result && (
          <div className={`rounded-3xl border p-6 shadow-xl ${cardStyle}`}>
            <p className="text-sm font-bold uppercase tracking-wide opacity-80">Verification Status</p>
            <h2 className="mt-2 text-2xl font-black">{statusLabels[result.status] || "Invalid"}</h2>
            <dl className="mt-6 grid gap-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="opacity-80">docId</dt>
                <dd className="font-bold">{result.document?.docId || result.matchedDocId || "Not available"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="opacity-80">Matched Version</dt>
                <dd className="font-bold">{result.matchedVersion?.versionNumber || result.latestVersion?.versionNumber || "None"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="opacity-80">Document Status</dt>
                <dd className="font-bold">{result.document?.status || (result.status === "REVOKED" ? "REVOKED" : "Not available")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="opacity-80">Integrity Checked</dt>
                <dd className="font-bold">{result.integrityChecked ? "Yes" : "No"}</dd>
              </div>
              {result.note && (
                <div className="rounded-xl bg-spaceBlack/50 p-4 text-xs font-bold leading-5 shadow-neo-in border border-white/5">
                  {result.note}
                </div>
              )}
              {result.versions && (
                <div className="flex justify-between gap-4">
                  <dt className="opacity-80">Total Versions</dt>
                  <dd className="font-bold">{result.versions.length}</dd>
                </div>
              )}
              {result.revocation?.reason && (
                <div className="grid gap-2">
                  <dt className="opacity-80">Revocation Reason</dt>
                  <dd className="font-bold">{result.revocation.reason}</dd>
                </div>
              )}
              <div className="grid gap-2">
                <dt className="opacity-80">Hash</dt>
                <dd className="flex flex-wrap items-center gap-3">
                  <code className="break-all rounded-lg bg-spaceBlack px-3 py-1.5 text-xs shadow-neo-in">{shortHash(hash)}</code>
                  {hash && <CopyButton value={hash} label="Copy hash" />}
                </dd>
              </div>
              {result.blockchainVerification && (
                <div className="grid gap-3 border-t border-white/10 pt-4">
                  <dt className="opacity-80">Blockchain Verification</dt>
                  <dd className="grid gap-3">
                    <div>
                      <BlockchainBadge status={result.blockchainVerification.status} />
                    </div>
                    {result.blockchainVerification.data && (
                      <span className="text-xs leading-6 opacity-90 block bg-spaceBlack/50 p-3 rounded-lg shadow-neo-in">
                        Hash exists: <strong>{result.blockchainVerification.data.hashExists ? "Yes" : "No"}</strong>
                        <br/>Matched version: <strong>{result.blockchainVerification.data.matchedVersionNumber || "None"}</strong>
                        <br/>Revoked: <strong>{result.blockchainVerification.data.isRevoked ? "Yes" : "No"}</strong>
                      </span>
                    )}
                    {result.blockchainVerification.message && (
                      <span className="text-xs leading-5 block opacity-80">{result.blockchainVerification.message}</span>
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
