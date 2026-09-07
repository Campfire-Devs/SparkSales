import { ArrowRight, BarChart3, Receipt, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-spark-neutral">
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-spark-primary">
            SparkSales
          </h1>

          <p className="text-xs text-spark-secondary">
            Ignite Your Earnings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-spark-primary hover:bg-spark-neutral"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-spark-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full bg-spark-tertiary px-4 py-2 text-sm font-semibold text-spark-primary">
          <Sparkles size={16} />
          Built for Student Entrepreneurs
        </div>

        <h2 className="max-w-4xl text-5xl font-black tracking-tight text-spark-primary md:text-6xl">
          Know your numbers.
          <span className="block text-spark-secondary">
            Grow your business.
          </span>
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          SparkSales makes it simple for student entrepreneurs to track sales,
          manage expenses, calculate profit and understand their business
          performance during Entrepreneurship Day.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 rounded-xl bg-spark-primary px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            Start Tracking
            <ArrowRight size={18} />
          </Link>

          <Link
            to="/login"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-spark-primary hover:bg-gray-50"
          >
            Login
          </Link>
        </div>

        <div className="mt-20 grid w-full gap-5 md:grid-cols-3">
          <Feature
            icon={<Receipt />}
            title="Track Sales"
            description="Record every transaction and keep your revenue organised."
          />

          <Feature
            icon={<BarChart3 />}
            title="Understand Profit"
            description="See your revenue, expenses, commission and final profit."
          />

          <Feature
            icon={<Sparkles />}
            title="Trade Smarter"
            description="Use your numbers to make better decisions throughout the day."
          />
        </div>
      </section>
    </div>
  );
};

const Feature = ({ icon, title, description }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-spark-tertiary text-spark-primary">
        {icon}
      </div>

      <h3 className="font-bold text-spark-primary">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default Landing;