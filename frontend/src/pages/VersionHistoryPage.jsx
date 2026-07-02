import { useState } from "react";
import { getVersionHistory } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import StorageBadge from "../components/StorageBadge.jsx";

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
    <div className="space-y-6">
      <section className="app-card">
        <h1 className="page-title">Version History</h1>
        <p className="muted-text mt-2">Enter a docId to view all uploaded versions in order.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <FormField label="docId">
              <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
            </FormField>
          </div>
          <LoadingButton loading={loading} type="submit">Fetch History</LoadingButton>
        </form>
      </section>

      {message && <StatusMessage type={message.type} message={message.text} />}

      {document && (
        <section className="app-card">
          <h2 className="text-lg font-bold text-slate-950">{document.title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Current version: <span className="font-semibold">{document.currentVersion}</span> | Status:{" "}
            <span className="font-semibold">{document.status}</span>
          </p>
        </section>
      )}

      {versions.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-white/15 bg-white/95 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-gradient-to-r from-indigo-950 to-cyan-800 text-left text-xs font-semibold uppercase tracking-wide text-cyan-50">
                <tr>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Hash</th>
                  <th className="px-4 py-3">Tx Hash</th>
                  <th className="px-4 py-3">Storage</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3">Blockchain Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {versions.map((version) => (
                  <tr key={version._id} className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-950">{version.versionNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{version.fileName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded bg-slate-100 px-2 py-1 text-xs">{shortHash(version.hash)}</code>
                        <CopyButton value={version.hash} label="Copy" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {version.blockchainTxHash ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="rounded bg-cyan-50 px-2 py-1 text-xs text-cyan-900">{shortValue(version.blockchainTxHash)}</code>
                          <CopyButton value={version.blockchainTxHash} label="Copy tx" />
                        </div>
                      ) : (
                        <span className="text-slate-500">Not available</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="grid gap-1">
                        <StorageBadge provider={version.storageProvider} />
                        {version.storageProvider && (
                          <span className="text-xs font-semibold text-slate-500">{version.storageProvider}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(version.createdAt)}</td>
                    <td className="px-4 py-3">
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
