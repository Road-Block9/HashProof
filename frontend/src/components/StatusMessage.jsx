const styles = {
  success: "border-emerald-500 bg-spaceCard text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  error: "border-rose-500 bg-spaceCard text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
  info: "border-electricBlue bg-spaceCard text-electricBlue shadow-[0_0_10px_rgba(0,240,255,0.2)]",
  warning: "border-amber-500 bg-spaceCard text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
};

const StatusMessage = ({ type = "info", message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-bold tracking-wide ${styles[type] || styles.info}`}>
      {message}
    </div>
  );
};

export default StatusMessage;
