import PageTemplate from "../components/ui/PageTemplate";

function Reports() {
  return (
    <PageTemplate
      title="Reports"
      icon="📈"
      description="Generate financial reports that help you understand your business performance."
    >
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Reports
        </h2>

        <p className="mt-2 text-slate-600">
          Your financial reports will appear here.
        </p>
      </div>
    </PageTemplate>
  );
}

export default Reports;