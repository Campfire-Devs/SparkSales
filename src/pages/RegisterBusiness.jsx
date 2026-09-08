import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSparkSales } from "../context/SparkSalesContext";
function RegisterBusiness() {
  const { setBusiness } = useSparkSales();
  const nav = useNavigate();
  const [f, setF] = useState({
    name: "",
    category: "",
    owner: "",
    contact: "",
    location: "",
    accepted: false,
  });
  const submit = (e) => {
    e.preventDefault();
    if (!f.accepted) return;
    setBusiness(f);
    nav("/dashboard");
  };
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#4FAF9D]">
          SparkSales setup
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">Register your business</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a working business profile for the Entrepreneurship Day
          template.
        </p>
      </div>
      <form
        onSubmit={submit}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Business name"
            value={f.name}
            set={(v) => setF({ ...f, name: v })}
          />
          <Field
            label="Category"
            value={f.category}
            set={(v) => setF({ ...f, category: v })}
          />
          <Field
            label="Owner / team lead"
            value={f.owner}
            set={(v) => setF({ ...f, owner: v })}
          />
          <Field
            label="Contact"
            value={f.contact}
            set={(v) => setF({ ...f, contact: v })}
          />
          <Field
            label="Location"
            value={f.location}
            set={(v) => setF({ ...f, location: v })}
          />
        </div>
        <label className="mt-5 flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={f.accepted}
            onChange={(e) => setF({ ...f, accepted: e.target.checked })}
            className="mt-1"
            required
          />
          I agree to the{" "}
          <a
            href="/terms-and-conditions"
            className="font-semibold text-[#063D35]"
          >
            Terms & Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" className="font-semibold text-[#063D35]">
            Privacy Policy
          </a>
          .
        </label>
        <button className="mt-6 w-full rounded-xl bg-[#063D35] py-3 text-sm font-bold text-white">
          Create business profile
        </button>
      </form>
    </div>
  );
}
function Field({ label, value, set }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        required
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal"
      />
    </label>
  );
}
export default RegisterBusiness;
