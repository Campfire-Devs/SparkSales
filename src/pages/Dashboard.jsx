/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  CreditCard,
  FileBarChart,
  Plus,
  Receipt,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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

const PAYMENT_METHODS = [
  "Cash",
  "Card",
  "EFT",
  "Mobile Money",
  "Other",
];

const spring = {
  type: "spring",
  stiffness: 280,
  damping: 24,
  mass: 0.8,
};

const pageVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: spring,
  },
};

const softItemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

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
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -4,
        transition: spring,
      }}
      className={`group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-lg sm:p-5 ${
        primary
          ? "border-[#063D35] bg-[#063D35] text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      {primary && (
        <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#7FCFC0]/10 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between gap-3">
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
            className={`mt-2 text-2xl font-extrabold tracking-tight ${
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

        <motion.div
          whileHover={{
            rotate: 8,
            scale: 1.08,
          }}
          transition={spring}
          className={`rounded-xl p-2.5 ${
            primary
              ? "bg-white/10 text-[#B8F2E6]"
              : "bg-[#B8F2E6] text-[#063D35]"
          }`}
        >
          <Icon size={18} />
        </motion.div>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const {
    sales,
    expenses,
    totals,
    business,
  } = useSparkSales();

  const [showSale, setShowSale] =
    useState(false);

  const daily = useMemo(() => {
    const grouped = new Map();

    sales.forEach((sale) => {
      const current =
        grouped.get(sale.date) || {
          date: sale.date,
          revenue: 0,
          expenses: 0,
        };

      current.revenue += saleTotal(sale);
      grouped.set(sale.date, current);
    });

    expenses.forEach((expense) => {
      const current =
        grouped.get(expense.date) || {
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
      (a, b) =>
        a.date.localeCompare(b.date)
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
      .sort(
        (a, b) => b.value - a.value
      );
  }, [sales]);

  const expenseCategories = useMemo(() => {
    const grouped = new Map();

    expenses.forEach((expense) => {
      grouped.set(
        expense.category,
        (grouped.get(expense.category) || 0) +
          Number(expense.amount || 0)
      );
    });

    return [...grouped.entries()]
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort(
        (a, b) => b.amount - a.amount
      );
  }, [expenses]);

  const paymentMethods = useMemo(() => {
    const grouped = new Map();

    sales.forEach((sale) => {
      const method =
        sale.paymentMethod ||
        "Not recorded";

      grouped.set(
        method,
        (grouped.get(method) || 0) +
          saleTotal(sale)
      );
    });

    return [...grouped.entries()]
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) => b.value - a.value
      );
  }, [sales]);

  const recentTransactions =
    useMemo(() => {
      const saleTransactions = sales.map(
        (sale) => ({
          id: `sale-${sale.id}`,
          type: "sale",
          date: sale.date,
          title: sale.product,
          subtitle: `${sale.seller} · ${sale.quantity} units`,
          amount: saleTotal(sale),
        })
      );

      const expenseTransactions =
        expenses.map((expense) => ({
          id: `expense-${expense.id}`,
          type: "expense",
          date: expense.date,
          title: expense.item,
          subtitle: expense.category,
          amount: Number(
            expense.amount || 0
          ),
        }));

      return [
        ...saleTransactions,
        ...expenseTransactions,
      ]
        .sort((a, b) =>
          b.date.localeCompare(a.date)
        )
        .slice(0, 6);
    }, [sales, expenses]);

  const sellerPerformance = useMemo(() => {
    const grouped = new Map();

    sales.forEach((sale) => {
      grouped.set(
        sale.seller,
        (grouped.get(sale.seller) || 0) +
          saleTotal(sale)
      );
    });

    return [...grouped.entries()]
      .map(([seller, revenue]) => ({
        seller,
        revenue,
      }))
      .sort(
        (a, b) => b.revenue - a.revenue
      );
  }, [sales]);

  const topSeller = sellerPerformance[0];
  const topCategory = categories[0];
  const biggestExpense =
    expenseCategories[0];

  const businessHealth = useMemo(() => {
    const margin = totals.margin;

    if (totals.revenue === 0) {
      return {
        label: "Waiting for sales",
        description:
          "Record your first sale to start tracking business performance.",
        score: 0,
        icon: Target,
        tone: "neutral",
      };
    }

    if (totals.netProfit < 0) {
      return {
        label: "Needs attention",
        description:
          "Expenses are currently higher than your post-commission earnings.",
        score: Math.max(
          10,
          Math.round(50 + margin)
        ),
        icon: TrendingDown,
        tone: "negative",
      };
    }

    if (margin >= 40) {
      return {
        label: "Excellent performance",
        description:
          "Your business is maintaining a strong profit margin.",
        score: Math.min(
          100,
          Math.round(70 + margin / 3)
        ),
        icon: Sparkles,
        tone: "positive",
      };
    }

    if (margin >= 20) {
      return {
        label: "Healthy performance",
        description:
          "Your business is profitable with room to grow its margin.",
        score: Math.min(
          100,
          Math.round(60 + margin)
        ),
        icon: TrendingUp,
        tone: "positive",
      };
    }

    return {
      label: "Profitable",
      description:
        "Your business is in the green, but there is room to improve profitability.",
      score: Math.min(
        100,
        Math.round(55 + margin)
      ),
      icon: CheckCircle2,
      tone: "positive",
    };
  }, [totals]);

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero */}
        <motion.section
          variants={itemVariants}
          className="mb-6 overflow-hidden rounded-3xl border border-[#0d594e]/10 bg-[#063D35] p-5 text-white shadow-lg sm:p-6 lg:p-7"
        >
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#B8F2E6]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7FCFC0]" />
                Trading dashboard
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Welcome to your
                <span className="block text-[#B8F2E6]">
                  trading day.
                </span>
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                {business?.name ||
                  "Your business"}{" "}
                — a live view of what you have
                earned, spent and kept.
              </p>
            </div>

            <div className="relative flex flex-wrap gap-2">
              <motion.button
                type="button"
                onClick={() =>
                  setShowSale(true)
                }
                whileHover={{
                  y: -2,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                transition={spring}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#063D35] shadow-sm"
              >
                <Plus size={17} />
                Record sale
              </motion.button>

              <motion.div
                whileHover={{
                  y: -2,
                }}
                transition={spring}
              >
                <Link
                  to="/reports"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <FileBarChart size={17} />
                  View reports
                </Link>
              </motion.div>
            </div>

            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#7FCFC0]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/2 h-44 w-44 rounded-full bg-[#B8F2E6]/5 blur-3xl" />
          </div>
        </motion.section>

        {/* Financial summary */}
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

        {/* Secondary summary */}
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

        {/* Business health + quick insights */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1.95fr]">
          <motion.div
            variants={softItemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Trading pulse
                </p>

                <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
                  Business health
                </h2>
              </div>

              <div className="rounded-xl bg-[#E6F7F3] p-2.5 text-[#063D35]">
                <businessHealth.icon
                  size={19}
                />
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p
                  className={`text-2xl font-extrabold ${
                    businessHealth.tone ===
                    "negative"
                      ? "text-red-500"
                      : businessHealth.tone ===
                          "positive"
                        ? "text-emerald-600"
                        : "text-[#063D35]"
                  }`}
                >
                  {businessHealth.label}
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {businessHealth.description}
                </p>
              </div>

              <span className="text-3xl font-black text-[#063D35]">
                {businessHealth.score}
              </span>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs font-semibold text-slate-400">
                <span>Business health score</span>
                <span>
                  {businessHealth.score}/100
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${businessHealth.score}%`,
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeOut",
                    delay: 0.35,
                  }}
                  className="h-full rounded-full bg-[#063D35]"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={softItemVariants}
            className="grid gap-3 sm:grid-cols-3"
          >
            <InsightCard
              label="Top category"
              value={
                topCategory?.name ||
                "No data"
              }
              detail={
                topCategory
                  ? formatCurrency(
                      topCategory.value
                    )
                  : "Start recording sales"
              }
              icon={ShoppingBag}
            />

            <InsightCard
              label="Top seller"
              value={
                topSeller?.seller ||
                "No data"
              }
              detail={
                topSeller
                  ? formatCurrency(
                      topSeller.revenue
                    )
                  : "No seller data yet"
              }
              icon={Award}
            />

            <InsightCard
              label="Largest expense"
              value={
                biggestExpense?.category ||
                "No data"
              }
              detail={
                biggestExpense
                  ? formatCurrency(
                      biggestExpense.amount
                    )
                  : "No expenses yet"
              }
              icon={Receipt}
            />
          </motion.div>
        </section>

        {/* Revenue chart */}
        <motion.section
          variants={softItemVariants}
          className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-[#063D35]">
                  Revenue performance
                </h2>

                <span className="rounded-full bg-[#E6F7F3] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#063D35]">
                  Live
                </span>
              </div>

              <p className="mt-0.5 text-sm text-slate-500">
                Revenue and expenses across each
                trading day.
              </p>
            </div>

            <div className="flex gap-3 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#063D35]" />
                Revenue
              </span>

              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#E34D5A]" />
                Expenses
              </span>
            </div>
          </div>

          <div className="h-80 px-2 pb-4 pt-4 sm:px-4">
            {daily.length ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={daily}
                  margin={{
                    top: 8,
                    right: 8,
                    left: -12,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="dashboardRevenueFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#7FCFC0"
                        stopOpacity="0.72"
                      />
                      <stop
                        offset="100%"
                        stopColor="#7FCFC0"
                        stopOpacity="0.04"
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
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      `R${value}`
                    }
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#7FCFC0",
                      strokeDasharray: "4 4",
                    }}
                    contentStyle={{
                      borderRadius: "12px",
                      border:
                        "1px solid #e2e8f0",
                      boxShadow:
                        "0 10px 30px rgba(6,61,53,0.08)",
                    }}
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#063D35"
                    strokeWidth={2.5}
                    fill="url(#dashboardRevenueFill)"
                    animationDuration={1100}
                    animationEasing="ease-out"
                  />

                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#E34D5A"
                    strokeWidth={2}
                    fill="transparent"
                    animationDuration={1100}
                    animationBegin={150}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyPanel message="Record sales and expenses to see your trading performance." />
            )}
          </div>
        </motion.section>

        {/* Expense + payment analytics */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          <motion.div
            variants={softItemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#063D35]">
                  Expense breakdown
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  See where your business is spending
                  money.
                </p>
              </div>

              <div className="rounded-xl bg-[#FDECEF] p-2.5 text-[#E34D5A]">
                <Receipt size={18} />
              </div>
            </div>

            <div className="mt-5 h-64">
              {expenseCategories.length ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={expenseCategories}
                    margin={{
                      top: 6,
                      right: 8,
                      left: -12,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "#64748b",
                      }}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        `R${value}`
                      }
                      tick={{
                        fontSize: 10,
                        fill: "#64748b",
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border:
                          "1px solid #e2e8f0",
                        boxShadow:
                          "0 10px 30px rgba(6,61,53,0.08)",
                      }}
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                    />

                    <Bar
                      dataKey="amount"
                      name="Expenses"
                      fill="#E34D5A"
                      radius={[7, 7, 0, 0]}
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyPanel message="No expenses recorded yet." />
              )}
            </div>
          </motion.div>

          <motion.div
            variants={softItemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#063D35]">
                  Payment methods
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Revenue by payment method.
                </p>
              </div>

              <div className="rounded-xl bg-[#E6F7F3] p-2.5 text-[#063D35]">
                <CreditCard size={18} />
              </div>
            </div>

            <div className="mt-2 h-52">
              {paymentMethods.length ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={46}
                      outerRadius={76}
                      paddingAngle={3}
                      animationDuration={1000}
                      animationBegin={120}
                    >
                      {paymentMethods.map(
                        (method, index) => (
                          <Cell
                            key={method.name}
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
                      contentStyle={{
                        borderRadius: "12px",
                        border:
                          "1px solid #e2e8f0",
                        boxShadow:
                          "0 10px 30px rgba(6,61,53,0.08)",
                      }}
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyPanel message="Payment information will appear here." />
              )}
            </div>

            <div className="space-y-2">
              {paymentMethods.map(
                (method, index) => (
                  <div
                    key={method.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-600">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background:
                            COLORS[
                              index %
                                COLORS.length
                            ],
                        }}
                      />

                      {method.name}
                    </span>

                    <span className="font-semibold text-[#063D35]">
                      {formatCurrency(
                        method.value
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </section>

        {/* Revenue categories + seller performance */}
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <motion.div
            variants={softItemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#063D35]">
                  Revenue by category
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Which products and services are
                  driving revenue.
                </p>
              </div>

              <div className="rounded-xl bg-[#E6F7F3] p-2.5 text-[#063D35]">
                <CircleDollarSign size={18} />
              </div>
            </div>

            <div className="mt-2 grid gap-4 sm:grid-cols-[0.95fr_1fr] sm:items-center">
              <div className="h-56">
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
                        innerRadius={48}
                        outerRadius={82}
                        paddingAngle={3}
                        animationDuration={1000}
                      >
                        {categories.map(
                          (
                            category,
                            index
                          ) => (
                            <Cell
                              key={
                                category.name
                              }
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
                        contentStyle={{
                          borderRadius: "12px",
                          border:
                            "1px solid #e2e8f0",
                        }}
                        formatter={(value) =>
                          formatCurrency(
                            value
                          )
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyPanel message="No sales yet." />
                )}
              </div>

              <div className="space-y-2">
                {categories.map(
                  (
                    category,
                    index
                  ) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background:
                              COLORS[
                                index %
                                  COLORS.length
                              ],
                          }}
                        />

                        <span className="text-slate-600">
                          {category.name}
                        </span>
                      </span>

                      <span className="font-semibold text-[#063D35]">
                        {formatCurrency(
                          category.value
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={softItemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#063D35]">
                  Seller performance
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Revenue contribution by team member.
                </p>
              </div>

              <div className="rounded-xl bg-[#E6F7F3] p-2.5 text-[#063D35]">
                <Award size={18} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {sellerPerformance.length ? (
                sellerPerformance
                  .slice(0, 5)
                  .map((seller, index) => {
                    const percentage =
                      totals.revenue
                        ? (seller.revenue /
                            totals.revenue) *
                          100
                        : 0;

                    return (
                      <motion.div
                        key={seller.seller}
                        initial={{
                          opacity: 0,
                          x: 10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            0.25 +
                            index *
                              0.05,
                        }}
                      >
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-[#063D35]">
                            {index + 1}.{" "}
                            {seller.seller}
                          </span>

                          <span className="font-bold text-[#063D35]">
                            {formatCurrency(
                              seller.revenue
                            )}
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${percentage}%`,
                            }}
                            transition={{
                              duration: 0.8,
                              delay:
                                0.2 +
                                index *
                                  0.05,
                            }}
                            className="h-full rounded-full bg-[#063D35]"
                          />
                        </div>
                      </motion.div>
                    );
                  })
              ) : (
                <EmptyPanel message="Seller performance will appear once sales are recorded." />
              )}
            </div>
          </motion.div>
        </section>

        {/* Recent transactions */}
        <motion.section
          variants={softItemVariants}
          className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="font-bold text-[#063D35]">
                Recent transactions
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Your latest sales and expenses in
                one place.
              </p>
            </div>

            <Link
              to="/sales"
              className="text-sm font-semibold text-[#063D35] transition hover:underline"
            >
              View sales
            </Link>
          </div>

          {recentTransactions.length ? (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map(
                (transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        0.25 +
                        index * 0.05,
                    }}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          transaction.type ===
                          "sale"
                            ? "bg-[#E6F7F3] text-[#063D35]"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {transaction.type ===
                        "sale" ? (
                          <ArrowUpRight
                            size={16}
                          />
                        ) : (
                          <ArrowDownRight
                            size={16}
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#063D35]">
                          {transaction.title}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {
                            transaction.subtitle
                          }{" "}
                          ·{" "}
                          {formatDate(
                            transaction.date
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-sm font-bold sm:text-base ${
                        transaction.type ===
                        "sale"
                          ? "text-emerald-600"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type ===
                      "sale"
                        ? "+"
                        : "-"}
                      {formatCurrency(
                        transaction.amount
                      )}
                    </span>
                  </motion.div>
                )
              )}
            </div>
          ) : (
            <EmptyPanel message="No transactions recorded yet." />
          )}
        </motion.section>

        {/* Quick actions */}
        <motion.section
          variants={softItemVariants}
          className="mt-6"
        >
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quick actions
              </p>

              <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
                Keep your trading day moving
              </h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <QuickAction
              icon={Plus}
              title="Record a sale"
              description="Add a new customer transaction."
              onClick={() =>
                setShowSale(true)
              }
              primary
            />

            <QuickAction
              icon={Receipt}
              title="Add an expense"
              description="Track a new business cost."
              to="/expenses"
            />

            <QuickAction
              icon={FileBarChart}
              title="Open reports"
              description="Review detailed performance."
              to="/reports"
            />
          </div>
        </motion.section>
      </motion.div>

      <AnimatePresence>
        {showSale && (
          <SaleQuickForm
            onClose={() =>
              setShowSale(false)
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}

function InsightCard({
  label,
  value,
  detail,
  icon: Icon,
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        transition: spring,
      }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 truncate text-lg font-extrabold text-[#063D35]">
            {value}
          </p>

          <p className="mt-0.5 text-sm font-semibold text-emerald-600">
            {detail}
          </p>
        </div>

        <div className="rounded-xl bg-[#E6F7F3] p-2.5 text-[#063D35]">
          <Icon size={17} />
        </div>
      </div>
    </motion.div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  to,
  onClick,
  primary = false,
}) {
  const content = (
    <>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          primary
            ? "bg-white/15 text-[#B8F2E6]"
            : "bg-[#E6F7F3] text-[#063D35]"
        }`}
      >
        <Icon size={18} />
      </div>

      <div>
        <p
          className={`font-bold ${
            primary
              ? "text-white"
              : "text-[#063D35]"
          }`}
        >
          {title}
        </p>

        <p
          className={`mt-0.5 text-xs ${
            primary
              ? "text-slate-300"
              : "text-slate-500"
          }`}
        >
          {description}
        </p>
      </div>
    </>
  );

  if (to) {
    return (
      <motion.div
        whileHover={{
          y: -3,
        }}
        whileTap={{
          scale: 0.99,
        }}
        transition={spring}
      >
        <Link
          to={to}
          className={`flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition ${
            primary
              ? "border-[#063D35] bg-[#063D35]"
              : "border-slate-200 bg-white hover:shadow-md"
          }`}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{
        y: -3,
      }}
      whileTap={{
        scale: 0.99,
      }}
      transition={spring}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left shadow-sm transition ${
        primary
          ? "border-[#063D35] bg-[#063D35]"
          : "border-slate-200 bg-white hover:shadow-md"
      }`}
    >
      {content}
    </motion.button>
  );
}

function EmptyPanel({ message }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200">
      <p className="max-w-sm px-4 text-center text-sm text-slate-400">
        {message}
      </p>
    </div>
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
    paymentMethod:
      PAYMENT_METHODS[0],
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
      paymentMethod:
        form.paymentMethod,
    });

    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#063D35]/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-modal-title"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 24,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 12,
          scale: 0.98,
        }}
        transition={spring}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/50 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#7FCFC0]">
              Quick action
            </p>

            <h2
              id="dashboard-modal-title"
              className="mt-1 text-xl font-extrabold text-[#063D35]"
            >
              Record a new sale
            </h2>
          </div>

          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{
              scale: 1.05,
              rotate: 4,
            }}
            whileTap={{
              scale: 0.95,
            }}
            transition={spring}
            className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#063D35]"
            aria-label="Close dialog"
            title="Close"
          >
            <X size={18} />
          </motion.button>
        </div>

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

          <label className="text-sm font-semibold text-[#063D35] sm:col-span-2">
            Payment method

            <select
              value={
                form.paymentMethod
              }
              onChange={(event) =>
                updateField(
                  "paymentMethod",
                  event.target.value
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#B8F2E6]"
            >
              {PAYMENT_METHODS.map(
                (method) => (
                  <option
                    key={method}
                    value={method}
                  >
                    {method}
                  </option>
                )
              )}
            </select>
          </label>

          <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{
                y: -1,
              }}
              whileTap={{
                scale: 0.98,
              }}
              transition={spring}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </motion.button>

            <motion.button
              type="submit"
              whileHover={{
                y: -1,
                scale: 1.01,
              }}
              whileTap={{
                scale: 0.98,
              }}
              transition={spring}
              className="rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052f29]"
            >
              Save sale
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
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
          onChange(
            event.target.value
          )
        }
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-700 outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#B8F2E6]"
        required
      />
    </label>
  );
}

export default Dashboard;