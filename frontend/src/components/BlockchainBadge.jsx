const styles = {
  STORED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  AVAILABLE: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  FAILED: "bg-rose-100 text-rose-800 ring-rose-200",
  NOT_CONFIGURED: "bg-slate-100 text-slate-700 ring-slate-200"
};

const BlockchainBadge = ({ status }) => {
  const label = status || "NOT_CONFIGURED";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles[label] || styles.NOT_CONFIGURED}`}>
      {label}
    </span>
  );
};

export default BlockchainBadge;
