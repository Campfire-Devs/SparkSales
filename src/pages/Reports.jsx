import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  FileBarChart2,
  Printer,
  Receipt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageTemplate from "../components/ui/PageTemplate";
import { useSparkSales } from "../context/SparkSalesContext";
import {
  COMMISSION_RATE,
  formatCurrency,
  formatDate,
  saleTotal,
} from "../utils/sparkSales";

const REPORT_RANGES = {
  all: "All time",
  today: "Today",
  3: "Last 3 days",
  7: "Last 7 days",
  30: "Last 30 days",
};

const Reports = () => {
  const {
    business,
    sales,
    expenses,
  } = useSparkSales();

  const [range, setRange] = useState("all");

  const commissionRate =
    Number(business?.commissionRate) ||
    COMMISSION_RATE;

  /*
   * ---------------------------------------------------------
   * REPORT DATE FILTER
   * ---------------------------------------------------------
   *
   * The report operates on transaction dates rather than
   * createdAt timestamps so the report reflects the actual
   * trading date entered by the business.
   */

  const latestTransactionDate = useMemo(() => {
    const dates = [
      ...sales.map((sale) => sale.date).filter(Boolean),
      ...expenses
        .map((expense) => expense.date)
        .filter(Boolean),
    ];

    return dates.length
      ? dates.sort().at(-1)
      : new Date().toISOString().slice(0, 10);
  }, [sales, expenses]);

  const reportDates = useMemo(() => {
    const allDates = [
      ...sales.map((sale) => sale.date),
      ...expenses.map((expense) => expense.date),
    ]
      .filter(Boolean)
      .filter(
        (date, index, array) =>
          array.indexOf(date) === index,
      )
      .sort();

    if (range === "all") {
      return allDates;
    }

    if (range === "today") {
      return allDates.filter(
        (date) => date === latestTransactionDate,
      );
    }

    const numberOfDays = Number(range);

    return allDates.slice(-numberOfDays);
  }, [sales, expenses, range, latestTransactionDate]);

  const reportDateSet = useMemo(
    () => new Set(reportDates),
    [reportDates],
  );

  const reportSales = useMemo(
    () =>
      sales.filter((sale) =>
        reportDateSet.has(sale.date),
      ),
    [sales, reportDateSet],
  );

  const reportExpenses = useMemo(
    () =>
      expenses.filter((expense) =>
        reportDateSet.has(expense.date),
      ),
    [expenses, reportDateSet],
  );

  /*
   * ---------------------------------------------------------
   * FINANCIAL SUMMARY
   * ---------------------------------------------------------
   */

  const financials = useMemo(() => {
    const revenue = reportSales.reduce(
      (sum, sale) => sum + saleTotal(sale),
      0,
    );

    const expenseTotal = reportExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0,
    );

    const grossProfit = revenue - expenseTotal;

    const commission =
      grossProfit > 0
        ? grossProfit * commissionRate
        : 0;

    const netProfit = grossProfit - commission;

    const unitsSold = reportSales.reduce(
      (sum, sale) =>
        sum + Number(sale.quantity || 0),
      0,
    );

    const averageSale = reportSales.length
      ? revenue / reportSales.length
      : 0;

    const margin = revenue
      ? (grossProfit / revenue) * 100
      : 0;

    return {
      revenue,
      expenses: expenseTotal,
      grossProfit,
      commission,
      netProfit,
      unitsSold,
      transactions: reportSales.length,
      averageSale,
      margin,
    };
  }, [reportSales, reportExpenses, commissionRate]);

  /*
   * ---------------------------------------------------------
   * DAY-BY-DAY DATA
   * ---------------------------------------------------------
   */

  const days = useMemo(() => {
    const grouped = new Map();

    reportSales.forEach((sale) => {
      const current =
        grouped.get(sale.date) || {
          date: sale.date,
          revenue: 0,
          expenses: 0,
          salesCount: 0,
          expenseCount: 0,
        };

      current.revenue += saleTotal(sale);
      current.salesCount += 1;

      grouped.set(sale.date, current);
    });

    reportExpenses.forEach((expense) => {
      const current =
        grouped.get(expense.date) || {
          date: expense.date,
          revenue: 0,
          expenses: 0,
          salesCount: 0,
          expenseCount: 0,
        };

      current.expenses += Number(
        expense.amount || 0,
      );

      current.expenseCount += 1;

      grouped.set(expense.date, current);
    });

    return Array.from(grouped.values())
      .sort((a, b) =>
        a.date.localeCompare(b.date),
      )
      .map((day) => {
        const gross =
          day.revenue - day.expenses;

        const commission =
          gross > 0
            ? gross * commissionRate
            : 0;

        const net = gross - commission;

        const margin = day.revenue
          ? (gross / day.revenue) * 100
          : 0;

        return {
          ...day,
          gross,
          commission,
          net,
          margin,
        };
      });
  }, [
    reportSales,
    reportExpenses,
    commissionRate,
  ]);

  /*
   * ---------------------------------------------------------
   * CHART DATA
   * ---------------------------------------------------------
   */

  const chartData = useMemo(
    () =>
      days.map((day) => ({
        ...day,
        label: day.date.slice(5),
      })),
    [days],
  );

  /*
   * ---------------------------------------------------------
   * PAYMENT BREAKDOWN
   * ---------------------------------------------------------
   */

  const paymentBreakdown = useMemo(() => {
    const methods = {
      Cash: 0,
      Card: 0,
      EFT: 0,
    };

    reportSales.forEach((sale) => {
      const method =
        sale.paymentMethod || "Cash";

      if (!(method in methods)) {
        methods[method] = 0;
      }

      methods[method] += saleTotal(sale);
    });

    return Object.entries(methods).map(
      ([method, amount]) => ({
        method,
        amount,
        percentage:
          financials.revenue > 0
            ? (amount / financials.revenue) *
              100
            : 0,
      }),
    );
  }, [reportSales, financials.revenue]);

  /*
   * ---------------------------------------------------------
   * CATEGORY BREAKDOWNS
   * ---------------------------------------------------------
   */

  const revenueByCategory = useMemo(() => {
    const grouped = new Map();

    reportSales.forEach((sale) => {
      const category =
        sale.category || "Other";

      grouped.set(
        category,
        (grouped.get(category) || 0) +
          saleTotal(sale),
      );
    });

    return Array.from(grouped.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage:
          financials.revenue > 0
            ? (amount / financials.revenue) *
              100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [reportSales, financials.revenue]);

  const expensesByCategory = useMemo(() => {
    const grouped = new Map();

    reportExpenses.forEach((expense) => {
      const category =
        expense.category || "Other";

      grouped.set(
        category,
        (grouped.get(category) || 0) +
          Number(expense.amount || 0),
      );
    });

    return Array.from(grouped.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage:
          financials.expenses > 0
            ? (amount / financials.expenses) *
              100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [reportExpenses, financials.expenses]);

  /*
   * ---------------------------------------------------------
   * PERFORMANCE INSIGHTS
   * ---------------------------------------------------------
   */

  const insights = useMemo(() => {
    const highestRevenueDay =
      [...days].sort(
        (a, b) => b.revenue - a.revenue,
      )[0] || null;

    const highestExpenseDay =
      [...days].sort(
        (a, b) => b.expenses - a.expenses,
      )[0] || null;

    const strongestMarginDay =
      [...days]
        .filter((day) => day.revenue > 0)
        .sort((a, b) => b.margin - a.margin)[0] ||
      null;

    const topRevenueCategory =
      revenueByCategory[0] || null;

    return {
      highestRevenueDay,
      highestExpenseDay,
      strongestMarginDay,
      topRevenueCategory,
    };
  }, [days, revenueByCategory]);

  /*
   * ---------------------------------------------------------
   * EXPORT
   * ---------------------------------------------------------
   */

  const exportCsv = () => {
    const header = [
      "Date",
      "Revenue",
      "Expenses",
      "Gross Profit",
      "Commission",
      "Net Profit",
      "Profit Margin",
    ];

    const body = days
      .map((day) =>
        [
          day.date,
          day.revenue,
          day.expenses,
          day.gross,
          day.commission,
          day.net,
          `${day.margin.toFixed(2)}%`,
        ]
          .map((value) =>
            typeof value === "number"
              ? value.toFixed(2)
              : `"${String(value).replace(
                  /"/g,
                  '""',
                )}"`,
          )
          .join(","),
      )
      .join("\n");

    const summaryHeader = [
      "REPORT SUMMARY",
      "",
    ].join(",");

    const summaryRows = [
      [
        "Business",
        business?.name || "SparkSales",
      ],
      [
        "Reporting period",
        REPORT_RANGES[range],
      ],
      ["Revenue", financials.revenue],
      ["Expenses", financials.expenses],
      ["Gross Profit", financials.grossProfit],
      ["Commission", financials.commission],
      ["Net Profit", financials.netProfit],
      [
        "Profit Margin",
        `${financials.margin.toFixed(2)}%`,
      ],
    ]
      .map((row) =>
        row
          .map((value) =>
            typeof value === "number"
              ? value.toFixed(2)
              : `"${String(value).replace(
                  /"/g,
                  '""',
                )}"`,
          )
          .join(","),
      )
      .join("\n");

    const csv = [
      summaryHeader,
      summaryRows,
      "",
      header.join(","),
      body,
      "",
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      "sparksales-financial-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <>
      <PageTemplate
        title="Reports"
        description="Understand your revenue, spending and profit with a clear financial view of your trading activity."
        action={
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#063D35] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#E6F7F3] hover:shadow-md"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={printReport}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#063D35] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#E6F7F3] hover:shadow-md"
            >
              <Printer size={16} />
              Print report
            </button>
          </div>
        }
      />

      {/* ================================================= */}
      {/* REPORT HEADER                                      */}
      {/* ================================================= */}

      <section className="rounded-2xl border border-[#0B6156] bg-[#063D35] p-5 text-white shadow-lg shadow-[#063D35]/10 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#B8F2E6]">
              <FileBarChart2 size={13} />
              Financial report
            </div>

            <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
              {business?.name ||
                "Your SparkSales business"}
            </h2>

            <p className="mt-1 text-sm text-slate-300">
              {business?.category ||
                "Entrepreneurship Day"}{" "}
              · {REPORT_RANGES[range]}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#B8F2E6]">
              Reporting period

              <div className="relative mt-1.5">
                <select
                  value={range}
                  onChange={(event) =>
                    setRange(event.target.value)
                  }
                  className="min-w-[150px] appearance-none rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 pr-9 text-sm font-bold text-white outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#7FCFC0]/30"
                  aria-label="Reporting period"
                >
                  {Object.entries(
                    REPORT_RANGES,
                  ).map(([value, label]) => (
                    <option
                      key={value}
                      value={value}
                      className="bg-white text-slate-900"
                    >
                      {label}
                    </option>
                  ))}
                </select>

                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute right-3 top-3 text-[#B8F2E6]"
                />
              </div>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-xs font-semibold text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2
              size={14}
              className="text-[#7FCFC0]"
            />
            Live workspace data
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Sparkles
              size={14}
              className="text-[#7FCFC0]"
            />
            Commission rate{" "}
            {(commissionRate * 100).toFixed(0)}%
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Receipt
              size={14}
              className="text-[#7FCFC0]"
            />
            {financials.transactions} sales
          </span>
        </div>
      </section>

      {/* ================================================= */}
      {/* FINANCIAL SUMMARY                                  */}
      {/* ================================================= */}

      <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Revenue"
          value={formatCurrency(
            financials.revenue,
          )}
          detail={`${financials.transactions} sales recorded`}
          icon={TrendingUp}
          primary
        />

        <MetricCard
          label="Expenses"
          value={formatCurrency(
            financials.expenses,
          )}
          detail={`${reportExpenses.length} costs recorded`}
          icon={Receipt}
          negative
        />

        <MetricCard
          label="Gross profit"
          value={formatCurrency(
            financials.grossProfit,
          )}
          detail={`${financials.margin.toFixed(1)}% gross margin`}
          icon={BarChart3}
          success={financials.grossProfit >= 0}
          danger={financials.grossProfit < 0}
        />

        <MetricCard
          label="Commission"
          value={formatCurrency(
            financials.commission,
          )}
          detail={`${(
            commissionRate * 100
          ).toFixed(0)}% of positive gross profit`}
          icon={WalletCards}
        />

        <MetricCard
          label="Net profit"
          value={formatCurrency(
            financials.netProfit,
          )}
          detail={
            financials.netProfit >= 0
              ? "Profit after commission"
              : "Current period loss"
          }
          icon={
            financials.netProfit >= 0
              ? TrendingUp
              : TrendingDown
          }
          success={financials.netProfit >= 0}
          danger={financials.netProfit < 0}
        />
      </section>

      {/* ================================================= */}
      {/* PROFITABILITY STATUS                               */}
      {/* ================================================= */}

      <section className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <div
          className={`rounded-2xl border p-5 shadow-sm ${
            financials.netProfit >= 0
              ? "border-[#B8F2E6] bg-[#F3FBF9]"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                financials.netProfit >= 0
                  ? "bg-[#B8F2E6] text-[#063D35]"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {financials.netProfit >= 0 ? (
                <TrendingUp size={19} />
              ) : (
                <TrendingDown size={19} />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Reporting status
              </p>

              <h2
                className={`mt-1 text-xl font-black ${
                  financials.netProfit >= 0
                    ? "text-[#063D35]"
                    : "text-red-600"
                }`}
              >
                {financials.netProfit >= 0
                  ? "This period is profitable"
                  : "This period is running at a loss"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {financials.netProfit >= 0
                  ? `Your business generated ${formatCurrency(
                      financials.netProfit,
                    )} after expenses and SparkSales commission.`
                  : `Your current expenses exceed the revenue generated in this reporting period by ${formatCurrency(
                      Math.abs(
                        financials.grossProfit,
                      ),
                    )} before commission.`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Operating snapshot
              </p>

              <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
                Trading activity
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
              <BarChart3 size={18} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <MiniStat
              label="Units sold"
              value={financials.unitsSold}
            />

            <MiniStat
              label="Average sale"
              value={formatCurrency(
                financials.averageSale,
              )}
            />
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* MAIN PERFORMANCE CHART                             */}
      {/* ================================================= */}

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Performance
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
              Revenue, expenses and net profit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              See how the business performed across the selected period.
            </p>
          </div>
        </div>

        <div className="h-[340px] p-4 sm:p-5">
          {chartData.length ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 8,
                  right: 8,
                  left: 0,
                  bottom: 8,
                }}
                barGap={6}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
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
                  tick={{
                    fontSize: 11,
                    fill: "#64748b",
                  }}
                  tickFormatter={(value) =>
                    `R${value}`
                  }
                />

                <Tooltip
                  cursor={{
                    fill: "#F7FAF9",
                  }}
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                  labelFormatter={(label) =>
                    `Date: ${label}`
                  }
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 12px 30px rgba(15, 23, 42, 0.10)",
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    paddingTop: "8px",
                  }}
                />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#063D35"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#EF626C"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="net"
                  name="Net profit"
                  fill="#7FCFC0"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ReportEmptyState />
          )}
        </div>
      </section>

      {/* ================================================= */}
      {/* BREAKDOWNS                                          */}
      {/* ================================================= */}

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Payment methods */}
        <BreakdownCard
          eyebrow="Payment mix"
          title="Revenue by payment"
          icon={WalletCards}
        >
          {paymentBreakdown.map((entry) => (
            <BreakdownRow
              key={entry.method}
              label={entry.method}
              value={formatCurrency(entry.amount)}
              percentage={entry.percentage}
              icon={
                entry.method === "Cash"
                  ? Banknote
                  : entry.method === "Card"
                    ? CreditCard
                    : WalletCards
              }
              empty={!entry.amount}
            />
          ))}
        </BreakdownCard>

        {/* Revenue categories */}
        <BreakdownCard
          eyebrow="Revenue mix"
          title="Top sales categories"
          icon={TrendingUp}
        >
          {revenueByCategory.length ? (
            revenueByCategory
              .slice(0, 5)
              .map((entry) => (
                <BreakdownRow
                  key={entry.name}
                  label={entry.name}
                  value={formatCurrency(
                    entry.amount,
                  )}
                  percentage={entry.percentage}
                />
              ))
          ) : (
            <SmallEmptyState text="No sales in this period." />
          )}
        </BreakdownCard>

        {/* Expense categories */}
        <BreakdownCard
          eyebrow="Cost mix"
          title="Where money is going"
          icon={TrendingDown}
        >
          {expensesByCategory.length ? (
            expensesByCategory
              .slice(0, 5)
              .map((entry) => (
                <BreakdownRow
                  key={entry.name}
                  label={entry.name}
                  value={formatCurrency(
                    entry.amount,
                  )}
                  percentage={entry.percentage}
                  expense
                />
              ))
          ) : (
            <SmallEmptyState text="No expenses in this period." />
          )}
        </BreakdownCard>
      </section>

      {/* ================================================= */}
      {/* KEY INSIGHTS                                       */}
      {/* ================================================= */}

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
            <Sparkles size={18} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Key insights
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
              What the numbers are telling you
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            label="Top revenue category"
            value={
              insights.topRevenueCategory
                ? insights.topRevenueCategory.name
                : "No data"
            }
            detail={
              insights.topRevenueCategory
                ? formatCurrency(
                    insights.topRevenueCategory.amount,
                  )
                : "Record more sales"
            }
            icon={TrendingUp}
          />

          <InsightCard
            label="Best revenue day"
            value={
              insights.highestRevenueDay
                ? formatDate(
                    insights.highestRevenueDay.date,
                  )
                : "No data"
            }
            detail={
              insights.highestRevenueDay
                ? formatCurrency(
                    insights.highestRevenueDay
                      .revenue,
                  )
                : "No sales recorded"
            }
            icon={CalendarDays}
          />

          <InsightCard
            label="Highest spending day"
            value={
              insights.highestExpenseDay &&
              insights.highestExpenseDay
                .expenses > 0
                ? formatDate(
                    insights.highestExpenseDay.date,
                  )
                : "No expenses"
            }
            detail={
              insights.highestExpenseDay &&
              insights.highestExpenseDay
                .expenses > 0
                ? formatCurrency(
                    insights.highestExpenseDay
                      .expenses,
                  )
                : "No spending recorded"
            }
            icon={TrendingDown}
            expense
          />

          <InsightCard
            label="Strongest margin"
            value={
              insights.strongestMarginDay
                ? `${insights.strongestMarginDay.margin.toFixed(
                    1,
                  )}%`
                : "No data"
            }
            detail={
              insights.strongestMarginDay
                ? formatDate(
                    insights.strongestMarginDay.date,
                  )
                : "No profitable day"
            }
            icon={BarChart3}
          />
        </div>
      </section>

      {/* ================================================= */}
      {/* DAY-BY-DAY TABLE                                   */}
      {/* ================================================= */}

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Detailed breakdown
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
              Day-by-day financial performance
            </h2>
          </div>

          <div className="rounded-full bg-[#E6F7F3] px-3 py-1.5 text-xs font-bold text-[#063D35]">
            {days.length}{" "}
            {days.length === 1
              ? "day"
              : "days"}
          </div>
        </div>

        {days.length ? (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Revenue
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Expenses
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Gross profit
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Commission
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Net profit
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      Margin
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {days.map((day) => (
                    <tr
                      key={day.date}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-[#F7FAF9]"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-slate-800">
                            {formatDate(
                              day.date,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {day.salesCount}{" "}
                            {day.salesCount === 1
                              ? "sale"
                              : "sales"}{" "}
                            · {day.expenseCount}{" "}
                            {day.expenseCount ===
                            1
                              ? "expense"
                              : "expenses"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-[#063D35]">
                        {formatCurrency(
                          day.revenue,
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-red-500">
                        {formatCurrency(
                          day.expenses,
                        )}
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-bold ${
                          day.gross >= 0
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {formatCurrency(
                          day.gross,
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-slate-700">
                        {formatCurrency(
                          day.commission,
                        )}
                      </td>

                      <td
                        className={`px-5 py-4 text-right font-black ${
                          day.net >= 0
                            ? "text-[#063D35]"
                            : "text-red-500"
                        }`}
                      >
                        {formatCurrency(day.net)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            day.margin >= 0
                              ? "bg-[#E6F7F3] text-[#063D35]"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {day.margin.toFixed(
                            1,
                          )}
                          %
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {days.map((day) => (
                <article
                  key={day.date}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-800">
                        {formatDate(day.date)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {day.salesCount}{" "}
                        {day.salesCount === 1
                          ? "sale"
                          : "sales"}{" "}
                        · {day.expenseCount}{" "}
                        {day.expenseCount ===
                        1
                          ? "expense"
                          : "expenses"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        day.margin >= 0
                          ? "bg-[#E6F7F3] text-[#063D35]"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {day.margin.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <MobileMetric
                      label="Revenue"
                      value={formatCurrency(
                        day.revenue,
                      )}
                    />

                    <MobileMetric
                      label="Expenses"
                      value={formatCurrency(
                        day.expenses,
                      )}
                      negative
                    />

                    <MobileMetric
                      label="Gross profit"
                      value={formatCurrency(
                        day.gross,
                      )}
                    />

                    <MobileMetric
                      label="Net profit"
                      value={formatCurrency(
                        day.net,
                      )}
                      negative={day.net < 0}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <ReportEmptyState
            title="Nothing to report yet"
            description="Record sales or expenses to start building your financial report."
          />
        )}
      </section>

      {/* ================================================= */}
      {/* REPORT FOOTER                                      */}
      {/* ================================================= */}

      <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="font-bold text-[#063D35]">
            SparkSales financial report
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Based on live sales and expense records for the
            selected reporting period.
          </p>
        </div>

        <button
          type="button"
          onClick={printReport}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052F29]"
        >
          <Printer size={15} />
          Print this report
        </button>
      </section>
    </>
  );
};

/* ========================================================= */
/* REUSABLE COMPONENTS                                      */
/* ========================================================= */

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  primary = false,
  negative = false,
  success = false,
  danger = false,
}) {
  const valueClass = primary
    ? "text-white"
    : danger
      ? "text-red-500"
      : negative
        ? "text-red-500"
        : success
          ? "text-[#0C9A73]"
          : "text-[#063D35]";

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
        primary
          ? "border-[#0B6156] bg-[#063D35]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-xs font-bold uppercase tracking-[0.14em] ${
              primary
                ? "text-[#B8F2E6]"
                : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-2 truncate text-xl font-black tracking-tight sm:text-2xl ${valueClass}`}
          >
            {value}
          </p>

          <p
            className={`mt-1 text-xs font-medium ${
              primary
                ? "text-slate-300"
                : "text-slate-500"
            }`}
          >
            {detail}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            primary
              ? "bg-white/10 text-[#B8F2E6]"
              : negative || danger
                ? "bg-red-50 text-red-500"
                : "bg-[#E6F7F3] text-[#063D35]"
          }`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
      <p className="text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#063D35]">
        {value}
      </p>
    </div>
  );
}

function BreakdownCard({
  eyebrow,
  title,
  icon: Icon,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            {eyebrow}
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
            {title}
          </h2>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  percentage,
  icon: Icon,
  expense = false,
  empty = false,
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#063D35]">
            <Icon size={15} />
          </div>
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#063D35]">
            <div className="h-2 w-2 rounded-full bg-[#063D35]" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-bold text-slate-700">
              {label}
            </p>

            <p
              className={`shrink-0 text-sm font-extrabold ${
                expense
                  ? "text-red-500"
                  : "text-[#063D35]"
              }`}
            >
              {value}
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  expense
                    ? "bg-red-300"
                    : "bg-[#7FCFC0]"
                }`}
                style={{
                  width: `${Math.min(
                    percentage,
                    100,
                  )}%`,
                }}
              />
            </div>

            <span className="w-12 text-right text-[10px] font-bold text-slate-400">
              {empty
                ? "0%"
                : `${percentage.toFixed(0)}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  label,
  value,
  detail,
  icon: Icon,
  expense = false,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#063D35] shadow-sm">
          <Icon size={15} />
        </div>

        {expense ? (
          <ArrowDownRight
            size={15}
            className="text-red-400"
          />
        ) : (
          <ArrowUpRight
            size={15}
            className="text-[#43A99A]"
          />
        )}
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-black text-[#063D35]">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function MobileMetric({
  label,
  value,
  negative = false,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black ${
          negative
            ? "text-red-500"
            : "text-[#063D35]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SmallEmptyState({
  text,
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center">
      <p className="text-sm font-medium text-slate-400">
        {text}
      </p>
    </div>
  );
}

function ReportEmptyState({
  title = "Nothing to report yet",
  description = "Record sales or expenses to start building your financial report.",
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F7F3] text-[#063D35]">
        <FileBarChart2 size={22} />
      </div>

      <h3 className="mt-4 text-base font-extrabold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default Reports;