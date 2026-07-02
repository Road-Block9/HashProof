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
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="app-card">
        <h1 className="page-title">Upload Document</h1>
        <p className="muted-text mt-2">
          Upload the first PDF version. The backend will generate a public docId and SHA-256 hash.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="Title">
            <input className="app-input" name="title" value={form.title} onChange={updateField} required />
          </FormField>
          <FormField label="Description">
            <textarea className="app-input min-h-24" name="description" value={form.description} onChange={updateField} />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
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
            <input className="app-input" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0])} required />
          </FormField>
          <LoadingButton loading={loading} type="submit">Upload Document</LoadingButton>
        </form>
      </section>

      <aside className="space-y-4">
        {message && <StatusMessage type={message.type} message={message.text} />}
        {docId && (
          <div className="app-card border-emerald-200">
            <h2 className="text-lg font-bold text-slate-950">Generated docId</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 p-3">
              <code className="break-all text-sm font-semibold text-brand">{docId}</code>
              <CopyButton value={docId} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Copy this docId. It is required for verification, version upload, revocation, and details lookup.
            </p>
            <dl className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <dt className="text-slate-500">Blockchain Status</dt>
                <dd><BlockchainBadge status={version?.blockchainStatus} /></dd>
              </div>
              <div className="grid gap-2">
                <dt className="text-slate-500">Cloud Storage</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <StorageBadge provider={storageProvider} />
                  {storageProvider && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {storageProvider}
                    </span>
                  )}
                  {cloudFileUrl && (
                    <a
                      href={cloudFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800 transition hover:bg-cyan-100"
                    >
                      Open Cloud File
                    </a>
                  )}
                </dd>
              </div>
              {version?.blockchainTxHash && (
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

export default UploadDocumentPage;
