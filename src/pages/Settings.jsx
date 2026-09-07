import PageTemplate from "../components/ui/PageTemplate";

function Settings() {
  return (
    <PageTemplate
      title="Settings"
      icon="⚙️"
      description="Manage your business and application preferences."
    >
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          Settings
        </h2>

        <p className="mt-2 text-slate-600">
          Your account and application settings will appear here.
        </p>
      </div>
    </PageTemplate>
  );
}

export default Settings;