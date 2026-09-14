import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { BrandLockup } from "../components/Brand";
import { api } from "../lib/apiClient";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < 6;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }
    if (password.length < 6 || password !== confirmPassword) return;

    setLoading(true);
    try {
      await api.resetPassword(token, password);
      navigate("/login", { replace: true, state: { passwordReset: true } });
    } catch (err) {
      setError(err.message || "This reset link is invalid or has expired. Please request a new one.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ss-setup-page">
      <div className="ss-authpage-bg" aria-hidden="true" />
      <BrandLockup size={38} wordmarkSize="md" tagline />

      <section className="ss-setup-card" aria-labelledby="reset-title">
        <div className="ss-setup-intro">
          <p className="ss-setup-eyebrow">SparkSales</p>
          <h1 id="reset-title">Choose a new password</h1>
          <p>Reset links expire after 30 minutes.</p>
        </div>

        {!token ? (
          <div className="ss-form">
            <p className="ss-form-error">
              This link is missing its reset token — please open it directly from the
              email we sent, or request a new one.
            </p>
            <Link to="/forgot-password" className="ss-btn ss-btn-primary ss-btn-block">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ss-form">
            <label className="ss-field">
              <span>New password</span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="ss-field">
              <span>Confirm new password</span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
            {passwordTooShort && <p className="ss-form-error">Password must be at least 6 characters.</p>}
            {passwordsMismatch && <p className="ss-form-error">Passwords don't match.</p>}
            {error && <p className="ss-form-error">{error}</p>}
            <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={loading}>
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default ResetPassword;
