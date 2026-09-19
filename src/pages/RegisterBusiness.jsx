import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useSparkSales } from "../context/SparkSalesContext";
import { useAuth } from "../context/AuthContext";
import { createBusiness } from "../api/businessApi";

import { BrandLockup } from "../components/Brand";

import {
  BUSINESS_CATEGORIES,
  sanitizeSAPhoneInput,
  isValidSAPhoneNumber,
} from "../utils/sparkSales";

const DRAFT_KEY = "sparksales-register-business-draft";

const emptyDraft = {
  name: "",
  category: BUSINESS_CATEGORIES[0],
  owner: "",
  contact: "",
  location: "",
  stallNumber: "",
  startingCapital: "",
  accepted: false,
};

function loadDraft() {
  try {
    return {
      ...emptyDraft,
      ...JSON.parse(sessionStorage.getItem(DRAFT_KEY)),
    };
  } catch {
    return emptyDraft;
  }
}

function RegisterBusiness() {
  const { setBusiness } = useSparkSales();
  const { token, account } = useAuth();
  const nav = useNavigate();

  const [f, setF] = useState(loadDraft);
  const [contactError, setContactError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [saving, setSaving] = useState(false);

  // Redirect unauthenticated users.
  useEffect(() => {
    if (!token) {
      nav("/register", { replace: true });
    }
  }, [nav, token]);

  // Preserve draft while navigating to Terms / Privacy.
  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(f));
  }, [f]);

  const submit = async (e) => {
    e.preventDefault();

    if (!token || saving) {
      return;
    }

    setSubmitError("");

    if (!isValidSAPhoneNumber(f.contact)) {
      setContactError(
        "Enter a valid South African number — 10 digits, starting with 0 (e.g. 0821234567)."
      );
      return;
    }

    setContactError("");

    try {
      setSaving(true);

      const business = await createBusiness({
        name: f.name.trim(),
        category: f.category,
        contact: f.contact.trim(),
        location: f.location.trim(),
        stallNumber: f.stallNumber.trim(),
        startingCapital: Number(f.startingCapital) || 0,
      });

      /*
       * Temporary compatibility step:
       * keep the returned business available to the existing
       * SparkSales context while we finish removing localStorage
       * from the financial system.
       */
      setBusiness({
        ...business,
        owner: f.owner || account?.fullName || "Business Owner",
      });

      sessionStorage.removeItem(DRAFT_KEY);

      nav("/dashboard");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to create your business. Please try again."
      );
    } finally {
      setSaving(false);
    }
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

            <label className="ss-field">
              Category

              <select
                required
                value={f.category}
                onChange={(e) =>
                  setF({
                    ...f,
                    category: e.target.value,
                  })
                }
              >
                {BUSINESS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="ss-field-row">
            <Field
              label="Owner / team lead"
              value={f.owner}
              set={(v) => setF({ ...f, owner: v })}
            />

            <label className="ss-field">
              Contact

              <input
                required
                value={f.contact}
                onChange={(e) =>
                  setF({
                    ...f,
                    contact: sanitizeSAPhoneInput(e.target.value),
                  })
                }
                placeholder="0821234567"
                inputMode="numeric"
              />

              {contactError && (
                <p className="ss-form-error">{contactError}</p>
              )}
            </label>
          </div>

          <div className="ss-field-row">
            <Field
              label="Location"
              value={f.location}
              set={(v) => setF({ ...f, location: v })}
            />

            <Field
              label="Stall number"
              value={f.stallNumber}
              set={(v) => setF({ ...f, stallNumber: v })}
            />
          </div>

          <label className="ss-field">
            Starting capital (R)

            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={f.startingCapital}
              onChange={(e) =>
                setF({
                  ...f,
                  startingCapital: e.target.value,
                })
              }
              placeholder="e.g. 500"
            />
          </label>

          {submitError && (
            <p className="ss-form-error">{submitError}</p>
          )}

          <label className="ss-setup-terms">
            <input
              type="checkbox"
              checked={f.accepted}
              onChange={(e) =>
                setF({
                  ...f,
                  accepted: e.target.checked,
                })
              }
              required
            />

            I agree to{" "}
            <Link
              to="/terms-and-conditions"
              className="ss-setup-link"
            >
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="ss-setup-link"
            >
              Privacy Policy
            </Link>
            .
          </label>

          <button
            type="submit"
            className="ss-btn ss-btn-primary ss-btn-block"
            disabled={saving}
          >
            {saving ? "Creating business..." : "Create business profile"}
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