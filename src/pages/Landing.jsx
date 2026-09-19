import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Receipt,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { Link } from "react-router-dom";

import logo from "../assets/sparksales-logo.png";

const Landing = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7FAF9] text-[#063D35]">
      {/* ===================================================== */}
      {/* NAVBAR                                                */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/"
            className="group flex items-center"
            aria-label="SparkSales home"
          >
            <img
              src={logo}
              alt="SparkSales"
              className="h-11 w-auto object-contain transition duration-200 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#063D35] transition hover:bg-[#F7FAF9]"
            >
              Sign in
            </Link>

            <Link
              to="/register-business"
              className="inline-flex items-center gap-2 rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#052F29] hover:shadow-md"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* ===================================================== */}
      {/* HERO                                                   */}
      {/* ===================================================== */}

      <main>
        <section className="relative overflow-hidden">
          {/* Background glow */}
          <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#B8F2E6]/40 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#7FCFC0]/20 blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7FCFC0]/40 bg-[#B8F2E6]/70 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#063D35] shadow-sm">
                <Sparkles size={14} />
                Built for Entrepreneurs
                <Sparkles size={14} />
              </div>

              {/* Heading */}
              <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-[-0.045em] text-[#063D35] sm:text-6xl lg:text-7xl">
                Know your numbers.
                <span className="mt-2 block text-[#4FAF9D]">
                  Grow your business.
                </span>
              </h1>

              {/* Supporting copy */}
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                SparkSales helps student businesses track sales, manage
                expenses, understand their profit and stay on top of their
                finances throughout Entrepreneurship Day.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/register-business"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#063D35] px-6 text-sm font-extrabold text-white shadow-lg shadow-[#063D35]/10 transition hover:-translate-y-0.5 hover:bg-[#052F29] hover:shadow-xl"
                >
                  Start tracking
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-extrabold text-[#063D35] shadow-sm transition hover:-translate-y-0.5 hover:border-[#B8F2E6] hover:bg-[#F7FAF9]"
                >
                  Sign in
                </Link>
              </div>

              {/* Trust line */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#4FAF9D]" />
                  Sales tracking
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#4FAF9D]" />
                  Expense tracking
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#4FAF9D]" />
                  Live profit view
                </span>
              </div>
            </div>

            {/* ================================================= */}
            {/* PRODUCT PREVIEW                                    */}
            {/* ================================================= */}

            <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
              <div className="relative">
                {/* Glow */}
                <div className="pointer-events-none absolute inset-x-10 -bottom-8 h-32 rounded-full bg-[#7FCFC0]/20 blur-3xl" />

                <div className="relative overflow-hidden rounded-[28px] border border-[#063D35]/10 bg-white shadow-[0_30px_80px_rgba(6,61,53,0.12)]">
                  {/* Fake browser header */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                    </div>

                    <div className="hidden rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-[10px] font-semibold text-slate-400 sm:block">
                      app.sparksales.local/dashboard
                    </div>

                    <div className="w-14" />
                  </div>

                  {/* Dashboard preview */}
                  <div className="p-4 sm:p-6 lg:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#43A99A]">
                          Trading dashboard
                        </p>

                        <h2 className="mt-1 text-xl font-black text-[#063D35] sm:text-2xl">
                          Your business at a glance.
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Revenue, expenses and profit in one place.
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#E6F7F3] px-3 py-2 text-xs font-bold text-[#063D35]">
                        Entrepreneurship Day
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                      <PreviewStat
                        label="Revenue"
                        value="R 2,450"
                        icon={TrendingUp}
                        primary
                      />

                      <PreviewStat
                        label="Expenses"
                        value="R 850"
                        icon={Receipt}
                      />

                      <PreviewStat
                        label="Commission"
                        value="R 80"
                        icon={WalletCards}
                      />

                      <PreviewStat
                        label="Net profit"
                        value="R 1,520"
                        icon={BarChart3}
                        positive
                      />
                    </div>

                    {/* Bottom preview */}
                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                      {/* Chart */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#063D35]">
                              Revenue performance
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Live business activity
                            </p>
                          </div>

                          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#43A99A] shadow-sm">
                            Live
                          </span>
                        </div>

                        <div className="mt-5 flex h-32 items-end gap-2">
                          {[34, 48, 42, 66, 54, 82, 96].map(
                            (height, index) => (
                              <div
                                key={index}
                                className="flex h-full flex-1 items-end"
                              >
                                <div
                                  className="w-full rounded-t-lg bg-[#7FCFC0]"
                                  style={{
                                    height: `${height}%`,
                                    opacity:
                                      0.35 + index * 0.09,
                                  }}
                                />
                              </div>
                            ),
                          )}
                        </div>

                        <div className="mt-3 flex justify-between text-[10px] font-semibold text-slate-400">
                          <span>09:00</span>
                          <span>10:00</span>
                          <span>11:00</span>
                          <span>12:00</span>
                          <span>13:00</span>
                        </div>
                      </div>

                      {/* Recent transactions */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#063D35]">
                            Recent transactions
                          </p>

                          <ChevronRight
                            size={15}
                            className="text-slate-400"
                          />
                        </div>

                        <div className="mt-3 space-y-3">
                          <PreviewTransaction
                            title="Brownie Box"
                            subtitle="Cash"
                            amount="+ R90"
                          />

                          <PreviewTransaction
                            title="Coffee"
                            subtitle="Card"
                            amount="+ R45"
                          />

                          <PreviewTransaction
                            title="Packaging"
                            subtitle="Expense"
                            amount="- R120"
                            expense
                          />

                          <PreviewTransaction
                            title="Lunch combo"
                            subtitle="EFT"
                            amount="+ R150"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* FEATURES                                               */}
        {/* ===================================================== */}

        <section className="border-y border-slate-200/70 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#43A99A]">
                Built around your trading day
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#063D35] sm:text-4xl">
                Everything you need to understand your numbers.
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
                Keep the financial side of your business simple while you
                focus on selling.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <FeatureCard
                icon={Receipt}
                number="01"
                title="Track every sale"
                description="Record products, quantities, prices and payment methods without slowing down your stall."
              />

              <FeatureCard
                icon={WalletCards}
                number="02"
                title="Control your costs"
                description="Capture your business expenses so your profit figure reflects what you actually spent."
              />

              <FeatureCard
                icon={BarChart3}
                number="03"
                title="Understand your profit"
                description="See revenue, expenses, commission and final profit as your trading day unfolds."
              />
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* HOW IT WORKS                                           */}
        {/* ===================================================== */}

        <section className="bg-[#F7FAF9]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#43A99A]">
                  Simple by design
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#063D35] sm:text-4xl">
                  From first sale to final profit.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                  SparkSales keeps the whole financial journey connected,
                  making it easier to know where your business stands during
                  Entrepreneurship Day.
                </p>

                <Link
                  to="/register-business"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#063D35]"
                >
                  Start your business
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StepCard
                  step="01"
                  title="Record"
                  text="Capture sales and expenses as they happen."
                />

                <StepCard
                  step="02"
                  title="Analyse"
                  text="Watch revenue, costs and profit update."
                />

                <StepCard
                  step="03"
                  title="Present"
                  text="Finish the day with clear financial results."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* FINAL CTA                                              */}
        {/* ===================================================== */}

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#063D35] shadow-xl">
            <div className="relative px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#7FCFC0]/15 blur-3xl" />

              <div className="relative max-w-2xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7FCFC0]">
                  Ignite your earnings
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Know what your business is actually making.
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                  Start tracking your numbers and turn your sales activity
                  into a clearer picture of your business performance.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/register-business"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#063D35] transition hover:-translate-y-0.5 hover:bg-[#F7FAF9]"
                  >
                    Get started
                    <ArrowRight size={17} />
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================================================== */}
      {/* FOOTER                                                 */}
      {/* ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="SparkSales"
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
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

            <span>© {new Date().getFullYear()} SparkSales</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ========================================================= */
/* COMPONENTS                                                */
/* ========================================================= */

function PreviewStat({
  label,
  value,
  icon: Icon,
  primary = false,
  positive = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-3.5 ${
        primary
          ? "border-[#0A594E] bg-[#063D35]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={`text-[10px] font-extrabold uppercase tracking-[0.12em] ${
            primary
              ? "text-[#B8F2E6]"
              : "text-slate-400"
          }`}
        >
          {label}
        </p>

        <Icon
          size={15}
          className={
            primary || positive
              ? "text-[#7FCFC0]"
              : "text-[#063D35]"
          }
        />
      </div>

      <p
        className={`mt-2 text-lg font-black ${
          primary ? "text-white" : "text-[#063D35]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PreviewTransaction({
  title,
  subtitle,
  amount,
  expense = false,
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-slate-700">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
          {subtitle}
        </p>
      </div>

      <span
        className={`shrink-0 text-xs font-extrabold ${
          expense
            ? "text-red-500"
            : "text-[#063D35]"
        }`}
      >
        {amount}
      </span>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  number,
  title,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-[#F7FAF9] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#B8F2E6] hover:bg-white hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B8F2E6] text-[#063D35] transition group-hover:bg-[#063D35] group-hover:text-[#B8F2E6]">
          <Icon size={19} />
        </div>

        <span className="text-xs font-black tracking-[0.14em] text-slate-300">
          {number}
        </span>
      </div>

      <h3 className="mt-5 text-base font-extrabold text-[#063D35]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black tracking-[0.16em] text-[#43A99A]">
        {step}
      </p>

      <h3 className="mt-2 font-extrabold text-[#063D35]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

export default Landing;