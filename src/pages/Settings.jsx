import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  ChevronDown,
  Clock3,
  Crown,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";

import { api } from "../lib/apiClient";
import {
  apiRequest,
  setAuthToken,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useSparkSales } from "../context/SparkSalesContext";
import {
  BUSINESS_CATEGORIES,
  sanitizeSAPhoneInput,
  isValidSAPhoneNumber,
} from "../utils/sparkSales";

const MIN_COMMISSION_PERCENT = 5;
const SETTINGS_STORAGE_KEY = "sparksales-settings-v1";

const APP_DEFAULTS = {
  dailySummaryEmail: false,
  notificationEmail: "",
  lossAlerts: false,
};

const pageVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: "easeOut",
    },
  },
};

export default function SettingsPage() {
  const { account, logout, token } = useAuth();

  const {
    business: storedBusiness,
    setBusiness: saveBusiness,
    refreshData,
  } = useSparkSales();

  const business = storedBusiness;
  const namespace = accountNamespace(account);

  const [teamMembers, setTeamMembers] = useState(() =>
    readSettings(namespace, "team", []),
  );

  const [appSettings, setAppSettings] = useState(() =>
    readSettings(
      namespace,
      "app",
      APP_DEFAULTS,
    ),
  );

  const [draftAppSettings, setDraftAppSettings] =
    useState(appSettings);

  const appSettingsDirty =
    JSON.stringify(appSettings) !==
    JSON.stringify(draftAppSettings);

  const [saveStatus, setSaveStatus] =
    useState("idle");

  const [deletionRequest, setDeletionRequest] =
    useState(null);

  if (!business) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F7F3] text-[#063D35]">
            <Building2 size={24} />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Set up your business first.
          </p>
        </div>
      </div>
    );
  }

  async function saveApplicationSettings() {
    setSaveStatus("saving");

    try {
      writeSettings(
        namespace,
        "app",
        draftAppSettings,
      );

      setAppSettings(draftAppSettings);
      setSaveStatus("success");

      window.setTimeout(() => {
        setSaveStatus("idle");
      }, 2600);
    } catch (error) {
      console.error(
        "Failed to save application settings:",
        error,
      );

      setSaveStatus("error");
    }
  }

  return (
    <motion.div
      className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ===================================================== */}
      {/* HEADER                                                  */}
      {/* ===================================================== */}

      <motion.div
        variants={sectionVariants}
        className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8F2E6] bg-[#E6F7F3] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#063D35]">
            <Sparkles size={13} />
            Workspace settings
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#063D35] sm:text-4xl">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your business profile, account security,
            team and SparkSales preferences from one place.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
            <ShieldCheck size={17} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400">
              Account
            </p>

            <p className="max-w-[200px] truncate text-sm font-bold text-slate-800">
              {account?.email || "Signed in"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ===================================================== */}
      {/* BUSINESS PROFILE HERO                                  */}
      {/* ===================================================== */}

      <motion.section
        variants={sectionVariants}
        className="overflow-hidden rounded-3xl border border-[#0B6156] bg-[#063D35] shadow-xl shadow-[#063D35]/10"
      >
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#7FCFC0]/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-white/5 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{
                  scale: 1.04,
                  rotate: -2,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 18,
                }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#7FCFC0] text-lg font-black text-[#063D35] shadow-lg shadow-black/10"
              >
                {businessInitials(
                  business.name,
                )}
              </motion.div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#B8F2E6]">
                  Active business
                </p>

                <h2 className="mt-1 truncate text-2xl font-black text-white">
                  {business.name}
                </h2>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                    {business.category}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                    Stall {business.stallNumber || "—"}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => {
                const editButton =
                  document.getElementById(
                    "business-edit-trigger",
                  );

                editButton?.click();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#063D35] shadow-sm transition hover:bg-[#F7FAF9]"
            >
              <Pencil size={15} />
              Edit business
            </motion.button>
          </div>

          <div className="relative mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <HeroStat
              icon={MapPin}
              label="Location"
              value={business.location || "Not set"}
            />

            <HeroStat
              icon={Wallet}
              label="Starting capital"
              value={`R ${Number(
                business.startingCapital || 0,
              ).toFixed(2)}`}
            />

            <HeroStat
              icon={Crown}
              label="Commission"
              value={`${Math.round(
                (Number(
                  business.commissionRate,
                ) || 0.05) * 100,
              )}%`}
            />

            <HeroStat
              icon={Users}
              label="Team members"
              value={teamMembers.length}
            />
          </div>
        </div>
      </motion.section>

      {/* ===================================================== */}
      {/* BUSINESS INFORMATION                                   */}
      {/* ===================================================== */}

      <BusinessSection
        business={business}
        onSave={saveBusiness}
      />

      {/* ===================================================== */}
      {/* ACCOUNT SECURITY                                       */}
      {/* ===================================================== */}

      <motion.div variants={sectionVariants}>
        <AccountSecuritySection
          account={account}
        />
      </motion.div>

      {/* ===================================================== */}
      {/* TEAM                                                    */}
      {/* ===================================================== */}

      <motion.div variants={sectionVariants}>
        <TeamSection
          teamMembers={teamMembers}
          setTeamMembers={setTeamMembers}
          namespace={namespace}
        />
      </motion.div>

      {/* ===================================================== */}
      {/* APPLICATION SETTINGS                                    */}
      {/* ===================================================== */}

      <motion.div variants={sectionVariants}>
        <ApplicationSettingsSection
          business={business}
          token={token}
          refreshData={refreshData}
          appSettings={draftAppSettings}
          setAppSettings={setDraftAppSettings}
          account={account}
        />
      </motion.div>

      {/* ===================================================== */}
      {/* SESSION                                                 */}
      {/* ===================================================== */}

      <motion.section
        variants={sectionVariants}
        className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-[#063D35]">
              Sign out of SparkSales
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Your saved business data will remain safely
              stored in your account.
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{
              y: -1,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={logout}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Log out
          </motion.button>
        </div>
      </motion.section>

      {/* ===================================================== */}
      {/* DANGER ZONE                                            */}
      {/* ===================================================== */}

      <motion.div variants={sectionVariants}>
        <DangerZoneSection
          business={business}
          account={account}
          deletionRequest={deletionRequest}
          setDeletionRequest={setDeletionRequest}
        />
      </motion.div>

      {/* ===================================================== */}
      {/* STICKY SAVE BAR                                        */}
      {/* ===================================================== */}

      <AnimatePresence>
        {appSettingsDirty && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 30,
              scale: 0.98,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 22,
            }}
            className="fixed inset-x-0 bottom-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-4xl"
          >
            <div className="flex flex-col gap-3 rounded-2xl border border-[#B8F2E6] bg-white/95 p-3 shadow-2xl shadow-[#063D35]/15 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
                  <Save size={17} />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-[#063D35]">
                    You have unsaved changes
                  </p>

                  <p className="text-xs text-slate-400">
                    Save your SparkSales preferences before
                    leaving this page.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraftAppSettings(
                      appSettings,
                    );
                    setSaveStatus("idle");
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
                >
                  Discard
                </button>

                <motion.button
                  type="button"
                  onClick={saveApplicationSettings}
                  disabled={saveStatus === "saving"}
                  whileHover={{
                    y: -1,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052F29] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  {saveStatus === "saving" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save settings
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================== */}
      {/* SAVE SUCCESS TOAST                                     */}
      {/* ===================================================== */}

      <AnimatePresence>
        {saveStatus === "success" && (
          <motion.div
            initial={{
              opacity: 0,
              y: -12,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -12,
              scale: 0.96,
            }}
            className="fixed right-4 top-20 z-50"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-[#B8F2E6] bg-white px-4 py-3 shadow-xl shadow-[#063D35]/10">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
                <Check size={17} />
              </div>

              <div>
                <p className="text-sm font-extrabold text-[#063D35]">
                  Settings saved
                </p>

                <p className="text-xs text-slate-400">
                  Your preferences have been updated.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ========================================================= */
/* BUSINESS SECTION                                          */
/* ========================================================= */

function BusinessSection({
  business,
  onSave,
}) {
  const [editing, setEditing] =
    useState(false);

  const [form, setForm] = useState(
    business,
  );

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [contactError, setContactError] =
    useState("");

  // eslint-disable-next-line no-unused-vars
  const initials = businessInitials(
    business.name,
  );

  async function save(event) {
    event.preventDefault();

    const contact = form.contact || "";

    if (
      contact &&
      !isValidSAPhoneNumber(contact)
    ) {
      setContactError(
        "Enter a valid South African number — 10 digits, starting with 0.",
      );
      return;
    }

    setContactError("");
    setSaving(true);
    setSaved(false);

    try {
      const updated = {
        ...business,
        ...form,
        startingCapital:
          Number(form.startingCapital) || 0,
      };

      await onSave(updated);

      setEditing(false);
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2600);
    } catch (error) {
      setContactError(
        error?.message ||
          "We couldn't save your business details.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.section
      variants={sectionVariants}
      className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Business profile
          </p>

          <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
            Business information
          </h2>
        </div>

        {!editing && (
          <motion.button
            id="business-edit-trigger"
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setForm(business);
              setContactError("");
              setSaved(false);
              setEditing(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#063D35] transition hover:bg-[#E6F7F3]"
          >
            <Pencil size={15} />
            Edit details
          </motion.button>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {!editing ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Business name"
              value={business.name}
              icon={Building2}
            />

            <InfoItem
              label="Category"
              value={business.category}
              icon={Sparkles}
            />

            <InfoItem
              label="Owner / team lead"
              value={
                business.owner ||
                "Not provided"
              }
              icon={Crown}
            />

            <InfoItem
              label="Contact"
              value={
                business.contact ||
                "Not provided"
              }
              icon={Bell}
            />

            <InfoItem
              label="Location"
              value={
                business.location ||
                "Not provided"
              }
              icon={MapPin}
            />

            <InfoItem
              label="Stall / table"
              value={
                business.stallNumber ||
                "Not provided"
              }
              icon={MapPin}
            />

            <InfoItem
              label="Starting capital"
              value={`R ${Number(
                business.startingCapital || 0,
              ).toFixed(2)}`}
              icon={Wallet}
              highlight
            />
          </div>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={save}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Business name"
                value={form.name || ""}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    name: value,
                  }))
                }
                required
              />

              <Field
                label="Owner / team lead"
                value={form.owner || ""}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    owner: value,
                  }))
                }
              />

              <Field
                label="Contact"
                value={form.contact || ""}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    contact:
                      sanitizeSAPhoneInput(
                        value,
                      ),
                  }))
                }
                placeholder="0821234567"
                inputMode="numeric"
              />

              <SelectField
                label="Category"
                value={form.category || ""}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    category: value,
                  }))
                }
                options={
                  BUSINESS_CATEGORIES
                }
              />

              <Field
                label="Stall / table no."
                value={
                  form.stallNumber || ""
                }
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    stallNumber: value,
                  }))
                }
              />

              <Field
                label="Starting capital"
                type="number"
                min="0"
                step="0.01"
                value={
                  form.startingCapital ?? ""
                }
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    startingCapital:
                      value,
                  }))
                }
              />

              <div className="sm:col-span-2">
                <Field
                  label="Location"
                  value={
                    form.location || ""
                  }
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      location: value,
                    }))
                  }
                  placeholder="e.g. Limpopo"
                />
              </div>
            </div>

            <AnimatePresence>
              {contactError && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -5,
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                >
                  {contactError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setForm(business);
                  setContactError("");
                  setEditing(false);
                }}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063D35] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#052F29] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save business
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              className="mt-4 flex items-center gap-2 rounded-xl bg-[#E6F7F3] px-4 py-3 text-sm font-bold text-[#063D35]"
            >
              <Check size={15} />
              Business details saved successfully.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

