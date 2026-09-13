import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Download,
  FileDown,
  Printer,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import PageTemplate from "../components/ui/PageTemplate";

import {
  calculateFinancialSummary,
} from "../utils/calculations";

import {
  COMMISSION_RATE,
  formatCurrency,
  saleTotal,
} from "../utils/sparkSales";


// ==========================================
// PAYMENT CHART COLOURS
// ==========================================

const PAYMENT_COLORS = [
  "#063D35",
  "#0F766E",
  "#14B8A6",
  "#7FCFC0",
  "#94A3B8",
];


// ==========================================
// SAFE DATE HELPER
// ==========================================

const normaliseDate = (value) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return value;
  }

  return parsed
    .toISOString()
    .slice(0, 10);
};


// ==========================================
// REPORTS COMPONENT
// ==========================================

function Reports() {
  const reportRef = useRef(null);

  const [range, setRange] =
    useState("all");

  const [isExporting, setIsExporting] =
    useState(false);


  // ========================================
  // READ SALES AND EXPENSES
  // ========================================

  const sales = useMemo(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("sales")
        ) || []
      );
    } catch {
      return [];
    }
  }, []);

  const expenses = useMemo(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("expenses")
        ) || []
      );
    } catch {
      return [];
    }
  }, []);


  // ========================================
  // CREATE ALL REPORT DATES
  // ========================================

  const allDates = useMemo(() => {
    const dates = [
      ...sales.map(
        (sale) =>
          normaliseDate(sale.date)
      ),

      ...expenses.map(
        (expense) =>
          normaliseDate(expense.date)
      ),
    ]
      .filter(Boolean)
      .sort();

    return [...new Set(dates)];
  }, [sales, expenses]);


  // ========================================
  // FILTER DATE RANGE
  // ========================================

  const selectedDates =
    useMemo(() => {
      if (range === "all") {
        return allDates;
      }

      return allDates.slice(
        -Number(range)
      );
    }, [allDates, range]);


  const filteredSales =
    useMemo(() => {
      if (range === "all") {
        return sales;
      }

      return sales.filter((sale) =>
        selectedDates.includes(
          normaliseDate(sale.date)
        )
      );
    }, [
      sales,
      range,
      selectedDates,
    ]);


  const filteredExpenses =
    useMemo(() => {
      if (range === "all") {
        return expenses;
      }

      return expenses.filter(
        (expense) =>
          selectedDates.includes(
            normaliseDate(
              expense.date
            )
          )
      );
    }, [
      expenses,
      range,
      selectedDates,
    ]);


  // ========================================
  // FINANCIAL SUMMARY
  // ========================================

  const financials =
    useMemo(() => {
      return calculateFinancialSummary(
        filteredSales,
        filteredExpenses,
        COMMISSION_RATE
      );
    }, [
      filteredSales,
      filteredExpenses,
    ]);


  // ========================================
  // BUSINESS PERFORMANCE
  // ========================================

  const performance =
    useMemo(() => {
      const transactions =
        filteredSales.length;

      const unitsSold =
        filteredSales.reduce(
          (sum, sale) =>
            sum +
            Number(
              sale.quantity || 0
            ),
          0
        );

      const averageSale =
        transactions > 0
          ? financials.revenue /
            transactions
          : 0;

      const averageExpense =
        filteredExpenses.length > 0
          ? financials.expenses /
            filteredExpenses.length
          : 0;

      return {
        transactions,
        unitsSold,
        averageSale,
        averageExpense,
      };
    }, [
      filteredSales,
      filteredExpenses,
      financials,
    ]);


  // ========================================
  // REVENUE VS EXPENSE DATA
  // ========================================

  const dailyData =
    useMemo(() => {
      const grouped = new Map();

      filteredSales.forEach(
        (sale) => {
          const date =
            normaliseDate(
              sale.date
            );

          const current =
            grouped.get(date) || {
              date,
              revenue: 0,
              expenses: 0,
            };

          current.revenue +=
            saleTotal(sale);

          grouped.set(
            date,
            current
          );
        }
      );

      filteredExpenses.forEach(
        (expense) => {
          const date =
            normaliseDate(
              expense.date
            );

          const current =
            grouped.get(date) || {
              date,
              revenue: 0,
              expenses: 0,
            };

          current.expenses +=
            Number(
              expense.amount || 0
            );

          grouped.set(
            date,
            current
          );
        }
      );

      return Array.from(
        grouped.values()
      )
        .sort((a, b) =>
          a.date.localeCompare(
            b.date
          )
        )
        .map((row) => {
          const gross =
            row.revenue -
            row.expenses;

          const commission =
            gross > 0
              ? gross *
                COMMISSION_RATE
              : 0;

          return {
            ...row,

            grossProfit:
              gross,

            netProfit:
              gross -
              commission,
          };
        });
    }, [
      filteredSales,
      filteredExpenses,
    ]);


  // ========================================
  // PAYMENT BREAKDOWN
  // ========================================

  const paymentData =
    useMemo(() => {
      const grouped = {};

      filteredSales.forEach(
        (sale) => {
          const method =
            sale.paymentMethod ||
            "Cash";

          if (!grouped[method]) {
            grouped[method] = 0;
          }

          grouped[method] +=
            saleTotal(sale);
        }
      );

      return Object.entries(
        grouped
      ).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
    }, [filteredSales]);


  // ========================================
  // PRINT REPORT
  // ========================================

  const handlePrint = () => {
    window.print();
  };


  // ========================================
  // PDF EXPORT
  // ========================================

  const handlePdfExport =
    async () => {
      if (!reportRef.current) {
        return;
      }

      try {
        setIsExporting(true);

        const canvas =
          await html2canvas(
            reportRef.current,
            {
              scale: 2,
              useCORS: true,
              backgroundColor:
                "#ffffff",
            }
          );

        const imageData =
          canvas.toDataURL(
            "image/png"
          );

        const pdf =
          new jsPDF(
            "p",
            "mm",
            "a4"
          );

        const pageWidth =
          pdf.internal.pageSize
            .getWidth();

        const pageHeight =
          pdf.internal.pageSize
            .getHeight();

        const margin = 10;

        const imageWidth =
          pageWidth -
          margin * 2;

        const imageHeight =
          (canvas.height *
            imageWidth) /
          canvas.width;

        let heightLeft =
          imageHeight;

        let position =
          margin;

        pdf.addImage(
          imageData,
          "PNG",
          margin,
          position,
          imageWidth,
          imageHeight
        );

        heightLeft -=
          pageHeight -
          margin * 2;

        while (
          heightLeft > 0
        ) {
          position =
            heightLeft -
            imageHeight +
            margin;

          pdf.addPage();

          pdf.addImage(
            imageData,
            "PNG",
            margin,
            position,
            imageWidth,
            imageHeight
          );

          heightLeft -=
            pageHeight -
            margin * 2;
        }

        pdf.save(
          "SparkSales-Financial-Report.pdf"
        );
      } catch (error) {
        console.error(
          "PDF export failed:",
          error
        );

        alert(
          "The PDF could not be created."
        );
      } finally {
        setIsExporting(false);
      }
    };


  return (
    <>
      {/* ================================== */}
      {/* REPORT PAGE HEADER                 */}
      {/* ================================== */}

      <div className="report-controls">
        <PageTemplate
          title="Reports"
          description="Financial performance, revenue, expenses and business insights."
          action={
            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#063D35] transition hover:bg-[#E6F7F3]"
              >
                <Printer size={17} />

                Print Report
              </button>

              <button
                type="button"
                onClick={
                  handlePdfExport
                }
                disabled={
                  isExporting
                }
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#063D35] px-4 text-sm font-bold text-white transition hover:bg-[#0A5147] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileDown size={17} />

                {isExporting
                  ? "Creating PDF..."
                  : "Export PDF"}
              </button>

            </div>
          }
        />
      </div>


      {/* ================================== */}
      {/* REPORT CONTENT                     */}
      {/* ================================== */}

      <main
        ref={reportRef}
        className="report-content"
      >

        {/* DATE FILTER */}

        <section className="report-controls mb-4 flex justify-end">

          <select
            value={range}
            onChange={(event) =>
              setRange(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-[#063D35]"
          >
            <option value="all">
              All available records
            </option>

            <option value="7">
              Last 7 reporting days
            </option>

            <option value="30">
              Last 30 reporting days
            </option>
          </select>

        </section>


        {/* ================================= */}
        {/* FINANCIAL SUMMARY                 */}
        {/* ================================= */}

        <section>
          <div className="mb-3">
            <h2 className="text-lg font-extrabold text-[#063D35]">
              Financial Summary
            </h2>

            <p className="text-sm text-slate-500">
              Overall financial results for the selected period.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

            <SummaryCard
              label="Revenue"
              value={formatCurrency(
                financials.revenue
              )}
            />

            <SummaryCard
              label="Expenses"
              value={formatCurrency(
                financials.expenses
              )}
              danger
            />

            <SummaryCard
              label="Gross Profit / Loss"
              value={formatCurrency(
                financials.grossProfit
              )}
              danger={
                financials.grossProfit <
                0
              }
            />

            <SummaryCard
              label="5% Commission"
              value={formatCurrency(
                financials.commission
              )}
            />

            <SummaryCard
              label="Net Profit"
              value={formatCurrency(
                financials.netProfit
              )}
              danger={
                financials.netProfit <
                0
              }
            />

            <SummaryCard
              label="Profit Margin"
              value={`${financials.profitMargin.toFixed(
                2
              )}%`}
              danger={
                financials.profitMargin <
                0
              }
            />

          </div>
        </section>


        {/* ================================= */}
        {/* LOSS DETECTION                    */}
        {/* ================================= */}

        <section
          className={`mt-4 rounded-2xl border p-4 shadow-sm ${
            financials.isLoss
              ? "border-red-200 bg-red-50"
              : financials.status ===
                  "Break-even"
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <div className="flex items-start gap-3">

            {financials.isLoss ? (
              <TrendingDown
                className="mt-0.5 text-red-600"
                size={22}
              />
            ) : (
              <TrendingUp
                className="mt-0.5 text-emerald-600"
                size={22}
              />
            )}

            <div>
              <h3
                className={`font-bold ${
                  financials.isLoss
                    ? "text-red-700"
                    : "text-[#063D35]"
                }`}
              >
                Business Status:
                {" "}
                {financials.status}
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                {financials.message}
              </p>
            </div>

          </div>
        </section>


        {/* ================================= */}
        {/* REVENUE VS EXPENSES               */}
        {/* ================================= */}

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <h2 className="font-bold text-[#063D35]">
            Revenue vs Expenses
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Comparison of sales income and operating expenses.
          </p>

          <div className="mt-5 h-80">

            {dailyData.length ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={dailyData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(
                        value
                      )
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#063D35"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#E34D5A"
                    radius={[
                      5,
                      5,
                      0,
                      0,
                    ]}
                  />

                </BarChart>
              </ResponsiveContainer>

            ) : (

              <EmptyChart />

            )}

          </div>
        </section>


        {/* ================================= */}
        {/* PAYMENT BREAKDOWN                 */}
        {/* ================================= */}

        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-2">

            <WalletCards
              size={20}
              className="text-[#063D35]"
            />

            <h2 className="font-bold text-[#063D35]">
              Payment Breakdown
            </h2>

          </div>

          <p className="mt-1 text-sm text-slate-500">
            Revenue grouped by customer payment method.
          </p>

          <div className="mt-5 h-80">

            {paymentData.length ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={paymentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    label={({ name }) =>
                      name
                    }
                  >

                    {paymentData.map(
                      (
                        entry,
                        index
                      ) => (
                        <Cell
                          key={
                            entry.name
                          }
                          fill={
                            PAYMENT_COLORS[
                              index %
                                PAYMENT_COLORS.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(
                        value
                      )
                    }
                  />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            ) : (

              <EmptyChart />

            )}

          </div>
        </section>


        {/* ================================= */}
        {/* BUSINESS PERFORMANCE              */}
        {/* ================================= */}

        <section className="mt-4">

          <div className="mb-3">

            <h2 className="text-lg font-extrabold text-[#063D35]">
              Business Performance Summary
            </h2>

            <p className="text-sm text-slate-500">
              Key operating indicators for the selected reporting period.
            </p>

          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <PerformanceCard
              title="Sales Transactions"
              value={
                performance.transactions
              }
            />

            <PerformanceCard
              title="Units Sold"
              value={
                performance.unitsSold
              }
            />

            <PerformanceCard
              title="Average Sale"
              value={formatCurrency(
                performance.averageSale
              )}
            />

            <PerformanceCard
              title="Average Expense"
              value={formatCurrency(
                performance.averageExpense
              )}
            />

          </div>

        </section>


        {/* ================================= */}
        {/* FINANCIAL BREAKDOWN TABLE         */}
        {/* ================================= */}

        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-4 py-4">

            <h2 className="font-bold text-[#063D35]">
              Daily Financial Breakdown
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[760px] text-sm">

              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-400">

                <tr>
                  <th className="px-4 py-3">
                    Date
                  </th>

                  <th className="px-4 py-3">
                    Revenue
                  </th>

                  <th className="px-4 py-3">
                    Expenses
                  </th>

                  <th className="px-4 py-3">
                    Gross Profit
                  </th>

                  <th className="px-4 py-3">
                    Net Profit
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {dailyData.map(
                  (day) => (

                    <tr
                      key={
                        day.date
                      }
                    >
                      <td className="px-4 py-3 font-semibold">
                        {day.date}
                      </td>

                      <td className="px-4 py-3">
                        {formatCurrency(
                          day.revenue
                        )}
                      </td>

                      <td className="px-4 py-3 text-red-600">
                        {formatCurrency(
                          day.expenses
                        )}
                      </td>

                      <td
                        className={`px-4 py-3 font-semibold ${
                          day.grossProfit <
                          0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {formatCurrency(
                          day.grossProfit
                        )}
                      </td>

                      <td
                        className={`px-4 py-3 font-bold ${
                          day.netProfit <
                          0
                            ? "text-red-600"
                            : "text-[#063D35]"
                        }`}
                      >
                        {formatCurrency(
                          day.netProfit
                        )}
                      </td>
                    </tr>

                  )
                )}

                {!dailyData.length && (

                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      No financial data available.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>
    </>
  );
}


// ==========================================
// SUMMARY CARD
// ==========================================

function SummaryCard({
  label,
  value,
  danger = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-extrabold ${
          danger
            ? "text-red-600"
            : "text-[#063D35]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}


// ==========================================
// PERFORMANCE CARD
// ==========================================

function PerformanceCard({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-extrabold text-[#063D35]">
        {value}
      </p>

    </div>
  );
}


// ==========================================
// EMPTY CHART
// ==========================================

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300">

      <p className="text-sm text-slate-400">
        No data available.
      </p>

    </div>
  );
}

export default Reports;