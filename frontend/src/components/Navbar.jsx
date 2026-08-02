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
    <header className="sticky top-0 z-50 px-6 sm:px-8 lg:px-12 py-6">
      <div className="mx-auto flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cryptoBlack text-white transition-all duration-300 group-hover:rotate-12">
            <ShieldCheck size={26} aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="block text-2xl font-black tracking-tight text-cryptoBlack">HASHPROOF</span>
          </span>
        </Link>

        <nav className="flex flex-wrap gap-2 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-cryptoBlack text-white shadow-lg"
                    : "text-cryptoBlack hover:bg-black/5"
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
