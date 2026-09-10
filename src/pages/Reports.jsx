import { useMemo, useState } from "react";
import {
  Download,
  Printer,
  RotateCcw,
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

function Reports() {
  const {
    sales,
    expenses,
    totals,
    resetData,
  } = useSparkSales();

  const [range, setRange] = useState("all");

  const days = useMemo(() => {
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

      current.expenses += Number(expense.amount || 0);

      grouped.set(expense.date, current);
    });

    let rows = Array.from(grouped.values()).sort(
      (a, b) => a.date.localeCompare(b.date)
    );

    if (range !== "all") {
      rows = rows.slice(-Number(range));
    }

    return rows.map((row) => {
      const gross = row.revenue - row.expenses;

      const commission =
        gross > 0
          ? gross * COMMISSION_RATE
          : 0;

      const net = gross - commission;

      return {
        ...row,
        gross,
        commission,
        net,
      };
    });
  }, [sales, expenses, range]);

  const exportCsv = () => {
    const header =
      "Date,Revenue,Expenses,Gross Profit,Commission,Net Profit";

    const body = days
      .map((day) =>
        [
          day.date,
          day.revenue,
          day.expenses,
          day.gross,
          day.commission,
          day.net,
        ]
          .map((value) =>
            typeof value === "number"
              ? value.toFixed(2)
              : value
          )
          .join(",")
      )
      .join("\n");

    const csv = `${header}\n${body}\n`;

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "sparksales-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <>
      <PageTemplate
        title="Reports"
        description="Profit, commission and business performance — broken down day by day."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#063D35] transition hover:bg-[#E6F7F3]"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={printReport}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#063D35] transition hover:bg-[#E6F7F3]"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        }
      />

      {/* Financial summary */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: "Revenue",
            value: totals.revenue,
          },
          {
            label: "Expenses",
            value: totals.expenses,
          },
          {
            label: "Gross profit",
            value: totals.grossProfit,
          },
          {
            label: "Commission",
            value: totals.commission,
          },
          {
            label: "Net profit",
            value: totals.netProfit,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>

            <p
              className={`mt-2 text-xl font-extrabold ${
                stat.label === "Expenses"
                  ? "text-red-500"
                  : stat.label === "Net profit" &&
                      stat.value < 0
                    ? "text-red-500"
                    : "text-[#063D35]"
              }`}
            >
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </section>

      {/* Revenue vs expenses chart */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-bold text-[#063D35]">
              Revenue vs expenses
            </h2>

            <p className="text-sm text-slate-500">
              Commission is 5% and only applies to
              positive gross profit.
            </p>
          </div>

          <select
            value={range}
            onChange={(event) =>
              setRange(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-[#063D35] outline-none transition focus:border-[#7FCFC0] focus:ring-2 focus:ring-[#B8F2E6]"
            aria-label="Report date range"
          >
            <option value="all">All days</option>
            <option value="3">Last 3 days</option>
            <option value="7">Last 7 days</option>
          </select>
        </div>

        <div className="mt-5 h-72">
          {days.length ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={days}
                margin={{
                  top: 8,
                  right: 8,
                  left: 0,
                  bottom: 8,
                }}
              >
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

                <Legend />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#063D35"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#E34D5A"
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
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200">
              <p className="text-center text-sm text-slate-400">
                Nothing to report yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Day-by-day breakdown */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="font-bold text-[#063D35]">
            Day-by-day breakdown
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {[
                  "Date",
                  "Revenue",
                  "Expenses",
                  "Gross profit",
                  "Commission",
                  "Net profit",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 font-bold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {days.map((day) => (
                <tr
                  key={day.date}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-semibold text-[#063D35]">
                    {formatDate(day.date)}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(day.revenue)}
                  </td>

                  <td className="px-4 py-3 text-red-500">
                    {formatCurrency(day.expenses)}
                  </td>

                  <td
                    className={`px-4 py-3 font-semibold ${
                      day.gross >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {formatCurrency(day.gross)}
                  </td>

                  <td className="px-4 py-3">
                    {formatCurrency(day.commission)}
                  </td>

                  <td
                    className={`px-4 py-3 font-bold ${
                      day.net >= 0
                        ? "text-[#063D35]"
                        : "text-red-500"
                    }`}
                  >
                    {formatCurrency(day.net)}
                  </td>
                </tr>
              ))}

              {!days.length && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No data in this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Report actions */}
      <section className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-[#063D35]">
            Development data
          </h2>

          <p className="text-sm text-slate-500">
            Restore the demonstration records used by
            the SparkSales template.
          </p>
        </div>

        <button
          type="button"
          onClick={resetData}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#063D35] transition hover:bg-[#E6F7F3]"
        >
          <RotateCcw size={15} />
          Restore sample data
        </button>
      </section>
    </>
  );
}

export default Reports;