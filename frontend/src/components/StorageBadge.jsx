const StorageBadge = ({ provider }) => {
  const normalizedProvider = provider || "NOT_AVAILABLE";

  const styles = {
    CLOUDINARY: "border-electricBlue bg-electricBlue/10 text-electricBlue shadow-[0_0_8px_rgba(0,240,255,0.3)]",
    LOCAL: "border-neonPurple bg-neonPurple/10 text-neonPurple shadow-[0_0_8px_rgba(176,38,255,0.3)]",
    NOT_AVAILABLE: "border-slate-500 bg-slate-500/10 text-slate-400"
  };

  const labels = {
    CLOUDINARY: "STORED ON CLOUD",
    LOCAL: "STORED LOCALLY",
    NOT_AVAILABLE: "NOT AVAILABLE"
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        styles[normalizedProvider] || styles.NOT_AVAILABLE
      }`}
    >
      {labels[normalizedProvider] || labels.NOT_AVAILABLE}
    </span>
  );
};

export default StorageBadge;
