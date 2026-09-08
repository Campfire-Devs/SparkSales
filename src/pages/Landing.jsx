import {
  ArrowRight,
  BarChart3,
  Receipt,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => (
  <div className="min-h-screen bg-[#F7FAF9] text-[#063D35]">
    <nav className="border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063D35] text-lg font-extrabold text-[#B8F2E6]">
            S
          </div>
          <div className="leading-tight">
            <div className="font-extrabold">SparkSales</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Ignite Your Earnings
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#063D35] hover:bg-[#F7FAF9]"
          >
            Login
          </Link>
          <Link
            to="/register-business"
            className="rounded-xl bg-[#063D35] px-4 py-2 text-sm font-bold text-white hover:bg-[#052f29]"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#B8F2E6] px-4 py-2 text-sm font-bold">
          <Sparkles size={16} /> Built for Student Entrepreneurs
        </div>
        <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl">
          Know your numbers.
          <span className="block text-[#4FAF9D]">Grow your business.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
          SparkSales helps student teams record sales, manage expenses,
          calculate the 5% commission and understand their profit during
          Entrepreneurship Day.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/register-business"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063D35] px-6 py-3 font-bold text-white shadow-sm hover:bg-[#052f29]"
          >
            Start tracking <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-[#063D35] hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-3">
        <Feature
          icon={<Receipt />}
          title="Track sales"
          text="Record every transaction and keep your revenue organised."
        />
        <Feature
          icon={<BarChart3 />}
          title="Understand profit"
          text="See revenue, expenses, commission and final profit at a glance."
        />
        <Feature
          icon={<TrendingUp />}
          title="Trade smarter"
          text="Use live numbers to make better decisions throughout the event."
        />
      </div>
      <div className="mt-6 rounded-3xl bg-[#063D35] p-6 text-white sm:p-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <Mini label="Sales" text="Log and edit transactions" />
          <Mini label="Expenses" text="Keep every cost accountable" />
          <Mini label="Reports" text="Export your event results" />
        </div>
      </div>
    </section>
  </div>
);
const Feature = ({ icon, title, text }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#B8F2E6] text-[#063D35]">
      {icon}
    </div>
    <h2 className="font-extrabold">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
  </div>
);
const Mini = ({ label, text }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wider text-[#7FCFC0]">
      {label}
    </p>
    <p className="mt-1 text-sm text-slate-200">{text}</p>
  </div>
);
export default Landing;
