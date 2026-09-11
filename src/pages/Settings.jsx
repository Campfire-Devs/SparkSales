import { useState, useEffect } from "react";
import { api } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";
import { useSparkSales } from "../context/SparkSalesContext";
import { SocialCircleButton } from "../components/SocialButtons";
import { BUSINESS_CATEGORIES } from "../utils/sparkSales";

const MIN_COMMISSION_PERCENT = 5;
const SETTINGS_STORAGE_KEY = "sparksales-settings-v1";

export default function SettingsPage() {
  const { account, logout } = useAuth();
  const { business: storedBusiness, setBusiness: saveBusiness } = useSparkSales();
  const business = storedBusiness;
  const [teamMembers, setTeamMembers] = useState(() => readSettings("team", []));
  const [appSettings, setAppSettings] = useState(() => readSettings("app", {
    dailySummaryEmail: false,
    notificationEmail: "",
    lossAlerts: false,
  }));
  const [deletionRequest, setDeletionRequest] = useState(null);

  useEffect(() => {
    if (account?.email) {
      api.getDeletionRequest(account.email).then(setDeletionRequest).catch(() => {});
    }
  }, [account?.email]);

  if (!business) return <div className="ss-screen"><p className="ss-sub">Set up your business first.</p></div>;

  return (
    <div className="ss-screen">
      <div className="ss-screen-head">
        <div><h1 className="ss-h1">Settings</h1><p className="ss-sub">Your account, business profile, team, and app preferences.</p></div>
      </div>

      <BusinessSection business={business} onSave={saveBusiness} />
      <AccountSecuritySection account={account} />
      <TeamSection teamMembers={teamMembers} setTeamMembers={setTeamMembers} />
      <ApplicationSettingsSection
        business={business} setBusiness={saveBusiness}
        appSettings={appSettings} setAppSettings={setAppSettings} account={account}
      />

      <button className="ss-btn ss-btn-outline ss-btn-block-sm" onClick={logout}>Log out</button>

      <DangerZoneSection business={business} account={account} deletionRequest={deletionRequest} setDeletionRequest={setDeletionRequest} />
    </div>
  );
}

