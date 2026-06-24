import { Copy } from "lucide-react";

const CopyButton = ({ value, label = "Copy" }) => {
  const copyValue = async () => {
    if (!value) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
      }

      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (error) {
      console.error("Copy failed:", error.message);
    }
  };

  return (
    <button
      type="button"
      onClick={copyValue}
      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100"
      title={label}
    >
      <Copy size={14} aria-hidden="true" />
      {label}
    </button>
  );
};

export default CopyButton;