/* ========================================================= */
/* ACCOUNT SECURITY                                          */
/* ========================================================= */

function AccountSecuritySection({
  account,
}) {
  const accountDetails = account || {
    fullName: "Account owner",
    email: "",
  };

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Security
        </p>

        <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
          Account & security
        </h2>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem
            label="Account name"
            value={accountDetails.fullName}
            icon={Users}
          />

          <InfoItem
            label="Email address"
            value={
              accountDetails.email ||
              "Not available"
            }
            icon={Mail}
          />
        </div>

        <ChangePasswordForm />
      </div>
    </section>
  );
}

/* ========================================================= */
/* PASSWORD                                                 */
/* ========================================================= */

function ChangePasswordForm() {
  const [form, setForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [status, setStatus] =
    useState("idle");

  const [error, setError] =
    useState("");

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNext, setShowNext] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const tooShort =
    form.next.length > 0 &&
    form.next.length < 6;

  const mismatch =
    form.confirm.length > 0 &&
    form.next !== form.confirm;

  const canSubmit =
    form.current &&
    form.next.length >= 6 &&
    form.next === form.confirm;

  async function submit(event) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setStatus("saving");
    setError("");

    try {
      await api.changePassword({
        currentPassword:
          form.current,
        newPassword: form.next,
      });

      setForm({
        current: "",
        next: "",
        confirm: "",
      });

      setStatus("success");

      window.setTimeout(() => {
        setStatus("idle");
      }, 3200);
    } catch (err) {
      setError(
        err?.message ||
          "Couldn't update your password.",
      );

      setStatus("error");
    }
  }

  return (
    <form
      className="mt-6 border-t border-slate-100 pt-6"
      onSubmit={submit}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
          <ShieldCheck size={17} />
        </div>

        <div>
          <h3 className="text-sm font-extrabold text-[#063D35]">
            Change password
          </h3>

          <p className="text-xs text-slate-400">
            Keep your SparkSales account secure.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          label="Current password"
          value={form.current}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              current: value,
            }))
          }
          visible={showCurrent}
          setVisible={
            setShowCurrent
          }
        />

        <PasswordField
          label="New password"
          value={form.next}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              next: value,
            }))
          }
          visible={showNext}
          setVisible={setShowNext}
          placeholder="At least 6 characters"
        />

        <div className="sm:col-span-2">
          <PasswordField
            label="Confirm new password"
            value={form.confirm}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                confirm: value,
              }))
            }
            visible={showConfirm}
            setVisible={
              setShowConfirm
            }
            placeholder="Repeat password"
          />
        </div>
      </div>

      <AnimatePresence>
        {(tooShort || mismatch || error) && (
          <motion.div
            initial={{
              opacity: 0,
              y: -5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -5,
            }}
            className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
          >
            {tooShort
              ? "Password must be at least 6 characters."
              : mismatch
                ? "Passwords don't match."
                : error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <motion.button
          type="submit"
          disabled={
            !canSubmit ||
            status === "saving"
          }
          whileHover={{
            y: -1,
          }}
          whileTap={{
            scale: 0.98,
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052F29] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "saving" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Updating...
            </>
          ) : (
            <>
              <ShieldCheck size={15} />
              Update password
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {status === "success" && (
            <motion.span
              initial={{
                opacity: 0,
                x: -8,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -8,
              }}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0C9A73]"
            >
              <Check size={15} />
              Password updated
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

/* ========================================================= */
/* TEAM                                                      */
/* ========================================================= */

function TeamSection({
  teamMembers,
  setTeamMembers,
  namespace,
}) {
  const [adding, setAdding] =
    useState(false);

  const [name, setName] =
    useState("");

  const [role, setRole] =
    useState("Member");

  const [removingId, setRemovingId] =
    useState(null);

  function addMember(event) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    const member = {
      teamMemberId:
        crypto.randomUUID(),
      name: name.trim(),
      role,
    };

    setTeamMembers((members) => {
      const next = [
        ...members,
        member,
      ];

      writeSettings(
        namespace,
        "team",
        next,
      );

      return next;
    });

    setName("");
    setRole("Member");
    setAdding(false);
  }

  function removeMember(id) {
    setRemovingId(id);

    window.setTimeout(() => {
      setTeamMembers((members) => {
        const next = members.filter(
          (member) =>
            member.teamMemberId !== id,
        );

        writeSettings(
          namespace,
          "team",
          next,
        );

        return next;
      });

      setRemovingId(null);
    }, 180);
  }

  return (
    <motion.section
      variants={sectionVariants}
      className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
            <Users size={17} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Collaboration
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
              Team members
            </h2>
          </div>
        </div>

        <motion.button
          type="button"
          whileHover={{
            y: -1,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={() =>
            setAdding((current) => !current)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#063D35] transition hover:bg-[#E6F7F3]"
        >
          {adding ? (
            <>
              <X size={15} />
              Close
            </>
          ) : (
            <>
              <UserPlus size={15} />
              Add member
            </>
          )}
        </motion.button>
      </div>

      <div className="p-5 sm:p-6">
        <AnimatePresence initial={false}>
          {adding && (
            <motion.form
              initial={{
                opacity: 0,
                height: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -8,
              }}
              className="mb-5 overflow-hidden rounded-2xl border border-[#B8F2E6] bg-[#F7FAF9] p-4"
              onSubmit={addMember}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Member name"
                  value={name}
                  onChange={setName}
                  placeholder="e.g. Amara"
                  autoFocus
                  required
                />

                <SelectField
                  label="Role"
                  value={role}
                  onChange={setRole}
                  options={[
                    "Owner",
                    "Manager",
                    "Cashier",
                    "Member",
                  ]}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#063D35] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052F29]"
                >
                  <Plus size={15} />
                  Add member
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {teamMembers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#063D35] shadow-sm">
              <Users size={19} />
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-slate-800">
              No team members yet
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
              Add your team so everyone involved in
              the trading day is easy to identify.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            <AnimatePresence initial={false}>
              {teamMembers.map((member) => (
                <motion.div
                  key={member.teamMemberId}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -16,
                    height: 0,
                    marginBottom: 0,
                  }}
                  transition={{
                    duration: 0.22,
                  }}
                  className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-[#B8F2E6] hover:bg-[#F7FAF9] ${
                    removingId ===
                    member.teamMemberId
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-[#063D35] shadow-sm">
                      {member.name
                        .split(" ")
                        .map(
                          (word) =>
                            word[0],
                        )
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-800">
                        {member.name}
                      </p>

                      <span className="mt-1 inline-flex rounded-full bg-[#E6F7F3] px-2 py-1 text-[10px] font-bold text-[#063D35]">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeMember(
                        member.teamMemberId,
                      )
                    }
                    className="rounded-lg px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    Remove
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.section>
  );
}

/* ========================================================= */
/* APPLICATION SETTINGS                                       */
/* ========================================================= */

function ApplicationSettingsSection({
  business,
  token,
  refreshData,
  appSettings,
  setAppSettings,
  account,
}) {
  const accountDetails = account || {
    email: "",
  };

  const [rateInput, setRateInput] =
    useState(
      String(
        Math.max(
          MIN_COMMISSION_PERCENT,
          Math.round(
            (Number(
              business.commissionRate,
            ) || 0.05) * 100,
          ),
        ),
      ),
    );

  const [rateSaving, setRateSaving] =
    useState(false);

  const [rateSaved, setRateSaved] =
    useState(false);

  const [rateError, setRateError] =
    useState("");

  async function saveRate() {
    const parsed =
      Number(rateInput) ||
      MIN_COMMISSION_PERCENT;

    const clamped = Math.min(
      Math.max(
        parsed,
        MIN_COMMISSION_PERCENT,
      ),
      100,
    );

    const rate = clamped / 100;

    setRateInput(
      String(Math.round(rate * 100)),
    );

    setRateSaving(true);
    setRateSaved(false);
    setRateError("");

    try {
      if (!token) {
        throw new Error("You must be logged in.");
      }

      setAuthToken(token);

      await apiRequest(
        "/api/business/commission-rate",
        {
          method: "PUT",
          body: JSON.stringify({
            commissionRate: rate,
          }),
        },
      );

      await refreshData();

      setRateSaved(true);

      window.setTimeout(() => {
        setRateSaved(false);
      }, 2600);
    } catch (error) {
      console.error(
        "Failed to save commission rate:",
        error,
      );

      setRateError(
        error?.message ||
          "We couldn't save the commission rate.",
      );
    } finally {
      setRateSaving(false);
    }
  }

  function updateSetting(key, value) {
    setAppSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <motion.section
      variants={sectionVariants}
      className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F7F3] text-[#063D35]">
              <Bell size={17} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Preferences
              </p>

              <h2 className="mt-1 text-lg font-extrabold text-[#063D35]">
                Application settings
              </h2>
            </div>
          </div>

          <span className="hidden rounded-full bg-[#E6F7F3] px-3 py-1.5 text-[11px] font-bold text-[#063D35] sm:block">
            Your preferences
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {/* Commission */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-extrabold text-slate-800">
                Commission rate
              </p>

              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
                SparkSales commission is applied to positive
                gross profit. Your current business rate is
                configurable here.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rate
                <div className="relative mt-1.5">
                  <input
                    type="number"
                    min={
                      MIN_COMMISSION_PERCENT
                    }
                    max="100"
                    value={rateInput}
                    onChange={(event) =>
                      setRateInput(
                        event.target.value,
                      )
                    }
                    className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-sm font-bold text-slate-800 outline-none transition focus:border-[#7FCFC0] focus:bg-white focus:ring-4 focus:ring-[#7FCFC0]/10"
                  />

                  <span className="pointer-events-none absolute right-3 top-3 text-sm font-bold text-slate-400">
                    %
                  </span>
                </div>
              </label>

              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                disabled={rateSaving}
                onClick={saveRate}
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#063D35] px-4 text-sm font-bold text-white transition hover:bg-[#052F29] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rateSaving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save rate
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {rateError && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
              >
                {rateError}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {rateSaved && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E6F7F3] px-3 py-2 text-xs font-bold text-[#063D35]"
              >
                <Check size={14} />
                Commission rate saved.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Daily summaries */}
        <div className="p-5 sm:p-6">
          <SettingToggle
            icon={Mail}
            title="Daily summary email"
            description="Receive a daily snapshot of your trading performance."
            checked={
              appSettings.dailySummaryEmail
            }
            onChange={(checked) =>
              updateSetting(
                "dailySummaryEmail",
                checked,
              )
            }
          />

          <AnimatePresence initial={false}>
            {appSettings.dailySummaryEmail && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  y: -6,
                }}
                className="mt-4 overflow-hidden"
              >
                <Field
                  label="Send summaries to"
                  type="email"
                  value={
                    appSettings.notificationEmail ||
                    ""
                  }
                  onChange={(value) =>
                    updateSetting(
                      "notificationEmail",
                      value,
                    )
                  }
                  placeholder={
                    accountDetails.email ||
                    "your@email.com"
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Loss alerts */}
        <div className="p-5 sm:p-6">
          <SettingToggle
            icon={AlertTriangle}
            title="Loss alerts"
            description="Get notified when your business moves into negative gross profit."
            checked={
              appSettings.lossAlerts
            }
            onChange={(checked) =>
              updateSetting(
                "lossAlerts",
                checked,
              )
            }
            danger
          />
        </div>

        {/* Save helper */}
        <div className="bg-[#F7FAF9] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#063D35] shadow-sm">
              <Clock3 size={16} />
            </div>

            <div>
              <p className="text-xs font-extrabold text-[#063D35]">
                Changes are staged until you save
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Update the preferences above, then use the
                floating <strong>Save settings</strong>{" "}
                button to commit them.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ========================================================= */
/* DANGER ZONE                                                */
/* ========================================================= */

function DangerZoneSection({
  business,
  account,
  deletionRequest,
  setDeletionRequest,
}) {
  const [open, setOpen] =
    useState(false);

  const [reason, setReason] =
    useState("");

  const [confirmText, setConfirmText] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const canRequest =
    confirmText.trim().toLowerCase() ===
    business.name.trim().toLowerCase();

  async function submitRequest() {
    if (!account?.email) {
      setError(
        "You need to be signed in to request removal.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const request =
        await api.requestDeletion(
          account.email,
          business.name,
          reason,
        );

      setDeletionRequest(request);
      setOpen(false);
      setReason("");
      setConfirmText("");
    } catch (err) {
      setError(
        err?.message ||
          "Couldn't submit the removal request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelRequest() {
    if (!deletionRequest?.id) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.cancelDeletion(
        deletionRequest.id,
      );

      setDeletionRequest(null);
    } catch (err) {
      setError(
        err?.message ||
          "Couldn't cancel the removal request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.section
      variants={sectionVariants}
      className="mt-4 overflow-hidden rounded-2xl border border-red-200 bg-red-50/50 shadow-sm"
    >
      <div className="border-b border-red-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-500">
            <AlertTriangle size={17} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
              Advanced
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-red-700">
              Danger zone
            </h2>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {deletionRequest ? (
          <div>
            <div className="rounded-2xl border border-red-100 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <Clock3 size={17} />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-slate-800">
                    Removal request submitted
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Requested on{" "}
                    {new Date(
                      deletionRequest.requestedAt,
                    ).toLocaleDateString()}
                    . You'll receive confirmation once{" "}
                    {business.name} has been permanently
                    removed.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={cancelRequest}
              className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {submitting
                ? "Cancelling..."
                : "Cancel request"}
            </button>
          </div>
        ) : open ? (
          <AnimatePresence initial>
            <motion.div
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="rounded-2xl border border-red-100 bg-white p-4 sm:p-5"
            >
              <div className="grid gap-4">
                <Field
                  label="Reason (optional)"
                  value={reason}
                  onChange={setReason}
                  placeholder="e.g. Event has ended"
                />

                <div>
                  <Field
                    label={
                      <>
                        Type{" "}
                        <strong>
                          {business.name}
                        </strong>{" "}
                        to confirm
                      </>
                    }
                    value={confirmText}
                    onChange={setConfirmText}
                    placeholder={
                      business.name
                    }
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setOpen(false);
                    setConfirmText("");
                    setReason("");
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    !canRequest ||
                    submitting
                  }
                  onClick={submitRequest}
                  className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : "Request removal"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-extrabold text-slate-800">
                Delete account
              </p>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                Requesting removal notifies the SparkSales
                team to permanently delete{" "}
                <strong>{business.name}</strong> and
                its associated data.
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{
                y: -1,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => {
                setError("");
                setOpen(true);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={15} />
              Request account deletion
            </motion.button>
          </div>
        )}
      </div>
    </motion.section>
  );
}

/* ========================================================= */
/* SMALL COMPONENTS                                           */
/* ========================================================= */

function HeroStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className="text-[#B8F2E6]"
        />

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-extrabold text-white">
        {value}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
  highlight = false,
}) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-[#B8F2E6] hover:bg-[#F7FAF9]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#063D35] shadow-sm transition group-hover:scale-105">
          <Icon size={15} />
        </div>

        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </span>

          <p
            className={`mt-1 truncate text-sm font-extrabold ${
              highlight
                ? "text-[#0C9A73]"
                : "text-slate-800"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  ...props
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}

      <input
        {...props}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7FCFC0] focus:ring-4 focus:ring-[#7FCFC0]/10"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}

      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-800 outline-none transition focus:border-[#7FCFC0] focus:ring-4 focus:ring-[#7FCFC0]/10"
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-3 text-slate-400"
        />
      </div>
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  setVisible,
  placeholder,
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}

      <div className="relative mt-1.5">
        <input
          type={
            visible ? "text" : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-11 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7FCFC0] focus:ring-4 focus:ring-[#7FCFC0]/10"
        />

        <button
          type="button"
          onClick={() =>
            setVisible(
              (current) => !current,
            )
          }
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={
            visible
              ? `Hide ${label}`
              : `Show ${label}`
          }
        >
          {visible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </label>
  );
}

function SettingToggle({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  danger = false,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            danger
              ? "bg-red-50 text-red-500"
              : "bg-[#E6F7F3] text-[#063D35]"
          }`}
        >
          <Icon size={17} />
        </div>

        <div>
          <p className="text-sm font-extrabold text-slate-800">
            {title}
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange(!checked)
        }
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked
            ? "bg-[#063D35]"
            : "bg-slate-200"
        }`}
      >
        <motion.span
          animate={{
            x: checked ? 20 : 2,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          className="absolute left-0 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
}

/* ========================================================= */
/* HELPERS                                                    */
/* ========================================================= */

function businessInitials(name) {
  return (
    String(name || "")
      .split(" ")
      .map((word) => word[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SS"
  );
}

function accountNamespace(account) {
  return (
    account?.email ||
    "guest"
  )
    .trim()
    .toLowerCase();
}

function readSettings(
  namespace,
  key,
  fallback,
) {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          `${SETTINGS_STORAGE_KEY}-${namespace}-${key}`,
        ),
      ) ?? fallback
    );
  } catch {
    return fallback;
  }
}

function writeSettings(
  namespace,
  key,
  value,
) {
  localStorage.setItem(
    `${SETTINGS_STORAGE_KEY}-${namespace}-${key}`,
    JSON.stringify(value),
  );
}