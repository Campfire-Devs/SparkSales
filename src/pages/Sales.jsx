import PageTemplate from "../components/ui/PageTemplate";

function Sales() {
  return (
    <PageTemplate
      title="Sales"
      icon="💰"
      description="Manage and track sales transactions made by your business."
    >
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Sales
        </h2>

        <p className="mt-2 text-slate-600">
          Your recorded sales transactions will appear here.
        </p>
      </div>
    </PageTemplate>
  );
}

export default Sales;