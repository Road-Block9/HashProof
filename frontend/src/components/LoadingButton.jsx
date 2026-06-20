import Loader from "./Loader.jsx";

const LoadingButton = ({ loading, children, className = "", ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-400 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader />}
      {children}
    </button>
  );
};

export default LoadingButton;
