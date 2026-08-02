import { Link } from "react-router-dom";

const FeatureCard = ({ title, description, path, icon: Icon, rotationClass }) => {
  return (
    <div className={`transition-all duration-500 hover:scale-105 hover:z-20 animate-floating ${rotationClass || ''}`}>
      <Link
        to={path}
        className="group flex flex-col items-center text-center rounded-[32px] bg-white p-8 shadow-crypto-card transition-all duration-300"
      >
        <span className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-cryptoBlack text-white transition-all duration-300 group-hover:bg-cryptoYellow group-hover:text-cryptoBlack group-hover:-translate-y-2`}>
          <Icon size={32} aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-xl font-bold text-cryptoBlack">{title}</h2>
        <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">{description}</p>
        <span className="mt-6 btn-pill text-sm w-full group-hover:bg-cryptoYellow group-hover:text-cryptoBlack">
          Launch
        </span>
      </Link>
    </div>
  );
};

export default FeatureCard;