function readSettings(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(`${SETTINGS_STORAGE_KEY}-${key}`)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeSettings(key, value) {
  localStorage.setItem(`${SETTINGS_STORAGE_KEY}-${key}`, JSON.stringify(value));
}

function BusinessSection({ business, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(business);
  const [saving, setSaving] = useState(false);
  const initials = business.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...business,
        ...form,
        startingCapital: Number(form.startingCapital) || 0,
      };
      onSave(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="ss-card ss-profile-card">
        <div className="ss-profile-top">
          <div className="ss-profile-avatar">{initials}</div>
          <div className="ss-profile-info">
            <h2 className="ss-profile-name">{business.name}</h2>
            <div className="ss-profile-pills">
              <span className="ss-pill ss-pill-neutral">{business.category}</span>
              <span className="ss-pill ss-pill-neutral">Stall {business.stallNumber}</span>
            </div>
          </div>
          {!editing && <button className="ss-btn ss-btn-outline ss-btn-sm" onClick={() => { setForm(business); setEditing(true); }}>Edit</button>}
        </div>
      </section>

      <section className="ss-card">
        <div className="ss-card-head"><h2>Business information</h2></div>
        {!editing ? (
          <div className="ss-settings-grid">
            <div><span className="ss-stat-label">Name</span><p>{business.name}</p></div>
            <div><span className="ss-stat-label">Category</span><p>{business.category}</p></div>
            <div><span className="ss-stat-label">Owner / team lead</span><p>{business.owner || "Not provided"}</p></div>
            <div><span className="ss-stat-label">Contact</span><p>{business.contact || "Not provided"}</p></div>
            <div><span className="ss-stat-label">Location</span><p>{business.location || "Not provided"}</p></div>
            <div><span className="ss-stat-label">Stall / table</span><p>{business.stallNumber}</p></div>
            <div><span className="ss-stat-label">Starting capital</span><p className="ss-mono">R {Number(business.startingCapital).toFixed(2)}</p></div>
          </div>
        ) : (
          <form className="ss-form" onSubmit={save}>
            <label className="ss-field"><span>Business name</span>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </label>
            <div className="ss-field-row">
              <label className="ss-field"><span>Owner / team lead</span>
                <input value={form.owner || ""} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} />
              </label>
              <label className="ss-field"><span>Contact</span>
                <input value={form.contact || ""} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
              </label>
            </div>
            <div className="ss-field-row">
              <label className="ss-field"><span>Category</span>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="ss-field"><span>Stall / table no.</span>
                <input value={form.stallNumber || ""} onChange={(e) => setForm((f) => ({ ...f, stallNumber: e.target.value }))} />
              </label>
            </div>
            <label className="ss-field"><span>Starting capital</span>
              <input type="number" min="0" value={form.startingCapital} onChange={(e) => setForm((f) => ({ ...f, startingCapital: e.target.value }))} />
            </label>
            <label className="ss-field"><span>Location</span>
              <input value={form.location || ""} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </label>
            <div className="ss-terms-actions" style={{ justifyContent: "flex-start" }}>
              <button type="submit" className="ss-btn ss-btn-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
              <button type="button" className="ss-btn ss-btn-outline" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}

function AccountSecuritySection({ account }) {
  const accountDetails = account || { fullName: "Account owner", email: "" };

  return (
    <section className="ss-card">
      <div className="ss-card-head"><h2>Account &amp; security</h2></div>
      <div className="ss-settings-grid" style={{ marginBottom: 20 }}>
        <div><span className="ss-stat-label">Name</span><p>{accountDetails.fullName}</p></div>
        <div><span className="ss-stat-label">Email</span><p>{accountDetails.email || "Not available"}</p></div>
      </div>

      <ChangePasswordForm />

      <div className="ss-connected-head">Connected accounts</div>
      <div className="ss-connected-row">
        <div className="ss-connected-label">
          <span className="ss-connected-icon"><SocialCircleButton kind="google" label="Google" disabled /></span>
        </div>
      </div>
      <p className="ss-sub" style={{ marginTop: 8 }}>
        Google/Apple sign-in isn't wired up on the backend yet — see the API README's "Google / Apple sign-in" section.
      </p>
    </section>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState(""); // "", "saving", "success", "error"
  const [error, setError] = useState("");
  const tooShort = form.next.length > 0 && form.next.length < 6;
  const mismatch = form.confirm.length > 0 && form.next !== form.confirm;
  const canSubmit = form.current && form.next.length >= 6 && form.next === form.confirm;

  async function submit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("saving");
    setError("");
    try {
      await api.changePassword({ currentPassword: form.current, newPassword: form.next });
      setForm({ current: "", next: "", confirm: "" });
      setStatus("success");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      setError(err.message || "Couldn't update your password.");
      setStatus("error");
    }
  }

  return (
    <form className="ss-form" onSubmit={submit} style={{ marginBottom: 22 }}>
      <div className="ss-connected-head" style={{ marginBottom: 4 }}>Change password</div>
      <label className="ss-field"><span>Current password</span>
        <input type="password" placeholder="••••••••" value={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))} />
      </label>
      <div className="ss-field-row">
        <label className="ss-field"><span>New password</span>
          <input type="password" placeholder="At least 6 characters" value={form.next} onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))} />
        </label>
        <label className="ss-field"><span>Confirm new password</span>
          <input type="password" placeholder="Repeat password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
        </label>
      </div>
      {tooShort && <p className="ss-form-error">Password must be at least 6 characters.</p>}
      {mismatch && <p className="ss-form-error">Passwords don't match.</p>}
      {status === "error" && <p className="ss-form-error">{error}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="submit" className="ss-btn ss-btn-outline ss-btn-sm" disabled={!canSubmit || status === "saving"}>
          {status === "saving" ? "Updating…" : "Update password"}
        </button>
        {status === "success" && <span className="ss-success-text">Password updated</span>}
      </div>
    </form>
  );
}

