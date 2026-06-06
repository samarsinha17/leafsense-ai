import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BarChart3, Bot, Download, FileText, LogOut, Menu, Moon, Settings, ShieldCheck, Sprout, Sun, UserCircle, X } from "lucide-react";
import { navItems } from "../../data/content";
import { getProfile } from "../../services/api";
import { useAppStore } from "../../store/useAppStore";
import { Logo } from "../Logo";
import { Button } from "../ui/Button";

export function Navbar() {
  const { theme, toggleTheme, user, setUser } = useAppStore();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    if (!localStorage.getItem("leafsense-access-token") || user) return;
    getProfile().then(setUser).catch(() => {
      localStorage.removeItem("leafsense-access-token");
      localStorage.removeItem("leafsense-refresh-token");
    });
  }, [setUser, user]);

  useEffect(() => {
    if (!profileOpen) return;
    const close = () => setProfileOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [profileOpen]);

  const visibleNavItems = user
    ? user.role === "admin"
      ? [...navItems, { label: "Admin", path: "/admin" }]
      : navItems
    : navItems.filter((item) => item.path === "/");
  const logout = () => {
    localStorage.removeItem("leafsense-access-token");
    localStorage.removeItem("leafsense-refresh-token");
    setUser(null);
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3 px-4 py-4 transition-all sm:px-6 lg:px-8 2xl:px-5">
        <Link className="shrink-0" to="/" aria-label="LeafSense AI home">
          <Logo />
        </Link>
        <div className="hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-2 xl:flex xl:gap-x-4">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => {
                const active = isActive || (item.path === "/detect" && location.pathname === "/result");
                return `whitespace-nowrap text-xs font-medium transition-colors 2xl:text-sm ${active ? "text-primary" : "text-muted hover:text-foreground"}`;
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            aria-label="Toggle navigation"
            className="grid h-10 w-10 place-items-center rounded bg-slate-800 text-slate-200 shadow-sm transition hover:bg-slate-700 xl:hidden"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={22} strokeWidth={2.2} /> : <Menu size={24} strokeWidth={2.2} />}
          </button>
          <button
            aria-label="Toggle theme"
            className="glass-card grid h-10 w-10 place-items-center rounded-full text-foreground transition hover:border-primary"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <div className="relative">
              <button
                className="inline-flex max-w-44 items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
                onClick={(event) => { event.stopPropagation(); setProfileOpen((current) => !current); }}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {user.profileImage ? (
                    <img className="h-full w-full object-cover" src={user.profileImage} alt={user.fullName} />
                  ) : (
                    user.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)
                  )}
                </span>
                <span className="hidden truncate sm:inline">{user.fullName}</span>
                <span className="text-muted">v</span>
              </button>
              {profileOpen ? (
                <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(event) => event.stopPropagation()}>
                  <div className="border-b border-border p-4">
                    <p className="truncate font-semibold">{user.fullName}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <div className="grid p-2 text-sm">
                    {[
                      ["/profile", "My Profile", UserCircle],
                      ["/my-diagnoses", "My Diagnoses", Sprout],
                      ["/my-analytics", "My Analytics", BarChart3],
                      ["/assistant-history", "Assistant History", Bot],
                      ["/my-reports", "My Reports", Download],
                      ["/settings", "Settings", Settings],
                      ["/contact", "Contact Support", FileText],
                    ].map(([path, label, Icon]) => (
                      <Link key={label as string} to={path as string} onClick={() => setProfileOpen(false)} className="inline-flex items-center gap-3 rounded-xl px-3 py-2 text-muted transition hover:bg-primary/10 hover:text-primary">
                        <Icon size={17} /> {label as string}
                      </Link>
                    ))}
                    {user.role === "admin" ? (
                      <>
                        <div className="my-2 h-px bg-border" />
                        {[
                          ["/admin", "Admin Dashboard", ShieldCheck],
                          ["/admin/users", "User Management", UserCircle],
                          ["/admin/dataset", "Dataset Management", Sprout],
                          ["/admin/system", "System Analytics", BarChart3],
                        ].map(([path, label, Icon]) => (
                          <Link key={label as string} to={path as string} onClick={() => setProfileOpen(false)} className="inline-flex items-center gap-3 rounded-xl px-3 py-2 text-primary transition hover:bg-primary/10">
                            <Icon size={17} /> {label as string}
                          </Link>
                        ))}
                      </>
                    ) : null}
                    <div className="my-2 h-px bg-border" />
                    <button onClick={logout} className="inline-flex items-center gap-3 rounded-xl px-3 py-2 text-left text-red-500 transition hover:bg-red-500/10">
                      <LogOut size={17} /> Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link className="hidden text-sm font-semibold text-muted transition hover:text-primary sm:inline" to="/login">
                Login
              </Link>
              <Link to="/signup">
                <Button className="px-5 py-2.5">Signup</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
      {open ? (
        <div className="border-t border-border/60 px-6 py-4 xl:hidden">
          <div className="mx-auto grid max-w-7xl gap-3 text-sm">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => {
                  const active = isActive || (item.path === "/detect" && location.pathname === "/result");
                  return `rounded-xl px-3 py-2 font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted hover:bg-primary/10 hover:text-foreground"}`;
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
