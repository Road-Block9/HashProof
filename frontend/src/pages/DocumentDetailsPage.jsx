import { useState } from "react";
import { getDocumentDetails, generateSelectiveProof, getAuditLogs } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import LifecycleBadge from "../components/LifecycleBadge.jsx";

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
};

const shortValue = (value) => (value ? `${value.slice(0, 12)}...${value.slice(-8)}` : "Not available");

const DetailRow = ({ label, value, copy }) => (
  <div className="grid gap-2 border-b border-slate-200 py-4 md:grid-cols-[180px_1fr] md:items-center">
    <dt className="text-sm font-bold text-slate-400">{label}</dt>
    <dd className="flex flex-wrap items-center gap-3 text-sm font-bold text-cryptoBlack">
      <span className="break-all">{value || "Not available"}</span>
      {copy && value && <CopyButton value={value} />}
    </dd>
  </div>
);

const DocumentDetailsPage = () => {
  const [docId, setDocId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [document, setDocument] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [latestActiveVersion, setLatestActiveVersion] = useState(null);
  const [globalRevocation, setGlobalRevocation] = useState(null);
  const [versionRevocations, setVersionRevocations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Selective Disclosure State
  const [selectedFields, setSelectedFields] = useState({
    title: false,
    description: false,
    documentType: false,
    issuerName: false,
    ownerName: false,
    ownerEmail: false,
    versionNumber: false
  });
  const [proofLoading, setProofLoading] = useState(false);
  const [generatedProof, setGeneratedProof] = useState(null);

  const handleFieldToggle = (field) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleGenerateProof = async () => {
    const fieldsToDisclose = Object.keys(selectedFields).filter(key => selectedFields[key]);
    if (fieldsToDisclose.length === 0) {
      setMessage({ type: "error", text: "Please select at least one field to disclose." });
      return;
    }
    setProofLoading(true);
    setGeneratedProof(null);
    try {
      const response = await generateSelectiveProof(docId.trim(), { fieldsToDisclose, versionNumber: latestActiveVersion?.versionNumber || document.currentVersion });
      setGeneratedProof(response.data);
      setMessage({ type: "success", text: "Proof generated successfully" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setProofLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setDocument(null);
    setLatestVersion(null);
    setLatestActiveVersion(null);
    setGlobalRevocation(null);
    setVersionRevocations([]);
    setAuditLogs([]);
    setGeneratedProof(null);
    setSelectedFields({
      title: false,
      description: false,
      documentType: false,
      issuerName: false,
      ownerName: false,
      ownerEmail: false,
      versionNumber: false
    });

    try {
      const response = await getDocumentDetails(docId.trim());
      setDocument(response.data?.document);
      setLatestVersion(response.data?.latestVersion);
      setLatestActiveVersion(response.data?.latestActiveVersion);
      setGlobalRevocation(response.data?.globalRevocation);
      setVersionRevocations(response.data?.versionRevocations || []);
      setMessage({ type: "success", text: response.message });

      try {
        const auditResponse = await getAuditLogs(docId.trim());
        setAuditLogs(auditResponse?.logs || []);
      } catch (err) {
        console.error("Failed to fetch audit logs", err);
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="app-card">
        <h1 className="page-title">Document Details</h1>
        <p className="muted-text mt-3">Enter a docId to view the stored document metadata.</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5 md:flex-row md:items-end">
          <div className="flex-1">
            <FormField label="docId">
              <input className="app-input" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
            </FormField>
          </div>
          <LoadingButton loading={loading} type="submit" className="mb-1">Fetch Details</LoadingButton>
        </form>
      </section>

      {message && <StatusMessage type={message.type} message={message.text} />}

      {document && (
        <section className="app-card shadow-neo-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-cryptoBlack">{document.title}</h2>
            <span className={`rounded-full px-4 py-1.5 text-xs font-black tracking-wide border ${latestActiveVersion ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]"}`}>
              {latestActiveVersion ? "ACTIVE" : "REVOKED"}
            </span>
          </div>
          <dl className="mt-6">
            <DetailRow label="docId" value={document.docId} copy />
            <DetailRow label="Title" value={document.title} />
            <DetailRow label="Description" value={document.description} />
            <DetailRow label="Document Type" value={document.documentType} />
            <DetailRow label="Issuer Name" value={document.issuerName} />
            <DetailRow label="Owner Name" value={document.ownerName} />
            <DetailRow label="Owner Email" value={document.ownerEmail} />
            <DetailRow label="Latest Version" value={`v${document.currentVersion}`} />
            <DetailRow label="Latest Active Version" value={latestActiveVersion ? `v${latestActiveVersion.versionNumber}` : "None"} />
            <DetailRow label="Created At" value={formatDate(document.createdAt)} />
            <DetailRow label="Updated At" value={formatDate(document.updatedAt)} />
            
            {globalRevocation && (
              <>
                <DetailRow label="Global Revocation Reason" value={globalRevocation.reason} />
                <DetailRow label="Global Revoked By" value={globalRevocation.revokedBy} />
                <DetailRow label="Global Revoked At" value={formatDate(globalRevocation.revokedAt)} />
              </>
            )}
            
            {versionRevocations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <dt className="text-sm font-bold text-slate-400 mb-2">Version Revocations</dt>
                <dd className="text-sm">
                  <ul className="space-y-3">
                    {versionRevocations.map(rev => (
                      <li key={rev._id} className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                        <strong>v{rev.versionNumber}:</strong> {rev.reason} (by {rev.revokedBy} on {formatDate(rev.revokedAt)})
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
          {latestVersion && (
            <div className="mt-8 rounded-3xl border border-electricBlue/20 bg-spaceBlack p-6 shadow-neo-in">
              <h3 className="text-sm font-black uppercase tracking-widest text-electricBlue">Latest Blockchain Proof</h3>
              <dl className="mt-5 grid gap-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <dt className="text-slate-400 font-bold">Blockchain Status</dt>
                  <dd><BlockchainBadge status={latestVersion.blockchainStatus} /></dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <dt className="text-slate-400 font-bold">Lifecycle State</dt>
                  <dd><LifecycleBadge state={latestVersion.lifecycleState} /></dd>
                </div>
                {latestVersion.blockchainTxHash && (
                  <div className="grid gap-3">
                    <dt className="text-slate-400 font-bold">Transaction Hash</dt>
                    <dd className="flex flex-wrap items-center gap-3">
                      <code className="break-all rounded-lg bg-spaceCard border border-white/5 px-3 py-1.5 text-xs text-white shadow-neo-out">{shortValue(latestVersion.blockchainTxHash)}</code>
                      <CopyButton value={latestVersion.blockchainTxHash} label="Copy tx" />
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {latestVersion && (
            <div className="mt-8 rounded-3xl border border-purple-500/30 bg-purple-50 p-6 shadow-md">
              <h3 className="text-lg font-black text-purple-700">Privacy-Preserving Selective Disclosure</h3>
              <p className="text-sm text-purple-900 mt-2">
                Select the attributes you wish to disclose and generate a cryptographic proof. You can share this JSON proof with a verifier without revealing the entire document.
              </p>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.keys(selectedFields).map(field => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer bg-white border border-purple-200 px-3 py-2 rounded-lg hover:bg-purple-100 transition">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500" 
                      checked={selectedFields[field]} 
                      onChange={() => handleFieldToggle(field)} 
                    />
                    <span className="text-sm font-bold text-gray-700">{field}</span>
                  </label>
                ))}
              </div>
              
              <LoadingButton loading={proofLoading} onClick={handleGenerateProof} className="mt-5 !bg-purple-600 hover:!bg-purple-700 !text-white w-full sm:w-auto">
                Generate Proof
              </LoadingButton>

              {generatedProof && (
                <div className="mt-6 border border-purple-200 bg-white rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-purple-100 px-4 py-2 border-b border-purple-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-purple-800">Generated Proof JSON</span>
                    <CopyButton value={JSON.stringify(generatedProof, null, 2)} label="Copy JSON" />
                  </div>
                  <pre className="p-4 text-xs overflow-x-auto text-gray-800 max-h-96">
                    {JSON.stringify(generatedProof, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {auditLogs && auditLogs.length > 0 && (
            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-md">
              <h3 className="text-lg font-black text-gray-800">Immutable Audit Trail</h3>
              <p className="text-sm text-gray-500 mt-2">
                A complete, tamper-evident history of every important action performed on this document throughout its lifecycle.
              </p>
              
              <div className="mt-6 relative border-l-2 border-gray-100 ml-3 space-y-6">
                {auditLogs.map((log) => (
                  <div key={log._id} className="relative pl-6 pb-2">
                    <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-cryptoBlack ring-4 ring-white" />
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-800">{log.eventType}</span>
                        <span className="text-xs font-bold text-gray-400">{formatDate(log.createdAt)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {log.versionNumber && (
                          <div>
                            <span className="text-gray-500">Version: </span>
                            <span className="font-bold">v{log.versionNumber}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Actor: </span>
                          <span className="font-bold">{log.performedBy}</span>
                        </div>
                        {log.previousState && log.newState && (
                          <div className="col-span-2">
                            <span className="text-gray-500">State Change: </span>
                            <span className="font-bold">{log.previousState} ➔ {log.newState}</span>
                          </div>
                        )}
                        {log.blockchainTxHash && (
                          <div className="col-span-2 flex flex-wrap gap-2 items-center">
                            <span className="text-gray-500">Tx Hash: </span>
                            <code className="text-xs font-mono bg-gray-200 px-2 py-1 rounded break-all">{shortValue(log.blockchainTxHash)}</code>
                            <CopyButton value={log.blockchainTxHash} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default DocumentDetailsPage;
