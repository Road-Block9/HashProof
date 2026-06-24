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
      accent: "from-cyan-400 to-blue-600"
    },
    {
      label: "Contract Configured",
      value: status?.contractConfigured ? "Yes" : "No",
      icon: Blocks,
      accent: "from-purple-400 to-indigo-600"
    },
    {
      label: "Network",
      value: status?.network ? `${status.network.name} (${status.network.chainId})` : "Not available",
      icon: Network,
      accent: "from-emerald-400 to-teal-600"
    }
  ];

  return (
    <div className="space-y-6">
      <section className="app-card-dark overflow-hidden">
        <div className="relative">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Local Hardhat Proof Layer</p>
          <h1 className="mt-3 text-3xl font-black text-white">Blockchain Status</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Check whether the backend can reach the local RPC node and the deployed DocumentRegistry contract.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <LoadingButton loading={loading} type="button" onClick={fetchStatus}>
              Check Status
            </LoadingButton>
            {status && <BlockchainBadge status={status.configured ? "STORED" : "NOT_CONFIGURED"} />}
          </div>
        </div>
      </section>

      {message && <StatusMessage type={message.type} message={message.text} />}
      {status?.message && <StatusMessage type="warning" message={status.message} />}

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="app-card">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}>
                <Icon size={22} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-2 text-xl font-black text-slate-950">{status ? card.value : "Check status"}</p>
            </div>
          );
        })}
      </section>

      <section className="app-card">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950">What This Means</h2>
            <p className="muted-text">
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
