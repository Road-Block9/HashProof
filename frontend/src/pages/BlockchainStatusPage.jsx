import { useState } from "react";
import { Activity, Blocks, Cable, Network } from "lucide-react";
import { getBlockchainStatus } from "../api/documentApi.js";
import BlockchainBadge from "../components/BlockchainBadge.jsx";
import LoadingButton from "../components/LoadingButton.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

const BlockchainStatusPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await getBlockchainStatus();
      setStatus(response.data);
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      label: "RPC Reachable",
      value: status?.rpcReachable ? "Yes" : "No",
      icon: Cable,
      accent: "text-electricBlue"
    },
    {
      label: "Contract Configured",
      value: status?.contractConfigured ? "Yes" : "No",
      icon: Blocks,
      accent: "text-neonPurple"
    },
    {
      label: "Network",
      value: status?.network ? `${status.network.name} (${status.network.chainId})` : "Not available",
      icon: Network,
      accent: "text-emerald-400"
    }
  ];

  return (
    <div className="space-y-8">
      <section className="app-card overflow-hidden">
        <div className="relative z-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-electricBlue/10 blur-[100px]" />
          <h1 className="page-title">Local Hardhat Proof Layer</h1>
          <h2 className="mt-4 text-2xl font-bold text-cryptoBlack">Blockchain Status</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
            Check whether the backend can reach the local RPC node and the deployed DocumentRegistry contract.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <LoadingButton loading={loading} type="button" onClick={fetchStatus} className="">
              Check Status
            </LoadingButton>
            {status && <BlockchainBadge status={status.configured ? "STORED" : "NOT_CONFIGURED"} />}
          </div>
        </div>
      </section>

      {message && <StatusMessage type={message.type} message={message.text} />}
      {status?.message && <StatusMessage type="warning" message={status.message} />}

      <section className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="app-card flex flex-col items-start transition-colors">
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 shadow-inner ${card.accent}`}>
                <Icon size={26} aria-hidden="true" />
              </span>
              <p className="mt-5 text-sm font-bold text-gray-600">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-cryptoBlack">{status ? card.value : "Check status"}</p>
            </div>
          );
        })}
      </section>

      <section className="app-card">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 shadow-inner text-neonPurple">
            <Activity size={24} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-black text-cryptoBlack">What This Means</h2>
            <p className="muted-text mt-2">
              MongoDB remains the main database. Blockchain is used as the integrity proof layer for hash registration,
              version proof, and revocation proof.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlockchainStatusPage;
