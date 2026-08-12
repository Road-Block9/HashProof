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

const actions = [
  {
    title: "Upload Document",
    description: "Register a new PDF, generate its SHA-256 hash, and store integrity proof.",
    path: "/upload",
    icon: FilePlus2,
    rotationClass: "rotate-[-4deg]"
  },
  {
    title: "Verify Document",
    description: "Check whether a PDF is latest, old, revoked, invalid, or tampered.",
    path: "/verify",
    icon: FileSearch,
    rotationClass: "rotate-[5deg]"
  },
  {
    title: "Upload New Version",
    description: "Add corrected document versions while preserving previous hash history.",
    path: "/upload-version",
    icon: UploadCloud,
    rotationClass: "rotate-[-3deg]"
  },
  {
    title: "Version History",
    description: "View every version, upload date, blockchain status, and copyable hash.",
    path: "/versions",
    icon: GitBranch,
    rotationClass: "rotate-[6deg]"
  },
  {
    title: "Revoke Document",
    description: "Record revocation reason and prevent future versions for revoked documents.",
    path: "/revoke",
    icon: ShieldOff,
    rotationClass: "rotate-[-5deg]"
  },
  {
    title: "Document Details",
    description: "Inspect issuer, owner, status, current version, and metadata.",
    path: "/details",
    icon: ClipboardList,
    rotationClass: "rotate-[4deg]"
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
      className: "bg-white text-cryptoBlack opacity-80"
    },
    online: {
      label: "Blockchain Online",
      className: "bg-cryptoBlack text-green-500"
    },
    offline: {
      label: "Blockchain Offline",
      className: "bg-cryptoBlack text-red-500"
    }
  }[blockchainState];

  return (
    <div className="relative flex flex-col h-full z-10 w-full min-h-[70vh]">
      
      {/* Absolute 3D Asset Placeholders */}
      <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg" alt="3D Coin 3" className="absolute -bottom-20 left-[20%] w-32 h-32 object-contain animate-floating z-20 drop-shadow-2xl opacity-50" />

      {/* Top Hero Section (On top of Yellow) */}
      <section className="pt-10 pb-48 text-center relative z-10">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-cryptoBlack">
          HashProof
          <span className="block text-3xl md:text-5xl mt-2 opacity-80">Privacy-Preserving Document Lifecycle Platform</span>
        </h1>
        <p className="mt-8 text-xl font-bold text-cryptoBlack max-w-2xl mx-auto leading-relaxed">
          Privacy-preserving document authentication with blockchain-backed verification, selective disclosure, version-aware lifecycle management, and immutable audit trails.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4 relative z-30">
          <Link
            to="/blockchain-status"
            className={`rounded-full px-8 py-3.5 font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 ${blockchainButton.className}`}
          >
            {blockchainButton.label}
          </Link>
        </div>
      </section>

      {/* Bottom Section (Floating over the Yellow/Black boundary) */}
      <section className="relative z-30 px-4 mt-auto">
        {/* Negative margin pulls the grid up over the yellow background boundary */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 -mt-32 max-w-6xl mx-auto relative z-30 pb-20">
          {actions.map((action) => (
            <FeatureCard key={action.path} {...action} />
          ))}
        </div>
        
        {/* Bottom Headline (On top of Black) */}
        <div className="text-center pb-16 pt-10 relative z-10">
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tight">
            Your Immutable
            <br />
            Audit Trail
          </h2>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
