import { Link } from "react-router-dom";
import {
  FilePlus2,
  FileSearch,
  GitBranch,
  ShieldOff,
  ClipboardList,
  UploadCloud
} from "lucide-react";

const actions = [
  {
    title: "Upload Document",
    description: "Register a new PDF and generate its first SHA-256 hash.",
    path: "/upload",
    icon: FilePlus2
  },
  {
    title: "Verify Document",
    description: "Upload a PDF and check whether it is latest, old, revoked, or unknown.",
    path: "/verify",
    icon: FileSearch
  },
  {
    title: "Upload New Version",
    description: "Add a corrected or updated PDF version for an active document.",
    path: "/upload-version",
    icon: UploadCloud
  },
  {
    title: "Version History",
    description: "View all uploaded versions and compare their hashes.",
    path: "/versions",
    icon: GitBranch
  },
  {
    title: "Revoke Document",
    description: "Mark a document as revoked with reason and timestamp.",
    path: "/revoke",
    icon: ShieldOff
  },
  {
    title: "Document Details",
    description: "Check document metadata, owner details, and current status.",
    path: "/details",
    icon: ClipboardList
  }
];

const featureList = ["Document Upload", "Document Verification", "Version Tracking", "Revocation Management"];

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Final Year Project</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-ink md:text-4xl">
              Blockchain-based Document Authentication and Integrity Verification System
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              A clean college-demo frontend for uploading official PDFs, verifying their SHA-256 hashes,
              tracking document versions, and managing revocation records.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Core Modules</h2>
            <div className="mt-4 grid gap-3">
              {featureList.map((feature) => (
                <div key={feature} className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-brand">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink">{action.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
};

export default DashboardPage;
