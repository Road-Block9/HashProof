const styles = {
  STORED: "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
  AVAILABLE: "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
  PENDING: "border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
  FAILED: "border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]",
  NOT_CONFIGURED: "border-slate-500 bg-slate-500/10 text-slate-400"
};

const BlockchainBadge = ({ status }) => {
  const label = status || "NOT_CONFIGURED";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border ${styles[label] || styles.NOT_CONFIGURED}`}>
      {label}
    </span>
  );
};

export default BlockchainBadge;
