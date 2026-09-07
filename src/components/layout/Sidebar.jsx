import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  const navLinkClass = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-[#E6F7F3] text-[#064E46]"
        : "text-slate-600 hover:bg-slate-50 hover:text-[#064E46]"
    }`;

  return (
    <aside className="hidden min-h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">

          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <div className="space-y-1">

            {/* Dashboard */}
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard size={19} />
              Dashboard
            </NavLink>

            {/* Sales */}
            <NavLink to="/sales" className={navLinkClass}>
              <ShoppingBag size={19} />
              Sales
            </NavLink>

            {/* Expenses */}
            <NavLink to="/expenses" className={navLinkClass}>
              <CreditCard size={19} />
              Expenses
            </NavLink>

            {/* Reports */}
            <NavLink to="/reports" className={navLinkClass}>
              <BarChart3 size={19} />
              Reports
            </NavLink>

          </div>

          {/* Account */}
          <div className="mt-8 border-t border-slate-100 pt-6">

            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account
            </p>

            {/* Settings */}
            <NavLink to="/settings" className={navLinkClass}>
              <Settings size={19} />
              Settings
            </NavLink>

          </div>

        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-4">

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Log out
          </button>

        </div>

      </div>
    </aside>
  );
}

export default Sidebar;