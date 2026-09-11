import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err) {
      setError(err.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
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
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#063D35] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
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