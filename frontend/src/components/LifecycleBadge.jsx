const styles = {
  Draft: "border-slate-400 bg-slate-400/10 text-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.3)]",
  Issued: "border-electricBlue bg-electricBlue/10 text-electricBlue shadow-[0_0_8px_rgba(0,240,255,0.3)]",
  Verified: "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
  Superseded: "border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
  Revoked: "border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
};

const LifecycleBadge = ({ state }) => {
  const label = state || "Issued"; // Default for old documents

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border uppercase tracking-wide ${styles[label] || styles.Issued}`}>
      {label}
    </span>
  );
};

export default LifecycleBadge;
