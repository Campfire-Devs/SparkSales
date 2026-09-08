import { useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  Coins,
  Plus,
  ShoppingBag,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageTemplate from "../components/ui/PageTemplate";
import { useSparkSales } from "../context/SparkSalesContext";
import {
  formatCurrency,
  formatDate,
  SALE_CATEGORIES,
  saleTotal,
} from "../utils/sparkSales";

const COLORS = [
  "#063D35",
  "#4FAF9D",
  "#7FCFC0",
  "#D28A4A",
  "#E34D5A",
];

function Stat({
  label,
  value,
  hint,
  icon: Icon,
  primary = false,
  tone = "normal",
}) {
  const valueClass =
    tone === "negative"
      ? "text-red-500"
      : tone === "positive"
        ? "text-emerald-600"
        : "text-[#063D35]";

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
        primary
          ? "border-[#063D35] bg-[#063D35] text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              primary
                ? "text-[#B8F2E6]"
                : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-2 text-2xl font-extrabold ${
              primary
                ? "text-white"
                : valueClass
            }`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-xs ${
              primary
                ? "text-slate-300"
                : "text-slate-500"
            }`}
          >
            {hint}
          </p>
        </div>

        <div
          className={`rounded-full p-2.5 ${
            primary
              ? "bg-white/15 text-[#B8F2E6]"
              : "bg-[#B8F2E6] text-[#063D35]"
          }`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const {
    sales,
    expenses,
    totals,
    business,
  } = useSparkSales();

  const [showSale, setShowSale] = useState(false);

  const daily = useMemo(() => {
    const grouped = new Map();

    sales.forEach((sale) => {
      const current = grouped.get(sale.date) || {
        date: sale.date,
        revenue: 0,
        expenses: 0,
      };

      current.revenue += saleTotal(sale);

      grouped.set(sale.date, current);
    });

    expenses.forEach((expense) => {
      const current = grouped.get(expense.date) || {
        date: expense.date,
        revenue: 0,
        expenses: 0,
      };

      current.expenses += Number(
        expense.amount || 0
      );

      grouped.set(expense.date, current);
    });

    return [...grouped.values()].sort(
      (a, b) => a.date.localeCompare(b.date)
    );
  }, [sales, expenses]);

  const categories = useMemo(() => {
    const grouped = new Map();

    sales.forEach((sale) => {
      grouped.set(
        sale.category,
        (grouped.get(sale.category) || 0) +
          saleTotal(sale)
      );
    });

    return [...grouped.entries()]
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [sales]);

  const recent = useMemo(
    () =>
      [...sales]
        .sort((a, b) =>
          b.date.localeCompare(a.date)
        )
        .slice(0, 5),
    [sales]
  );

  return (
    <>
      <PageTemplate
        title="Trading day overview"
        description={`${
          business?.name ||
          "Your business"
        } — everything your stall earned, spent and kept.`}
        action={
          <button
            type="button"
            onClick={() => setShowSale(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#063D35] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#052f29]"
          >
            <Plus size={17} />
            New sale
          </button>
        }
      />

      {/* Primary financial stats */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Revenue"
          value={formatCurrency(
            totals.revenue
          )}
          hint={`${totals.transactions} sales logged`}
          icon={TrendingUp}
          primary
        />

        <Stat
          label="Expenses"
          value={formatCurrency(
            totals.expenses
          )}
          hint={`${expenses.length} costs recorded`}
          icon={Wallet}
        />

        <Stat
          label="Gross profit"
          value={formatCurrency(
            totals.grossProfit
          )}
          hint={`${totals.margin.toFixed(
            1
          )}% margin`}
          icon={Coins}
          tone={
            totals.grossProfit >= 0
              ? "positive"
              : "negative"
          }
        />

        <Stat
          label="Commission (5%)"
          value={formatCurrency(
            totals.commission
          )}
          hint={
            totals.grossProfit > 0
              ? "Earned on positive profit"
              : "No commission yet"
          }
          icon={Award}
        />
      </section>

      {/* Secondary stats */}
      <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat
          label="Net profit after commission"
          value={formatCurrency(
            totals.netProfit
          )}
          hint="Gross profit minus commission"
          icon={BarChart3}
          tone={
            totals.netProfit >= 0
              ? "positive"
              : "negative"
          }
        />

        <Stat
          label="Average sale value"
          value={formatCurrency(
            totals.averageSale
          )}
          hint={`${totals.unitsSold} units sold`}
          icon={ShoppingBag}
        />
      </section>

      {/* Charts */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-bold text-[#063D35]">
            Revenue vs expenses by day
          </h2>

          <p className="text-sm text-slate-500">
            Daily trading performance across the event.
          </p>

          <div className="mt-4 h-64">
            {daily.length ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={daily}>
                  <defs>
                    <linearGradient
                      id="sparkRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#7FCFC0"
                        stopOpacity="0.7"
                      />

                      <stop
                        offset="100%"
                        stopColor="#7FCFC0"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      value.slice(5)
                    }
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      `R${value}`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#063D35"
                    strokeWidth={2}
                    fill="url(#sparkRevenue)"
                  />

                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#E34D5A"
                    strokeWidth={2}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-slate-400">
                  No trading data yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-bold text-[#063D35]">
            Revenue by category
          </h2>

          <div className="mt-2 h-52">
            {categories.length ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {categories.map(
                      (category, index) => (
                        <Cell
                          key={category.name}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm text-slate-400">
                  No sales yet.
                </p>
              </div>
            )}
          </div>

          <ul className="mt-2 space-y-1.5">
            {categories.map(
              (category, index) => (
                <li
                  key={category.name}
                  className="flex justify-between text-sm"
                >
                  <span>
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        background:
                          COLORS[
                            index %
                              COLORS.length
                          ],
                      }}
                    />

                    {category.name}
                  </span>

                  <span className="text-slate-500">
                    {formatCurrency(
                      category.value
                    )}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>
      </section>

      {/* Recent sales */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <h2 className="font-bold text-[#063D35]">
            Recent sales
          </h2>

          <Link
            to="/sales"
            className="text-sm font-semibold text-[#063D35] transition hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length ? (
          <div className="divide-y divide-slate-100">
            {recent.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#063D35]">
                    {sale.product}
                  </p>

                  <p className="text-xs text-slate-500">
                    {sale.seller} ·{" "}
                    {formatDate(sale.date)} ·{" "}
                    {sale.quantity} units
                  </p>
                </div>

                <strong className="text-[#063D35]">
                  {formatCurrency(
                    saleTotal(sale)
                  )}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-400">
            No sales recorded yet.
          </div>
        )}
      </section>

      {showSale && (
        <SaleQuickForm
          onClose={() => setShowSale(false)}
        />
      )}
    </>
  );
}

function SaleQuickForm({ onClose }) {
  const { addSale } = useSparkSales();

  const [form, setForm] = useState({
    product: "",
    category: SALE_CATEGORIES[0],
    quantity: "1",
    unitPrice: "",
    date: new Date()
      .toISOString()
      .slice(0, 10),
    seller: "",
  });

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    const quantity = Number(
      form.quantity
    );

    const unitPrice = Number(
      form.unitPrice
    );

    if (!form.product.trim()) {
      return;
    }

    if (!form.seller.trim()) {
      return;
    }

    if (
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {
      return;
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      return;
    }

    addSale({
      product: form.product.trim(),
      category: form.category,
      quantity,
      unitPrice,
      date: form.date,
      seller: form.seller.trim(),
    });

    onClose();
  };

  return (
    <Modal
      title="Record a new sale"
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="grid gap-3 sm:grid-cols-2"
      >
        <Field
          label="Product"
          value={form.product}
          onChange={(value) =>
            updateField(
              "product",
              value
            )
          }
          placeholder="e.g. Cookie Boxes"
        />

        <Field
          label="Seller"
          value={form.seller}
          onChange={(value) =>
            updateField(
              "seller",
              value
            )
          }
          placeholder="e.g. Amara"
        />

        <Field
          label="Quantity"
          type="number"
          min="1"
          step="1"
          value={form.quantity}
          onChange={(value) =>
            updateField(
              "quantity",
              value
            )
          }
        />

        <Field
          label="Unit price (R)"
          type="number"
          min="0"
          step="0.01"
          value={form.unitPrice}
          onChange={(value) =>
            updateField(
              "unitPrice",
              value
            )
          }
          placeholder="0.00"
        />

        <Field
          label="Date"
          type="date"
          value={form.date}
          onChange={(value) =>
            updateField(
              "date",
              value
            )
          }
        />

        <label className="text-sm font-semibold text-[#063D35]">
          Category

          <select
            value={form.category}
            onChange={(event) =>
              updateField(
                "category",
                event.target.value
              )
            }
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#B8F2E6]"
          >
            {SALE_CATEGORIES.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>
        </label>

        <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052f29]"
          >
            Save sale
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  ...props
}) {
  return (
    <label className="text-sm font-semibold text-[#063D35]">
      {label}

      <input
        {...props}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#B8F2E6]"
        required
      />
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#063D35]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2
            id="dashboard-modal-title"
            className="text-xl font-extrabold text-[#063D35]"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#063D35]"
            aria-label="Close dialog"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Dashboard;