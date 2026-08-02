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
      className="inline-flex items-center gap-2 rounded-lg bg-spaceCard shadow-neo-out px-3 py-1.5 text-xs font-bold text-electricBlue transition-all duration-300 hover:shadow-neo-glow-blue hover:text-white active:shadow-neo-in"
      title={label}
    >
      <Copy size={14} aria-hidden="true" />
      {label}
    </button>
  );
};

export default CopyButton;
