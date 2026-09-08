import { useState } from "react";
import PageTemplate from "../components/ui/PageTemplate";
import { useSparkSales } from "../context/SparkSalesContext";
function Settings() {
  const { business, setBusiness, resetData } = useSparkSales();
  const [form, setForm] = useState(business || {});
  const save = (e) => {
    e.preventDefault();
    setBusiness(form);
    window.alert("Business profile saved");
  };
  return (
    <>
      <PageTemplate
        title="Settings"
        description="Manage your business profile and application preferences."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold">Business profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            These details appear across your SparkSales workspace.
          </p>
          <form onSubmit={save} className="mt-5 space-y-4">
            <Field
              label="Business name"
              value={form.name || ""}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Field
              label="Category"
              value={form.category || ""}
              onChange={(v) => setForm({ ...form, category: v })}
            />
            <Field
              label="Owner"
              value={form.owner || ""}
              onChange={(v) => setForm({ ...form, owner: v })}
            />
            <Field
              label="Contact"
              value={form.contact || ""}
              onChange={(v) => setForm({ ...form, contact: v })}
            />
            <button className="rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white">
              Save business information
            </button>
          </form>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold">Application settings</h2>
          <div className="mt-4 rounded-xl bg-[#E6F7F3] p-4">
            <p className="font-bold">Commission rate</p>
            <p className="mt-1 text-sm text-slate-600">
              SparkSales currently charges 5% of positive gross profit.
            </p>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="font-bold">Team members</h3>
            <p className="mt-1 text-sm text-slate-500">
              Team member management can be connected to authentication when the
              backend is introduced.
            </p>
            <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Invite and role management template ready for backend integration.
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="font-bold text-red-600">Data tools</h3>
            <p className="mt-1 text-sm text-slate-500">
              Restore the demonstration records used by the development
              template.
            </p>
            <button
              onClick={() => {
                resetData();
                window.alert("Sample data restored");
              }}
              className="mt-3 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
            >
              Restore sample data
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
function Field({ label, value, onChange }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-[#7FCFC0]"
      />
    </label>
  );
}
export default Settings;
