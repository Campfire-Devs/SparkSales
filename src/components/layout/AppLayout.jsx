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
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, Outlet } from "react-router-dom";
import sparkSalesLogo from "../../assets/sparksales-logo.png";

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

const spring = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

const menuVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

const mobileItemVariants = {
  hidden: {
    opacity: 0,
    x: -12,
  },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.04,
      ...spring,
    },
  }),
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.15,
    },
  },
};

const logoHover = {
  rest: {
    rotate: 0,
    scale: 1,
  },
  hover: {
    rotate: -4,
    scale: 1.04,
    transition: spring,
  },
};

function AppLayout() {
  const [open, setOpen] = useState(false);

  const closeMobileMenu = () => {
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#063D35]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-[#063D35] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-[#F7FAF9]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            aria-label="SparkSales dashboard"
            className="group flex min-w-0 items-center gap-3"
          >
            <motion.div
              initial="rest"
              animate="rest"
              whileHover="hover"
              variants={logoHover}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200"
            >
              <img
                src={sparkSalesLogo}
                alt="SparkSales"
                className="h-full w-full object-contain p-1.5"
              />

              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
            </motion.div>

            <div className="min-w-0 leading-tight">
              <div className="truncate text-[15px] font-extrabold tracking-tight text-[#063D35] sm:text-base">
                SparkSales
              </div>

              <div className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
                Ignite Your Earnings
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden items-center rounded-2xl border border-slate-200/80 bg-white/70 p-1 shadow-sm md:flex"
            aria-label="Main navigation"
          >
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className="relative">
                {({ isActive }) => (
                  <motion.div
                    className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold ${
                      isActive
                        ? "text-white"
                        : "text-slate-600 hover:text-[#063D35]"
                    }`}
                    whileHover={
                      isActive
                        ? undefined
                        : {
                            y: -1,
                            scale: 1.01,
                          }
                    }
                    whileTap={{
                      scale: 0.98,
                    }}
                    transition={spring}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-active"
                        className="absolute inset-0 -z-10 rounded-xl bg-[#063D35] shadow-sm"
                        transition={spring}
                      />
                    )}

                    <motion.span
                      animate={{
                        scale: isActive ? 1 : 0.96,
                      }}
                      transition={spring}
                    >
                      <Icon size={15} />
                    </motion.span>

                    <span>{label}</span>
                  </motion.div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Mobile menu button */}
          <motion.button
            type="button"
            onClick={() => setOpen((value) => !value)}
            whileHover={{
              scale: 1.04,
            }}
            whileTap={{
              scale: 0.95,
            }}
            transition={spring}
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-[#063D35] shadow-sm md:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.span
                  key="close"
                  initial={{
                    opacity: 0,
                    rotate: -90,
                    scale: 0.7,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: 90,
                    scale: 0.7,
                  }}
                  transition={spring}
                  className="block"
                >
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{
                    opacity: 0,
                    rotate: 90,
                    scale: 0.7,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: -90,
                    scale: 0.7,
                  }}
                  transition={spring}
                  className="block"
                >
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile navigation */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="mobile-navigation"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={menuVariants}
              className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
            >
              <nav
                className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6"
                aria-label="Mobile navigation"
              >
                {links.map(({ to, label, icon: Icon }, index) => (
                  <motion.div
                    key={to}
                    custom={index}
                    variants={mobileItemVariants}
                  >
                    <NavLink to={to} onClick={closeMobileMenu}>
                      {({ isActive }) => (
                        <motion.div
                          whileTap={{
                            scale: 0.98,
                          }}
                          className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold ${
                            isActive ? "text-white" : "text-slate-600"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="mobile-nav-active"
                              className="absolute inset-0 -z-10 rounded-xl bg-[#063D35]"
                              transition={spring}
                            />
                          )}

                          <Icon size={17} />
                          <span>{label}</span>

                          {isActive && (
                            <motion.span
                              initial={{
                                opacity: 0,
                                x: -5,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              transition={{
                                delay: 0.08,
                                ...spring,
                              }}
                              className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B8F2E6]"
                            />
                          )}
                        </motion.div>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main
        id="main"
        className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8"
      >
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-2 py-1.5 shadow-[0_-8px_30px_rgba(6,61,53,0.06)] backdrop-blur-xl md:hidden"
        aria-label="Mobile quick navigation"
      >
        <div className="mx-auto flex max-w-md">
          {links.slice(0, 4).map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className="flex flex-1">
              {({ isActive }) => (
                <motion.div
                  whileTap={{
                    scale: 0.94,
                  }}
                  className={`relative flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition ${
                    isActive ? "text-[#063D35]" : "text-slate-400"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-active"
                      className="absolute inset-1 -z-10 rounded-xl bg-[#E6F7F3]"
                      transition={spring}
                    />
                  )}

                  <motion.div
                    animate={{
                      y: isActive ? -1 : 0,
                      scale: isActive ? 1.05 : 1,
                    }}
                    transition={spring}
                  >
                    <Icon size={17} />
                  </motion.div>

                  <span>{label}</span>

                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-dot"
                      className="absolute bottom-1 h-1 w-1 rounded-full bg-[#063D35]"
                      transition={spring}
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/60 pb-24 pt-8 md:pb-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <motion.span
            initial={{
              opacity: 0,
              y: 4,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.35,
            }}
          >
            © {new Date().getFullYear()} SparkSales · Ignite Your Earnings
          </motion.span>

          <div className="flex flex-wrap gap-4">
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

            <Link to="/settings" className="transition hover:text-[#063D35]">
              Settings
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
