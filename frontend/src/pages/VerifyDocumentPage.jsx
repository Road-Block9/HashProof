import { useMemo, useState } from "react";
import { verifyDocument, verifySelectiveProof, verifyHistoricalDocument } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import LifecycleBadge from "../components/LifecycleBadge.jsx";

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

  // Selective Verification state
  const [activeTab, setActiveTab] = useState("traditional");
  const [proofJson, setProofJson] = useState("");
  const [selectiveResult, setSelectiveResult] = useState(null);

  // Historical Verification state
  const [historicalDocId, setHistoricalDocId] = useState("");
  const [historicalVersion, setHistoricalVersion] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [historicalResult, setHistoricalResult] = useState(null);

  const cardStyle = useMemo(() => {
    const status = result?.status;
    if (status === "VALID_LATEST_VERSION") return "border-emerald-500 bg-white text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
    if (status === "VALID_OLD_VERSION") return "border-amber-500 bg-white text-amber-700 shadow-[0_0_15px_rgba(245,158,11,0.15)]";
    if (status === "REVOKED") return "border-rose-500 bg-white text-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
    if (status === "RECORD_FOUND") return "border-blue-500 bg-white text-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
    if (status === "RECORD_FOUND_REVOKED") return "border-rose-500 bg-white text-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.15)]";
    if (status === "NOT_REGISTERED") return "border-gray-300 bg-white text-gray-700 shadow-xl";
    return "border-gray-300 bg-white text-gray-700 shadow-xl";
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

  const handleSelectiveSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setSelectiveResult(null);

    if (!proofJson.trim()) {
      setMessage({ type: "error", text: "Please enter the proof JSON." });
      setLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(proofJson);
      const response = await verifySelectiveProof(payload);
      setSelectiveResult(response.data);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      if (error instanceof SyntaxError) {
        setMessage({ type: "error", text: "Invalid JSON format." });
      } else {
        setMessage({ type: "error", text: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHistoricalSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setHistoricalResult(null);

    if (!historicalDocId.trim() || !targetDate) {
      setMessage({ type: "error", text: "Please enter Document ID and Target Date." });
      setLoading(false);
      return;
    }

    try {
      const payload = { targetDate, versionNumber: historicalVersion || undefined };
      const response = await verifyHistoricalDocument(historicalDocId.trim(), payload);
      setHistoricalResult(response.data);
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

        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button 
            className={`pb-2 px-2 text-sm font-bold ${activeTab === "traditional" ? "border-b-2 border-cryptoBlack text-cryptoBlack" : "text-gray-400 hover:text-gray-700"}`}
            onClick={() => { setActiveTab("traditional"); setMessage(null); setResult(null); }}
          >
            Traditional
          </button>
          <button 
            className={`pb-2 px-2 text-sm font-bold ${activeTab === "selective" ? "border-b-2 border-cryptoBlack text-cryptoBlack" : "text-gray-400 hover:text-gray-700"}`}
            onClick={() => { setActiveTab("selective"); setMessage(null); setSelectiveResult(null); }}
          >
            Selective Disclosure
          </button>
          <button 
            className={`pb-2 px-2 text-sm font-bold ${activeTab === "historical" ? "border-b-2 border-cryptoBlack text-cryptoBlack" : "text-gray-400 hover:text-gray-700"}`}
            onClick={() => { setActiveTab("historical"); setMessage(null); setHistoricalResult(null); }}
          >
            Historical
          </button>
        </div>

        {activeTab === "traditional" && (
          <form onSubmit={handleSubmit} className="mt-4 grid gap-5">
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
        )}
        
        {activeTab === "selective" && (
          <form onSubmit={handleSelectiveSubmit} className="mt-4 grid gap-5">
            <FormField label="Proof JSON" hint="Paste the generated proof JSON here">
              <textarea 
                className="app-input min-h-[200px] font-mono text-xs" 
                value={proofJson} 
                onChange={(e) => setProofJson(e.target.value)} 
                placeholder='{"docId": "...", "versionNumber": 1, "root": "...", "proofs": {...}}'
                required
              />
            </FormField>
            <LoadingButton loading={loading} type="submit" className="mt-4 !bg-purple-600 hover:!bg-purple-700 !text-white">Verify Proof</LoadingButton>
          </form>
        )}

        {activeTab === "historical" && (
          <form onSubmit={handleHistoricalSubmit} className="mt-4 grid gap-5">
            <FormField label="Document ID" hint="E.g. DOC-123...">
              <input className="app-input" value={historicalDocId} onChange={(e) => setHistoricalDocId(e.target.value)} required />
            </FormField>
            <FormField label="Version Number" hint="(Optional) Leave empty for latest version">
              <input type="number" min="1" className="app-input" value={historicalVersion} onChange={(e) => setHistoricalVersion(e.target.value)} />
            </FormField>
            <FormField label="Target Date" hint="The exact date and time to verify against">
              <input type="datetime-local" className="app-input" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
            </FormField>
            <LoadingButton loading={loading} type="submit" className="mt-4 !bg-blue-600 hover:!bg-blue-700 !text-white">Verify Historical Status</LoadingButton>
          </form>
        )}
      </section>

      <aside className="space-y-6">
        {message && <StatusMessage type={message.type} message={message.text} />}
        {result && (
          <div className={`rounded-3xl border p-6 shadow-xl ${cardStyle}`}>
            <p className="text-sm font-bold uppercase tracking-wide opacity-80">Verification Status</p>
            <h2 className="mt-2 text-2xl font-black">{statusLabels[result.status] || "Invalid"}</h2>
            <dl className="mt-6 grid gap-4 text-sm text-gray-800">
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
              {result.newerActiveVersionAvailable && (
                <div className="flex justify-between gap-4">
                  <dt className="opacity-80">Newer Active Version</dt>
                  <dd className="font-bold text-amber-600">Yes (v{result.latestActiveVersion?.versionNumber})</dd>
                </div>
              )}
              {result.matchedVersion && (
                <div className="flex justify-between gap-4 items-center">
                  <dt className="opacity-80">Lifecycle State</dt>
                  <dd><LifecycleBadge state={result.matchedVersion.lifecycleState} /></dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="opacity-80">Integrity Checked</dt>
                <dd className="font-bold">{result.integrityChecked ? "Yes" : "No"}</dd>
              </div>
              {result.note && (
                <div className="rounded-xl bg-gray-50 p-4 text-xs font-bold leading-5 border border-gray-200">
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
                  <code className="break-all rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-700">{shortHash(hash)}</code>
                  {hash && <CopyButton value={hash} label="Copy hash" />}
                </dd>
              </div>
              {result.blockchainVerification && (
                <div className="grid gap-3 border-t border-gray-200 pt-4">
                  <dt className="opacity-80">Blockchain Verification</dt>
                  <dd className="grid gap-3">
                    <div>
                      <BlockchainBadge status={result.blockchainVerification.status} />
                    </div>
                    {result.blockchainVerification.data && (
                      <span className="text-xs leading-6 block bg-gray-50 p-3 rounded-lg border border-gray-200">
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
        {selectiveResult && (
          <div className={`rounded-3xl border p-6 shadow-xl ${selectiveResult.isValid ? "border-purple-500 bg-white text-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-rose-500 bg-white text-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.15)]"}`}>
            <p className="text-sm font-bold uppercase tracking-wide opacity-80">Selective Verification</p>
            <h2 className="mt-2 text-2xl font-black">{selectiveResult.isValid ? "Valid Proof" : "Invalid/Revoked"}</h2>
            
            {selectiveResult.message && (
              <div className={`mt-4 rounded-xl p-4 text-xs font-bold leading-5 border ${selectiveResult.isValid ? "bg-purple-50 border-purple-200" : "bg-rose-50 border-rose-200"}`}>
                {selectiveResult.message}
              </div>
            )}

            {selectiveResult.isValid && (
              <dl className="mt-6 grid gap-4 text-sm text-gray-800">
                <div className="grid gap-2 border-b border-gray-100 pb-4">
                  <dt className="opacity-80 font-bold text-purple-700">Revealed Fields</dt>
                  <dd>
                    <ul className="space-y-3">
                      {Object.entries(selectiveResult.revealedFields).map(([key, value]) => (
                        <li key={key} className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex justify-between">
                          <span className="font-bold text-gray-500">{key}</span>
                          <span className="font-black break-all ml-4 text-right">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="grid gap-2 pt-2">
                  <dt className="opacity-80">Verified against Blockchain Root</dt>
                  <dd className="flex flex-wrap items-center gap-3">
                    <code className="break-all rounded-lg bg-gray-100 border border-gray-200 px-3 py-1.5 text-xs text-gray-700">{shortHash(selectiveResult.blockchainRoot)}</code>
                  </dd>
                </div>
              </dl>
            )}

            {selectiveResult.failedFields?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-bold text-rose-600">Tampered Fields Detected:</p>
                <ul className="mt-2 space-y-2">
                  {selectiveResult.failedFields.map(field => (
                    <li key={field} className="text-xs bg-rose-50 border border-rose-200 text-rose-700 p-2 rounded-lg">{field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {historicalResult && (
          <div className={`rounded-3xl border p-6 shadow-xl ${historicalResult.isValid ? "border-blue-500 bg-white text-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "border-gray-400 bg-white text-gray-700 shadow-lg"}`}>
            <p className="text-sm font-bold uppercase tracking-wide opacity-80">Historical Verification</p>
            <h2 className="mt-2 text-2xl font-black">{historicalResult.isValid ? "Valid at Target Date" : "Invalid at Target Date"}</h2>
            
            <dl className="mt-6 grid gap-4 text-sm text-gray-800">
              <div className="flex justify-between gap-4">
                <dt className="opacity-80">Target Date</dt>
                <dd className="font-bold">{new Date(historicalResult.targetDate).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between gap-4 items-center">
                <dt className="opacity-80">Lifecycle State at Target Date</dt>
                <dd><LifecycleBadge state={historicalResult.lifecycleState} /></dd>
              </div>
              {historicalResult.revocationReason && (
                <div className="grid gap-2 text-rose-700">
                  <dt className="opacity-80 font-bold">Revocation Reason</dt>
                  <dd className="font-bold">{historicalResult.revocationReason}</dd>
                </div>
              )}
            </dl>

            <div className="mt-8">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Version Timeline</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                {historicalResult.timeline.map((event, index) => {
                  const isPast = new Date(event.timestamp) <= new Date(historicalResult.targetDate);
                  return (
                    <div key={index} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isPast ? "opacity-100" : "opacity-40"}`}>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${event.state.includes("Revoked") ? "bg-rose-500" : "bg-blue-500"}`}>
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {event.state === "Issued" ? <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> : 
                           event.state === "Verified" ? <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /> :
                           event.state === "Superseded" ? <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> :
                           <path d="M18 6L6 18M6 6l12 12" />
                          }
                        </svg>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{event.state}</span>
                          <span className="text-xs text-gray-500 mt-1">{new Date(event.timestamp).toLocaleString()}</span>
                          {event.reason && <span className="text-xs text-rose-600 font-bold mt-2 border-t pt-2 border-rose-100">{event.reason}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default VerifyDocumentPage;
