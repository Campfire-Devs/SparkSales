import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BrandLockup, LogoMark } from "../components/Brand";

const particles = Array.from({ length: 8 }, (_, index) => index);

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode = location.pathname.includes("register") ? "register" : "login";
  const isLogin = mode === "login";

  function changeMode(next) {
    navigate(next === "register" ? "/register" : "/login", { replace: true });
  }

  return (
    <main className="ss-authpage">
      <div className="ss-authpage-bg" aria-hidden="true" />
      <BrandLockup className="ss-auth-desktop-lockup" size={38} wordmarkSize="md" tagline />

      <section className={`ss-authcard ${isLogin ? "is-login" : "is-register"}`} aria-label="Account access">
        <div className="ss-authcard-color">
          <div className="ss-auth-mobile-brand">
            <BrandLockup size={38} wordmarkSize="md" light tagline animated />
          </div>
          <div className="ss-auth-desktop-greeting">
            <LogoMark size={30} light />
            <h2 className="ss-authcard-greeting" key={mode}>
              {isLogin ? "Hello, Welcome!" : "Welcome Back!"}
            </h2>
            <p className="ss-authcard-greeting-sub" key={`subtitle-${mode}`}>
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}
            </p>
            <button
              type="button"
              className="ss-btn ss-btn-invert-outline ss-auth-desktop-switch"
              onClick={() => changeMode(isLogin ? "register" : "login")}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
          <div className="ss-auth-particles" aria-hidden="true">
            {particles.map((particle) => <span key={particle} />)}
          </div>
        </div>

        <div className="ss-authcard-form">
          <div className="ss-auth-toggle" role="tablist" aria-label="Choose login or registration">
            <span className="ss-auth-toggle-highlight" aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              className={isLogin ? "is-active" : ""}
              onClick={() => changeMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              className={!isLogin ? "is-active" : ""}
              onClick={() => changeMode("register")}
            >
              Register
            </button>
          </div>

          <div className="ss-auth-form-content" key={mode}>
            {isLogin ? <LoginForm /> : <RegisterForm onDone={() => navigate("/register-business")} />}
            <p className="ss-legal-foot">
              By continuing you agree to our Terms &amp; Conditions and Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthField({ id, label, value, onChange, type = "text", required = false, minLength, placeholder = " " }) {
  const [isVisible, setIsVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={`ss-auth-field${isPassword ? " has-password-toggle" : ""}`}>
      <div className="ss-auth-input-wrap">
        <input
          id={id}
          name={id}
          type={isPassword && isVisible ? "text" : type}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={
            id.endsWith("-email") ? "email"
              : id === "login-password" ? "current-password"
                : id.includes("password") ? "new-password"
                  : id === "register-name" ? "name"
                    : undefined
          }
        />
        <label htmlFor={id}>{label}</label>
        {isPassword && (
          <button
            type="button"
            className="ss-password-toggle"
            aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={isVisible}
            onClick={() => setIsVisible((visible) => !visible)}
          >
            {isVisible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const justResetPassword = Boolean(location.state?.passwordReset);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
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
      {justResetPassword && <p className="ss-success-text">Password reset — you can now log in.</p>}
      <form onSubmit={handleSubmit} className="ss-form">
        <AuthField id="login-email" label="Email" type="email" required placeholder="your@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <AuthField id="login-password" label="Password" type="password" required placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p className="ss-form-error" role="alert">{error}</p>}
        <button type="button" className="ss-link-btn ss-forgot" onClick={() => navigate("/forgot-password")}>
          Forgot password?
        </button>
        <button type="submit" className="ss-btn ss-btn-primary ss-btn-block ss-auth-submit" disabled={loading}>
          {loading && <span className="ss-auth-spinner" aria-hidden="true" />}
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
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const passwordInvalid = form.password.length > 0
    && (form.password.length < 8 || !/\p{L}/u.test(form.password) || !/\p{Nd}/u.test(form.password));
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (passwordInvalid || form.password !== form.confirmPassword) return;
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
        <AuthField id="register-name" label="Full name" required placeholder="Enter your full name" value={form.fullName} onChange={set("fullName")} />
        <AuthField id="register-email" label="Email" type="email" required placeholder="your@email.com" value={form.email} onChange={set("email")} />
        <AuthField id="register-password" label="Password" type="password" required minLength={8} placeholder="8+ characters, a letter & number" value={form.password} onChange={set("password")} />
        <AuthField id="register-confirm-password" label="Confirm password" type="password" required minLength={8} placeholder="Re-enter your password" value={form.confirmPassword} onChange={set("confirmPassword")} />
        {passwordInvalid && <p className="ss-form-error" role="alert">Password must be at least 8 characters and contain at least one letter and one number.</p>}
        {passwordsMismatch && <p className="ss-form-error" role="alert">Passwords don't match.</p>}
        {error && <p className="ss-form-error" role="alert">{error}</p>}
        <button type="submit" className="ss-btn ss-btn-primary ss-btn-block ss-auth-submit" disabled={loading}>
          {loading && <span className="ss-auth-spinner" aria-hidden="true" />}
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
    </>
  );
}
