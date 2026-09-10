
// Handles both /login and /register 

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandLockup, LogoMark } from "../components/Brand";
import { SocialCircleButton } from "../components/SocialButtons";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setModeState] = useState(location.pathname.includes("register") ? "register" : "login");
  const isLogin = mode === "login";

  function setMode(next) {
    setModeState(next);
    navigate(next === "register" ? "/register" : "/login", { replace: true });
  }

  return (
    <div className="ss-authpage">
      <div className="ss-authpage-bg" aria-hidden="true" />
      <BrandLockup size={38} wordmarkSize="md" tagline />

      <div className={"ss-authcard" + (isLogin ? " is-login" : " is-register")}>
        <div className="ss-authcard-color">
          <LogoMark size={30} light />
          <h2 className="ss-authcard-greeting">{isLogin ? "Hello, Welcome!" : "Welcome Back!"}</h2>
          <p className="ss-authcard-greeting-sub">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}
          </p>
          <button className="ss-btn ss-btn-invert-outline" onClick={() => setMode(isLogin ? "register" : "login")}>
            {isLogin ? "Register" : "Login"}
          </button>
        </div>

        <div className="ss-authcard-form">
          {isLogin ? <LoginForm /> : <RegisterForm onDone={() => navigate("/register-business")} />}

          <div className="ss-divider"><span>or continue with</span></div>
          <div className="ss-social-row">
            <SocialCircleButton kind="google" label="Continue with Google" />
            <SocialCircleButton kind="apple" label="Continue with Apple" />
          </div>

          <p className="ss-legal-foot">
            By continuing you agree to our Terms &amp; Conditions and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      
      // ProtectedRoute checking GET /api/business is the usual pattern.
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Couldn't log in — check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="ss-login-title">Login</h1>
      <form onSubmit={handleSubmit} className="ss-form">
        <label className="ss-field">
          <span>Email</span>
          <input type="email" required placeholder="you@business.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="ss-field">
          <span>Password</span>
          <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="ss-form-error">{error}</p>}
        <button type="button" className="ss-link-btn ss-forgot">Forgot password?</button>
        <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
    </>
  );
}

function RegisterForm({ onDone }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const passwordTooShort = form.password.length > 0 && form.password.length < 6;
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6 || form.password !== form.confirmPassword) return;
    setLoading(true);
    try {
      await register(form.fullName.trim(), form.email.trim(), form.password);
      onDone();
    } catch (err) {
      setError(err.message || "Couldn't create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="ss-login-title">Registration</h1>
      <form onSubmit={handleSubmit} className="ss-form">
        <label className="ss-field">
          <span>Full name</span>
          <input required placeholder="Enter your full name" value={form.fullName} onChange={set("fullName")} />
        </label>
        <label className="ss-field">
          <span>Email</span>
          <input type="email" required placeholder="your@email.com" value={form.email} onChange={set("email")} />
        </label>
        <label className="ss-field">
          <span>Password</span>
          <input type="password" required minLength={6} placeholder="At least 6 characters" value={form.password} onChange={set("password")} />
        </label>
        <label className="ss-field">
          <span>Confirm password</span>
          <input type="password" required placeholder="Repeat password" value={form.confirmPassword} onChange={set("confirmPassword")} />
        </label>
        {passwordTooShort && <p className="ss-form-error">Password must be at least 6 characters.</p>}
        {passwordsMismatch && <p className="ss-form-error">Passwords don't match.</p>}
        {error && <p className="ss-form-error">{error}</p>}
        <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
    </>
  );
}
