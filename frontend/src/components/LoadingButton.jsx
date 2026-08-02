import { Loader2 } from "lucide-react";

const LoadingButton = ({ loading, children, className = "", ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`btn-pill inline-flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${className}`}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
};

export default LoadingButton;
