import { useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Menu,
  Receipt,
  Settings,
  ShoppingCart,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const links = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/sales",
    label: "Sales",
    icon: ShoppingCart,
  },
  {
    to: "/expenses",
    label: "Expenses",
    icon: Receipt,
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    to: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isBusinessSetup = location.pathname === "/register-business";

  const navClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-[#063D35] text-white shadow-sm"
        : "text-slate-600 hover:bg-[#E6F7F3] hover:text-[#063D35]"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-[#063D35] text-white"
        : "text-slate-600 hover:bg-[#E6F7F3] hover:text-[#063D35]"
    }`;

  const closeMobileMenu = () => {
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#063D35]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[#063D35] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {!isBusinessSetup && <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#F7FAF9]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Brand */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
            aria-label="SparkSales dashboard"
            onClick={closeMobileMenu}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#063D35] text-lg font-extrabold text-[#B8F2E6]">
              S
            </div>

            <div className="leading-tight">
              <div className="font-extrabold tracking-tight text-[#063D35]">
                SparkSales
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Ignite Your Earnings
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {links.map(
              ({
                to,
                label,
                icon: Icon,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={navClass}
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              )
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() =>
              setOpen((value) => !value)
            }
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-[#063D35] shadow-sm transition hover:bg-[#E6F7F3] md:hidden"
            aria-label={
              open
                ? "Close navigation"
                : "Open navigation"
            }
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {open && (
          <div
            id="mobile-navigation"
            className="border-t border-slate-200 bg-white px-4 py-3 md:hidden"
          >
            <nav
              className="mx-auto flex max-w-6xl flex-col gap-1"
              aria-label="Mobile navigation"
            >
              {links.map(
                ({
                  to,
                  label,
                  icon: Icon,
                }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeMobileMenu}
                    className={mobileNavClass}
                  >
                    <Icon size={17} />
                    {label}
                  </NavLink>
                )
              )}
            </nav>
          </div>
        )}
      </header>}

      {/* Main content */}
      <main
        id="main"
        className={isBusinessSetup ? "w-full" : "mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6"}
      >
        <Outlet />
      </main>

      {/* Mobile quick navigation */}
      {!isBusinessSetup && <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur md:hidden"
        aria-label="Mobile quick navigation"
      >
        <div className="mx-auto flex max-w-md">
          {links.slice(0, 4).map(
            ({
              to,
              label,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
                    isActive
                      ? "text-[#063D35]"
                      : "text-slate-400"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            )
          )}
        </div>
      </nav>}

      {/* Footer */}
      {!isBusinessSetup && <footer className="border-t border-slate-200 bg-white/60 py-7 pb-24 md:pb-7">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {new Date().getFullYear()} SparkSales ·
            Ignite Your Earnings
          </span>

          <span className="flex gap-4">
            <Link
              to="/privacy-policy"
              className="transition hover:text-[#063D35]"
            >
              Privacy
            </Link>

            <Link
              to="/terms-and-conditions"
              className="transition hover:text-[#063D35]"
            >
              Terms
            </Link>

            <Link
              to="/settings"
              className="transition hover:text-[#063D35]"
            >
              Settings
            </Link>
          </span>
        </div>
      </footer>}
    </div>
  );
}

export default AppLayout;