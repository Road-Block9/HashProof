import { useState } from "react";
import { uploadDocument } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import StorageBadge from "../components/StorageBadge.jsx";

const shortValue = (value) => (value ? `${value.slice(0, 12)}...${value.slice(-8)}` : "Not available");
const getStorageProvider = (version, storage) => version?.storageProvider || storage?.storageProvider || storage?.provider || null;
const getCloudFileUrl = (version, storage) => {
  const url = storage?.secureUrl || version?.filePath || storage?.filePath;
  return url?.startsWith("https://res.cloudinary.com/") ? url : null;
};

const UploadDocumentPage = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    issuerName: "",
    ownerName: "",
    ownerEmail: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setResult(null);

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    payload.append("file", file);

    try {
      const response = await uploadDocument(payload);
      setResult(response.data);
      setMessage({ type: "success", text: response.message });
      setForm({ title: "", description: "", issuerName: "", ownerName: "", ownerEmail: "" });
      setFile(null);
      event.target.reset();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const docId = result?.document?.docId;
  const version = result?.version;
  const storage = result?.storage;
  const storageProvider = getStorageProvider(version, storage);
  const cloudFileUrl = getCloudFileUrl(version, storage);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
      <section className="app-card">
        <h1 className="page-title">Upload Document</h1>
        <p className="muted-text mt-3">
          Upload the first PDF version. The backend will generate a public docId and SHA-256 hash.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <FormField label="Title">
            <input className="app-input" name="title" value={form.title} onChange={updateField} required />
          </FormField>
          <FormField label="Description">
            <textarea className="app-input min-h-32 resize-y" name="description" value={form.description} onChange={updateField} />
          </FormField>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Issuer Name">
              <input className="app-input" name="issuerName" value={form.issuerName} onChange={updateField} required />
            </FormField>
            <FormField label="Owner Name">
              <input className="app-input" name="ownerName" value={form.ownerName} onChange={updateField} required />
            </FormField>
          </div>
          <FormField label="Owner Email">
            <input className="app-input" type="email" name="ownerEmail" value={form.ownerEmail} onChange={updateField} required />
          </FormField>
          <FormField label="PDF File" hint="Only PDF files are accepted by the backend.">
            <div className="relative">
              <input className="app-input file:mr-4 file:rounded-xl file:border-0 file:bg-cryptoBlack file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:shadow-md hover:file:bg-cryptoYellow hover:file:text-cryptoBlack transition-colors" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0])} required />
            </div>
          </FormField>
          <LoadingButton loading={loading} type="submit" className="mt-4">
            Upload Document
          </LoadingButton>
        </form>
      </section>

      <aside className="space-y-6">
        {message && <StatusMessage type={message.type} message={message.text} />}
        {docId && (
          <div className="app-card border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <h2 className="text-xl font-bold text-emerald-400">Generated docId</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-spaceBlack shadow-neo-in p-4 border border-emerald-500/20">
              <code className="break-all text-sm font-bold text-emerald-400">{docId}</code>
              <CopyButton value={docId} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Copy this docId. It is required for verification, version upload, revocation, and details lookup.
            </p>
            <dl className="mt-5 grid gap-4 border-t border-white/10 pt-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <dt className="text-slate-400 font-bold">Blockchain Status</dt>
                <dd><BlockchainBadge status={version?.blockchainStatus} /></dd>
              </div>
              <div className="grid gap-3">
                <dt className="text-slate-400 font-bold">Cloud Storage</dt>
                <dd className="flex flex-wrap items-center gap-3">
                  <StorageBadge provider={storageProvider} />
                  {storageProvider && (
                    <span className="rounded-full bg-spaceBlack border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-300">
                      {storageProvider}
                    </span>
                  )}
                  {cloudFileUrl && (
                    <a
                      href={cloudFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-spaceBlack border border-electricBlue/30 px-3 py-1.5 text-xs font-bold text-electricBlue transition hover:bg-spaceCard hover:shadow-neo-glow-blue"
                    >
                      Open Cloud File
                    </a>
                  )}
                </dd>
              </div>
              {version?.blockchainTxHash && (
                <div className="grid gap-3">
                  <dt className="text-slate-400 font-bold">Transaction Hash</dt>
                  <dd className="flex flex-wrap items-center gap-3">
                    <code className="break-all rounded-lg bg-spaceBlack border border-neonPurple/30 px-3 py-1.5 text-xs text-neonPurple shadow-neo-in">{shortValue(version.blockchainTxHash)}</code>
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

export default UploadDocumentPage;
