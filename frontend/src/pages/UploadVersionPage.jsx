import { useState } from "react";
import { uploadNewVersion } from "../api/documentApi.js";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import CopyButton from "../components/CopyButton.jsx";
import StorageBadge from "../components/StorageBadge.jsx";
import LifecycleBadge from "../components/LifecycleBadge.jsx";

const shortValue = (value) => (value ? `${value.slice(0, 12)}...${value.slice(-8)}` : "Not available");
const getStorageProvider = (version, storage) => version?.storageProvider || storage?.storageProvider || storage?.provider || null;
const getCloudFileUrl = (version, storage) => {
  const url = storage?.secureUrl || version?.filePath || storage?.filePath;
  return url?.startsWith("https://res.cloudinary.com/") ? url : null;
};

const UploadVersionPage = () => {
  const [docId, setDocId] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setResult(null);

    const payload = new FormData();
    payload.append("file", file);

    try {
      const response = await uploadNewVersion(docId.trim(), payload);
      setResult(response.data);
      setMessage({ type: "success", text: response.message });
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

  const version = result?.version;
  const storage = result?.storage;
  const storageProvider = getStorageProvider(version, storage);
  const cloudFileUrl = getCloudFileUrl(version, storage);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
      <section className="app-card">
        <h1 className="page-title">Upload New Version</h1>
        <p className="muted-text mt-3">
          Add a new PDF version for an active document. Revoked documents and duplicate latest files are rejected.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <FormField label="docId">
            <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
          </FormField>
          <FormField label="New PDF File">
            <div className="relative">
              <input className="app-input file:mr-4 file:rounded-xl file:border-0 file:bg-cryptoBlack file:px-4 file:py-2 file:text-sm file:font-bold file:text-white file:shadow-md hover:file:bg-cryptoYellow hover:file:text-cryptoBlack transition-colors" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0])} required />
            </div>
          </FormField>
          <LoadingButton loading={loading} type="submit" className="mt-4">Upload Version</LoadingButton>
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
        {version && (
          <div className="rounded-3xl border border-emerald-500 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-emerald-600">New Version Created</h2>
            <dl className="mt-6 grid gap-4 text-sm text-gray-800">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 font-bold">Version Number</dt>
                <dd className="font-bold text-gray-900 text-lg">{version.versionNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 font-bold">Blockchain Status</dt>
                <dd>
                  <BlockchainBadge status={version.blockchainStatus} />
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500 font-bold">Lifecycle State</dt>
                <dd>
                  <LifecycleBadge state={version.lifecycleState} />
                </dd>
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
              {version.blockchainTxHash && (
                <div className="grid gap-3 border-t border-gray-200 pt-5">
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

export default UploadVersionPage;
