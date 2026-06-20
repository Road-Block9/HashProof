import { useState } from "react";
import { uploadDocument } from "../api/documentApi.js";
import CopyButton from "../components/CopyButton.jsx";
import FormField from "../components/FormField.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Upload Document</h1>
        <p className="mt-2 text-sm text-slate-600">
          Upload the first PDF version. The backend will generate a public docId and SHA-256 hash.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <FormField label="Title">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" name="title" value={form.title} onChange={updateField} required />
          </FormField>
          <FormField label="Description">
            <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2" name="description" value={form.description} onChange={updateField} />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Issuer Name">
              <input className="w-full rounded-md border border-slate-300 px-3 py-2" name="issuerName" value={form.issuerName} onChange={updateField} required />
            </FormField>
            <FormField label="Owner Name">
              <input className="w-full rounded-md border border-slate-300 px-3 py-2" name="ownerName" value={form.ownerName} onChange={updateField} required />
            </FormField>
          </div>
          <FormField label="Owner Email">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" name="ownerEmail" value={form.ownerEmail} onChange={updateField} required />
          </FormField>
          <FormField label="PDF File" hint="Only PDF files are accepted by the backend.">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="file" accept="application/pdf" onChange={(event) => setFile(event.target.files[0])} required />
          </FormField>
          <LoadingButton loading={loading} type="submit">Upload Document</LoadingButton>
        </form>
      </section>

      <aside className="space-y-4">
        {message && <StatusMessage type={message.type} message={message.text} />}
        {docId && (
          <div className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Generated docId</h2>
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md bg-slate-50 p-3">
              <code className="break-all text-sm font-semibold text-brand">{docId}</code>
              <CopyButton value={docId} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Copy this docId. It is required for verification, version upload, revocation, and details lookup.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default UploadDocumentPage;
