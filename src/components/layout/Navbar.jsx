import { Bell, User } from "lucide-react";

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">

        {/* Logo */}
        <div>
          <h1 className="text-xl font-bold text-[#064E46]">
            SparkSales
          </h1>
          <p className="text-xs text-slate-400">
            Ignite Your Earnings
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">

          {/* Notifications */}
          <button
            type="button"
            className="relative text-slate-500 transition hover:text-[#064E46]"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          {/* User */}
          <button
            type="button"
            className="flex items-center gap-2 text-slate-600 transition hover:text-[#064E46]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B8F2E6] text-[#064E46]">
              <User size={18} />
            </div>

            <span className="hidden text-sm font-medium sm:block">
              Business Owner
            </span>
          </button>

        </div>

      </div>
    </header>
  );
}

export default Navbar;