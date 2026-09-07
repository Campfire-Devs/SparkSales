import PageTemplate from "../components/ui/PageTemplate";

function Dashboard() {
  return (
    <PageTemplate
      title="Dashboard"
      icon="📊"
      description="The central overview of your SparkSales business."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Sales</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            R0.00
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Expenses</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            R0.00
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Gross Profit</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            R0.00
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Transactions</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            0
          </h2>
        </div>

      </div>
    </PageTemplate>
  );
}

export default Dashboard;