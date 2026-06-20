import { Copy } from "lucide-react";

const CopyButton = ({ value, label = "Copy" }) => {
  const copyValue = async () => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
  };

  return (
    <button
      type="button"
      onClick={copyValue}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      title={label}
    >
      <Copy size={14} aria-hidden="true" />
      {label}
    </button>
  );
};

export default CopyButton;
