const FormField = ({ label, children, hint, labelClassName = "text-gray-600" }) => {
  return (
    <label className="block">
      <span className={`mb-2 block text-sm font-bold tracking-wide ${labelClassName}`}>{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
};

export default FormField;
