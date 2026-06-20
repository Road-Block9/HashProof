import { Link, NavLink } from "react-router-dom";
import { FileCheck2 } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Upload", path: "/upload" },
  { label: "New Version", path: "/upload-version" },
  { label: "Verify", path: "/verify" },
  { label: "History", path: "/versions" },
  { label: "Revoke", path: "/revoke" },
  { label: "Details", path: "/details" }
];

const Navbar = () => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white">
            <FileCheck2 size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-semibold text-ink">Document Auth System</span>
            <span className="block text-xs text-slate-500">Hash, verify, version, revoke</span>
          </span>
        </Link>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand text-white" : "text-slate-700 hover:bg-slate-100"
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