function TeamSection({ teamMembers, setTeamMembers }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Member");

  async function addMember(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const member = { teamMemberId: crypto.randomUUID(), name: name.trim(), role };
    setTeamMembers((m) => {
      const next = [...m, member];
      writeSettings("team", next);
      return next;
    });
    setName(""); setRole("Member"); setAdding(false);
  }

  async function removeMember(id) {
    setTeamMembers((m) => {
      const next = m.filter((x) => x.teamMemberId !== id);
      writeSettings("team", next);
      return next;
    });
  }

  return (
    <section className="ss-card">
      <div className="ss-card-head">
        <h2>Team members</h2>
        <button className="ss-btn ss-btn-outline ss-btn-sm" onClick={() => setAdding((v) => !v)}>Add member</button>
      </div>

      {adding && (
        <form className="ss-form" onSubmit={addMember} style={{ marginBottom: 16 }}>
          <label className="ss-field"><span>Name</span>
            <input required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Team Members Name" />
          </label>
          <label className="ss-field"><span>Role</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Owner</option><option>Manager</option><option>Cashier</option><option>Member</option>
            </select>
          </label>
          <button type="submit" className="ss-btn ss-btn-primary">Add</button>
        </form>
      )}

      {teamMembers.length === 0 ? (
        <p className="ss-sub">No team members added yet.</p>
      ) : (
        <ul className="ss-team-list">
          {teamMembers.map((m) => (
            <li key={m.teamMemberId} className="ss-team-row">
              <div className="ss-team-info">
                <span className="ss-team-name">{m.name}</span>
                <span className="ss-team-role">{m.role}</span>
              </div>
              <button className="ss-icon-btn" onClick={() => removeMember(m.teamMemberId)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ApplicationSettingsSection({ business, setBusiness, appSettings, setAppSettings, account }) {
  const accountDetails = account || { email: "" };
  const [rateInput, setRateInput] = useState(String(Math.max(
    MIN_COMMISSION_PERCENT,
    Math.round((Number(business.commissionRate) || 0.05) * 100)
  )));

  async function saveRate() {
    const rate = Math.min(
      Math.max(Number(rateInput) || MIN_COMMISSION_PERCENT, MIN_COMMISSION_PERCENT),
      100
    ) / 100;
    setRateInput(String(Math.round(rate * 100)));
    setBusiness((b) => ({ ...b, commissionRate: rate }));
  }

  async function saveSettings(next) {
    writeSettings("app", next);
    setAppSettings(next);
  }

  return (
    <section className="ss-card">
      <div className="ss-card-head"><h2>Application settings</h2></div>
      <div className="ss-rate-row" style={{ marginBottom: 18 }}>
        <label className="ss-field ss-field-inline">
          <span>Commission rate</span>
          <div className="ss-rate-input">
            <input type="number" min={MIN_COMMISSION_PERCENT} max="100" value={rateInput} onChange={(e) => setRateInput(e.target.value)} onBlur={saveRate} />
            <span>%</span>
          </div>
        </label>
      </div>

      <label className="ss-field-inline" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
        <span className="ss-setting-title">Daily summary email</span>
        <input
          type="checkbox" checked={appSettings.dailySummaryEmail}
          onChange={(e) => saveSettings({ ...appSettings, dailySummaryEmail: e.target.checked })}
        />
      </label>
      {appSettings.dailySummaryEmail && (
        <label className="ss-field" style={{ margin: "0 0 14px" }}>
          <span>Send summaries to</span>
            <input
            type="email" placeholder={accountDetails.email} value={appSettings.notificationEmail || ""}
            onChange={(e) => saveSettings({ ...appSettings, notificationEmail: e.target.value })}
          />
        </label>
      )}

      <label className="ss-field-inline" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
        <span className="ss-setting-title">Loss alerts</span>
        <input
          type="checkbox" checked={appSettings.lossAlerts}
          onChange={(e) => saveSettings({ ...appSettings, lossAlerts: e.target.checked })}
        />
      </label>
    </section>
  );
}

function DangerZoneSection({ business, account, deletionRequest, setDeletionRequest }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const canRequest = confirmText.trim().toLowerCase() === business.name.trim().toLowerCase();

  async function submitRequest() {
    if (!account?.email) {
      setError("You need to be signed in to request removal.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const req = await api.requestDeletion(account.email, business.name, reason);
      setDeletionRequest(req);
      setOpen(false);
    } catch (err) {
      setError(err.message || "Couldn't submit the removal request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelRequest() {
    setSubmitting(true);
    setError("");
    try {
      await api.cancelDeletion(deletionRequest.id);
      setDeletionRequest(null);
    } catch (err) {
      setError(err.message || "Couldn't cancel the removal request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="ss-card ss-danger-card">
      <div className="ss-card-head"><h2>Delete account</h2></div>
      {error && <p className="ss-form-error" style={{ marginBottom: 12 }}>{error}</p>}
      {deletionRequest ? (
        <>
          <p className="ss-sub" style={{ marginBottom: 14 }}>
            Removal requested on {new Date(deletionRequest.requestedAt).toLocaleDateString()}.
            You'll get a confirmation email once {business.name} has been permanently removed.
          </p>
          <button className="ss-btn ss-btn-outline" disabled={submitting} onClick={cancelRequest}>
            {submitting ? "Cancelling…" : "Cancel request"}
          </button>
        </>
      ) : open ? (
        <div>
          <label className="ss-field"><span>Reason (optional)</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Event has ended" />
          </label>
          <label className="ss-field" style={{ marginTop: 12 }}>
            <span>Type <strong className="ss-mono">{business.name}</strong> to confirm</span>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={business.name} />
          </label>
          <div className="ss-terms-actions" style={{ marginTop: 14 }}>
            <button className="ss-btn ss-btn-outline" disabled={submitting} onClick={() => setOpen(false)}>Cancel</button>
            <button className="ss-btn ss-btn-danger" disabled={!canRequest || submitting} onClick={submitRequest}>
              {submitting ? "Submitting…" : "Request removal"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="ss-sub" style={{ marginBottom: 14 }}>
            Requesting removal notifies the SparkSales team to permanently delete {business.name} and all its data.
          </p>
          <button className="ss-btn ss-btn-danger" onClick={() => { setError(""); setOpen(true); }}>Request account deletion</button>
        </>
      )}
    </section>
  );
}