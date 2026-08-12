import { useState } from "react";
import { getVersionHistory } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import StorageBadge from "../components/StorageBadge.jsx";
import LifecycleBadge from "../components/LifecycleBadge.jsx";

const shortHash = (hash) => (hash ? `${hash.slice(0, 12)}...${hash.slice(-8)}` : "Not available");
const shortValue = (value) => (value ? `${value.slice(0, 12)}...${value.slice(-8)}` : "Not available");

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
};

const VersionHistoryPage = () => {
  const [docId, setDocId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [versions, setVersions] = useState([]);
  const [document, setDocument] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setVersions([]);
    setDocument(null);

    try {
      const response = await getVersionHistory(docId.trim());
      setVersions(response.data?.versions || []);
      setDocument(response.data?.document || null);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="app-card">
        <h1 className="page-title">Version History</h1>
        <p className="muted-text mt-3">Enter a docId to view all uploaded versions in order.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5 md:flex-row md:items-end">
          <div className="flex-1">
            <FormField label="docId">
              <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
            </FormField>
          </div>
          <LoadingButton loading={loading} type="submit" className="mb-1">Fetch History</LoadingButton>
        </form>
      </section>

      {message && <StatusMessage type={message.type} message={message.text} />}

      {document && (
        <section className="app-card border-neonPurple shadow-[0_0_15px_rgba(176,38,255,0.15)]">
          <h2 className="text-xl font-black text-white">{document.title}</h2>
          <p className="mt-2 text-sm text-slate-400">
            Current version: <span className="font-bold text-electricBlue">{document.currentVersion}</span> | Status:{" "}
            <span className="font-bold text-electricBlue">{document.status}</span>
          </p>
        </section>
      )}

      {versions.length > 0 && (
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-bold uppercase tracking-widest text-indigo-600">
                <tr>
                  <th className="px-5 py-4">Version</th>
                  <th className="px-5 py-4">File Name</th>
                  <th className="px-5 py-4">Hash</th>
                  <th className="px-5 py-4">Tx Hash</th>
                  <th className="px-5 py-4">Storage</th>
                  <th className="px-5 py-4">Upload Date</th>
                  <th className="px-5 py-4">Lifecycle</th>
                  <th className="px-5 py-4">Blockchain Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {versions.map((version) => (
                  <tr key={version._id} className="align-top hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-5 py-4 font-black text-indigo-600">{version.versionNumber}</td>
                    <td className="px-5 py-4 text-gray-800 font-medium">{version.fileName}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <code className="rounded-lg bg-gray-100 border border-gray-200 px-2 py-1 text-xs text-gray-600">{shortHash(version.hash)}</code>
                        <CopyButton value={version.hash} label="Copy" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {version.blockchainTxHash ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <code className="rounded-lg bg-indigo-50 border border-indigo-100 px-2 py-1 text-xs text-indigo-600">{shortValue(version.blockchainTxHash)}</code>
                          <CopyButton value={version.blockchainTxHash} label="Copy tx" />
                        </div>
                      ) : (
                        <span className="text-gray-500 font-bold">Not available</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid gap-2">
                        <StorageBadge provider={version.storageProvider} />
                        {version.storageProvider && (
                          <span className="text-xs font-bold text-gray-500 block pl-1">{version.storageProvider}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{formatDate(version.createdAt)}</td>
                    <td className="px-5 py-4">
                      <LifecycleBadge state={version.lifecycleState} />
                    </td>
                    <td className="px-5 py-4">
                      <BlockchainBadge status={version.blockchainStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default VersionHistoryPage;
