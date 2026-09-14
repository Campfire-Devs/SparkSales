import { useState } from "react";
import { Link } from "react-router-dom";
import { BrandLockup } from "../components/Brand";
import { api } from "../lib/apiClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.forgotPassword(email.trim());
      // Always show the same confirmation, whether or not the email is
      // registered — the backend deliberately doesn't reveal that either.
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ss-setup-page">
      <div className="ss-authpage-bg" aria-hidden="true" />
      <BrandLockup size={38} wordmarkSize="md" tagline />

      <section className="ss-setup-card" aria-labelledby="forgot-title">
        <div className="ss-setup-intro">
          <p className="ss-setup-eyebrow">SparkSales</p>
          <h1 id="forgot-title">Forgot your password?</h1>
          <p>Enter the email on your account and we'll send you a reset link.</p>
        </div>

        {sent ? (
          <div className="ss-form">
            <p className="ss-sub">
              If that email is registered, a reset link is on its way — check your inbox
              (and spam folder) for a message from SparkSales.
            </p>
            <Link to="/login" className="ss-btn ss-btn-primary ss-btn-block">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="ss-form">
            <label className="ss-field">
              <span>Email</span>
              <input
                type="email"
                required
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {error && <p className="ss-form-error">{error}</p>}
            <button type="submit" className="ss-btn ss-btn-primary ss-btn-block" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
            <Link to="/login" className="ss-link-btn ss-forgot" style={{ textAlign: "center", display: "block" }}>
              Back to login
            </Link>
          </form>
        )}
      </section>
    </div>
  );
}

export default ForgotPassword;
