import Loader from "./Loader.jsx";

const LoadingButton = ({ loading, children, className = "", ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader />}
      {children}
    </button>
  );
};

export default LoadingButton;
