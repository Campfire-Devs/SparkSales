import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    if (email && password) nav("/dashboard");
  };
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#063D35] text-2xl font-extrabold text-[#B8F2E6]">
            S
          </div>
          <h1 className="mt-4 text-2xl font-extrabold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to your SparkSales workspace.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
          />
          <button className="w-full rounded-xl bg-[#063D35] py-3 text-sm font-bold text-white">
            Sign in
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          New business?{" "}
          <Link className="font-bold text-[#063D35]" to="/register-business">
            Register your business
          </Link>
        </p>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, ...p }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        {...p}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-[#7FCFC0]"
      />
    </label>
  );
}
export default Login;
