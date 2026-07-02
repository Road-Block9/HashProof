const StorageBadge = ({ provider }) => {
  const normalizedProvider = provider || "NOT_AVAILABLE";

  const styles = {
    CLOUDINARY: "border-cyan-200 bg-cyan-50 text-cyan-800",
    LOCAL: "border-orange-200 bg-orange-50 text-orange-800",
    NOT_AVAILABLE: "border-slate-200 bg-slate-100 text-slate-600"
  };

  const labels = {
    CLOUDINARY: "STORED ON CLOUD",
    LOCAL: "STORED LOCALLY",
    NOT_AVAILABLE: "NOT AVAILABLE"
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
        styles[normalizedProvider] || styles.NOT_AVAILABLE
      }`}
    >
      {labels[normalizedProvider] || labels.NOT_AVAILABLE}
    </span>
  );
};

export default StorageBadge;
