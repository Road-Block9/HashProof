import { useState } from "react";
import { uploadDocument } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import StorageBadge from "../components/StorageBadge.jsx";
import LifecycleBadge from "../components/LifecycleBadge.jsx";

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
    ownerEmail: "",
    documentType: "Other"
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
      if (error.validationErrors) {
        setMessage({ type: "error", text: "Validation Failed", errors: error.validationErrors });
      } else {
        setMessage({ type: "error", text: error.message });
      }
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
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Owner Email">
              <input className="app-input" type="email" name="ownerEmail" value={form.ownerEmail} onChange={updateField} required />
            </FormField>
            <FormField label="Document Type">
              <select className="app-input bg-white" name="documentType" value={form.documentType} onChange={updateField} required>
                <option value="Certificate">Certificate</option>
                <option value="Transcript">Transcript</option>
                <option value="Contract">Contract</option>
                <option value="ID">ID</option>
                <option value="Report">Report</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
          </div>
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
        {message && (
          <div className="grid gap-2">
            <StatusMessage type={message.type} message={message.text} />
            {message.errors && message.errors.length > 0 && (
              <ul className="list-disc pl-5 text-sm text-rose-600 font-bold bg-rose-50 border border-rose-200 p-4 rounded-xl">
                {message.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {docId && (
          <div className="rounded-3xl border border-emerald-500 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-emerald-600">Generated docId</h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
              <code className="break-all text-sm font-bold text-emerald-700">{docId}</code>
              <CopyButton value={docId} />
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              Copy this docId. It is required for verification, version upload, revocation, and details lookup.
            </p>
            <dl className="mt-5 grid gap-4 border-t border-gray-200 pt-5 text-sm text-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <dt className="text-gray-500 font-bold">Blockchain Status</dt>
                <dd><BlockchainBadge status={version?.blockchainStatus} /></dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <dt className="text-gray-500 font-bold">Lifecycle State</dt>
                <dd><LifecycleBadge state={version?.lifecycleState} /></dd>
              </div>
              <div className="grid gap-3">
                <dt className="text-gray-500 font-bold">Cloud Storage</dt>
                <dd className="flex flex-wrap items-center gap-3">
                  <StorageBadge provider={storageProvider} />
                  {storageProvider && (
                    <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600">
                      {storageProvider}
                    </span>
                  )}
                  {cloudFileUrl && (
                    <a
                      href={cloudFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100 hover:shadow-md"
                    >
                      Open Cloud File
                    </a>
                  )}
                </dd>
              </div>
              {version?.blockchainTxHash && (
                <div className="grid gap-3">
                  <dt className="text-gray-500 font-bold">Transaction Hash</dt>
                  <dd className="flex flex-wrap items-center gap-3">
                    <code className="break-all rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs text-indigo-600">{shortValue(version.blockchainTxHash)}</code>
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
