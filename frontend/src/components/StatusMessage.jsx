const styles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-emerald-900/10",
  error: "border-rose-200 bg-rose-50 text-rose-800 shadow-rose-900/10",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800 shadow-cyan-900/10",
  warning: "border-amber-200 bg-amber-50 text-amber-800 shadow-amber-900/10"
};

const StatusMessage = ({ type = "info", message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${styles[type] || styles.info}`}>
      {message}
    </div>
  );
};

export default StatusMessage;
