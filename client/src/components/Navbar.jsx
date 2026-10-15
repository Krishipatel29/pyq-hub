import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Upload, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
      <img src="/favicon.svg" alt="" className="h-7 w-7" />
      PYQ Hub
    </Link>
  );
}

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-[15px] transition-colors ${
    isActive ? "text-ballpoint font-bold" : "text-pencil hover:text-ink"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setOpen(false);
    toast.success("Logged out");
    navigate("/");
  }

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>
        Subjects
      </NavLink>
      {user && (
        <>
          <NavLink to="/bookmarks" className={linkClass} onClick={() => setOpen(false)}>
            Saved
          </NavLink>
          <NavLink to="/my-uploads" className={linkClass} onClick={() => setOpen(false)}>
            My uploads
          </NavLink>
        </>
      )}
      {user?.role === "admin" && (
        <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
          Review queue
        </NavLink>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-1 md:flex">{links}</div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/upload" className="btn-primary py-2">
                <Upload size={17} /> Upload paper
              </Link>
              <button onClick={handleLogout} className="btn-ghost py-2" title={`Logged in as ${user.email}`}>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-ballpoint-soft text-xs font-bold text-ballpoint">
                  {user.name[0]?.toUpperCase()}
                </span>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost py-2">
                Log in
              </Link>
              <Link to="/register" className="btn-primary py-2">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-rule bg-paper px-4 py-3 md:hidden">
          <div className="flex flex-col">{links}</div>
          <div className="mt-3 flex gap-2 border-t border-rule pt-3">
            {user ? (
              <>
                <Link to="/upload" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                  <Upload size={17} /> Upload paper
                </Link>
                <button onClick={handleLogout} className="btn-ghost" aria-label="Log out">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost flex-1" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
