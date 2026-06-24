import { useState } from "react";
import { uploadNewVersion } from "../api/documentApi.js";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import CopyButton from "../components/CopyButton.jsx";

const shortValue = (value) => (value ? `${value.slice(0, 12)}...${value.slice(-8)}` : "Not available");

const UploadVersionPage = () => {
  const [docId, setDocId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [version, setVersion] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setVersion(null);

    const payload = new FormData();
    payload.append("file", file);

    try {
      const response = await uploadNewVersion(docId.trim(), payload);
      setVersion(response.data?.version);
      setMessage({ type: "success", text: response.message });
      setFile(null);
      event.target.reset();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="app-card">
        <h1 className="page-title">Upload New Version</h1>
        <p className="muted-text mt-2">
          Add a new PDF version for an active document. Revoked documents and duplicate latest files are rejected.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="docId">
            <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
          </FormField>
          <FormField label="New PDF File">
            <input className="app-input" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0])} required />
          </FormField>
          <LoadingButton loading={loading} type="submit">Upload Version</LoadingButton>
        </form>
      </section>

      <aside className="space-y-4">
        {message && <StatusMessage type={message.type} message={message.text} />}
        {version && (
          <div className="app-card">
            <h2 className="text-lg font-bold text-slate-950">New Version Created</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Version Number</dt>
                <dd className="font-semibold text-slate-950">{version.versionNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Blockchain Status</dt>
                <dd>
                  <BlockchainBadge status={version.blockchainStatus} />
                </dd>
              </div>
              {version.blockchainTxHash && (
                <div className="grid gap-2">
                  <dt className="text-slate-500">Transaction Hash</dt>
                  <dd className="flex flex-wrap items-center gap-2">
                    <code className="break-all rounded bg-cyan-50 px-2 py-1 text-xs text-cyan-900">{shortValue(version.blockchainTxHash)}</code>
                    <CopyButton value={version.blockchainTxHash} label="Copy tx" />
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

export default UploadVersionPage;
