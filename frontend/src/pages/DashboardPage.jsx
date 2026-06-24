import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  FilePlus2,
  FileSearch,
  GitBranch,
  ShieldOff,
  UploadCloud
} from "lucide-react";
import FeatureCard from "../components/FeatureCard.jsx";
import { getBlockchainStatus } from "../api/documentApi.js";
import proofTerminalHero from "../assets/proof-terminal-hero.png";

const actions = [
  {
    title: "Upload Document",
    description: "Register a new PDF, generate its SHA-256 hash, and store integrity proof.",
    path: "/upload",
    icon: FilePlus2,
    gradient: "from-cyan-400 to-blue-600"
  },
  {
    title: "Verify Document",
    description: "Check whether a PDF is latest, old, revoked, invalid, or tampered.",
    path: "/verify",
    icon: FileSearch,
    gradient: "from-emerald-400 to-teal-600"
  },
  {
    title: "Upload New Version",
    description: "Add corrected document versions while preserving previous hash history.",
    path: "/upload-version",
    icon: UploadCloud,
    gradient: "from-indigo-400 to-purple-600"
  },
  {
    title: "Version History",
    description: "View every version, upload date, blockchain status, and copyable hash.",
    path: "/versions",
    icon: GitBranch,
    gradient: "from-fuchsia-400 to-pink-600"
  },
  {
    title: "Revoke Document",
    description: "Record revocation reason and prevent future versions for revoked documents.",
    path: "/revoke",
    icon: ShieldOff,
    gradient: "from-rose-400 to-red-600"
  },
  {
    title: "Document Details",
    description: "Inspect issuer, owner, status, current version, and metadata.",
    path: "/details",
    icon: ClipboardList,
    gradient: "from-amber-400 to-orange-600"
  }
];

const DashboardPage = () => {
  const [blockchainState, setBlockchainState] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    const checkBlockchainStatus = async () => {
      try {
        const response = await getBlockchainStatus();
        const isHealthy = response.data?.rpcReachable === true && response.data?.contractConfigured === true;

        if (isMounted) {
          setBlockchainState(isHealthy ? "online" : "offline");
        }
      } catch (error) {
        if (isMounted) {
          setBlockchainState("offline");
        }
      }
    };

    checkBlockchainStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const blockchainButton = {
    checking: {
      label: "Checking Blockchain...",
      className: "border border-white/20 bg-white/10 text-white hover:bg-white/20"
    },
    online: {
      label: "Blockchain Online",
      className: "bg-gradient-to-r from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-950/30"
    },
    offline: {
      label: "Blockchain Offline",
      className: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-950/30"
    }
  }[blockchainState];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/15 bg-slate-950/75 p-6 text-white shadow-2xl shadow-cyan-950/30 backdrop-blur md:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,620px)_minmax(420px,1fr)] lg:items-center xl:gap-10">
          <div className="relative z-10 max-w-[620px]">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Final Year Project</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-white md:text-6xl">HASHPROOF</h1>
            <p className="mt-3 text-xl font-semibold text-cyan-100">
              Blockchain-backed document integrity verification
            </p>
            <p className="mt-5 max-w-[620px] text-base leading-7 text-slate-300">
              Blockchain-based Document Authentication and Integrity Verification System
            </p>
            <p className="mt-3 max-w-[620px] text-sm leading-6 text-slate-400">
              Upload official PDFs, verify SHA-256 hashes, track every document version, and manage revocation with
              MongoDB metadata plus local blockchain proof.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/upload"
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-950/40 transition hover:-translate-y-0.5"
              >
                Upload Document
              </Link>
              <Link
                to="/verify"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-950 shadow-lg transition hover:-translate-y-0.5"
              >
                Verify Document
              </Link>
              <Link
                to="/blockchain-status"
                className={`rounded-xl px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${blockchainButton.className}`}
              >
                {blockchainButton.label}
              </Link>
            </div>
          </div>

          <div className="hero-visual hero-visual-image-mode">
            <div className="hero-visual-glow" />
            <img
              src={proofTerminalHero}
              alt="Proof verified blockchain terminal showing document hash, version tracking, on-chain proof, and revocation control"
              className="proof-terminal-hero-img"
            />
            <div className="hero-visual-bottom-fade" />
            <div className="hero-visual-ring hero-visual-ring-one" />
            <div className="hero-visual-ring hero-visual-ring-two" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <FeatureCard key={action.path} {...action} />
        ))}
      </section>
    </div>
  );
};

export default DashboardPage;
