import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSparkSales } from "../context/SparkSalesContext";
import { useAuth } from "../context/AuthContext";
import { BrandLockup } from "../components/Brand";

function RegisterBusiness() {
  const { setBusiness } = useSparkSales();
  const { token } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({
    name: "",
    category: "",
    owner: "",
    contact: "",
    location: "",
    accepted: false,
  });

  useEffect(() => {
    if (!token) nav("/register", { replace: true });
  }, [nav, token]);

  const submit = (e) => {
    e.preventDefault();
    if (!token || !f.accepted) return;
    setBusiness(f);
    nav("/dashboard");
  };

  return (
    <div className="ss-setup-page">
      <div className="ss-authpage-bg" aria-hidden="true" />
      <BrandLockup size={38} wordmarkSize="md" tagline />

      <section className="ss-setup-card" aria-labelledby="setup-title">
        <div className="ss-setup-intro">
          <p className="ss-setup-eyebrow">SparkSales setup</p>
          <h1 id="setup-title">Register your business</h1>
          <p>
            Set up your workspace so your team can start tracking sales,
            expenses and profit.
          </p>
        </div>

        <form onSubmit={submit} className="ss-form ss-setup-form">
          <div className="ss-field-row">
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
          </div>
          <div className="ss-field-row">
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
          </div>
          <Field
            label="Location"
            value={f.location}
            set={(v) => setF({ ...f, location: v })}
          />
        <label className="ss-setup-terms">
          <input
            type="checkbox"
            checked={f.accepted}
            onChange={(e) => setF({ ...f, accepted: e.target.checked })}
            required
          />
          I agree to the{" "}
          <a
            href="/terms-and-conditions"
            className="ss-setup-link"
          >
            Terms & Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" className="ss-setup-link">
            Privacy Policy
          </a>
          .
        </label>
        <button type="submit" className="ss-btn ss-btn-primary ss-btn-block">
          Create business profile
        </button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, value, set }) {
  return (
    <label className="ss-field">
      {label}
      <input
        required
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </label>
  );
}
export default RegisterBusiness;
