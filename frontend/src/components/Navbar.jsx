import { Link, NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Upload", path: "/upload" },
  { label: "New Version", path: "/upload-version" },
  { label: "Verify", path: "/verify" },
  { label: "History", path: "/versions" },
  { label: "Revoke", path: "/revoke" },
  { label: "Details", path: "/details" },
  { label: "Blockchain", path: "/blockchain-status" }
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 text-white shadow-lg shadow-cyan-950/40">
            <ShieldCheck size={24} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-wide text-white">HASHPROOF</span>
            <span className="block text-xs text-cyan-100">Blockchain-backed document integrity verification</span>
          </span>
        </Link>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-indigo-950 shadow-lg shadow-cyan-950/20"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
