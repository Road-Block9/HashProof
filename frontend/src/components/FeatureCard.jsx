import { Link } from "react-router-dom";

const FeatureCard = ({ title, description, path, icon: Icon, gradient }) => {
  return (
    <Link
      to={path}
      className="group rounded-2xl border border-white/15 bg-white/90 p-5 shadow-xl shadow-slate-950/10 backdrop-blur transition hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg transition group-hover:scale-105`}>
        <Icon size={23} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
};

export default FeatureCard;
