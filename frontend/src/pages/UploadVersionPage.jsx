import { useState } from "react";
import { uploadNewVersion } from "../api/documentApi.js";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

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
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Upload New Version</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add a new PDF version for an active document. Revoked documents and duplicate latest files are rejected.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="docId">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={docId} onChange={(event) => setDocId(event.target.value)} placeholder="DOC-..." required />
          </FormField>
          <FormField label="New PDF File">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0])} required />
          </FormField>
          <LoadingButton loading={loading} type="submit">Upload Version</LoadingButton>
        </form>
      </section>

      <aside className="space-y-4">
        {message && <StatusMessage type={message.type} message={message.text} />}
        {version && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">New Version Created</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Version Number</dt>
                <dd className="font-semibold text-ink">{version.versionNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Blockchain Status</dt>
                <dd className="font-semibold text-ink">{version.blockchainStatus}</dd>
              </div>
            </dl>
          </div>
        )}
      </aside>
    </div>
  );
};

export default UploadVersionPage;
