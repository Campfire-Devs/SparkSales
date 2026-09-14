export const COMMISSION_RATE = 0.05;

export const BUSINESS_CATEGORIES = [
  "Baked Goods",
  "Food & Drink",
  "Crafts & Design",
  "Fashion & Accessories",
  "Tech & Gadgets",
  "Services",
  "Other",
];

export const SALE_CATEGORIES = [
  "Snacks",
  "Drinks",
  "Crafts",
  "Merch",
  "Services",
];

export const EXPENSE_CATEGORIES = [
  "Supplies",
  "Ingredients",
  "Marketing",
  "Stall Fees",
  "Transport",
];

export const saleTotal = (sale) =>
  Number(sale.quantity || 0) *
  Number(sale.unitPrice || 0);

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

// Every account gets its own slice of localStorage, keyed by email — shared
// between Settings.jsx (which owns the "app"/"team" settings UI) and
// anything else that needs to read the same per-account settings, like the
// daily-summary/loss-alert notification check.
export const APP_SETTINGS_STORAGE_KEY = "sparksales-settings-v1";

export function accountNamespace(account) {
  return (account?.email || "guest").trim().toLowerCase();
}

export function readAccountSetting(account, key, fallback) {
  try {
    const namespace = accountNamespace(account);
    const raw = localStorage.getItem(`${APP_SETTINGS_STORAGE_KEY}-${namespace}-${key}`);
    return raw === null ? fallback : JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeAccountSetting(account, key, value) {
  const namespace = accountNamespace(account);
  localStorage.setItem(`${APP_SETTINGS_STORAGE_KEY}-${namespace}-${key}`, JSON.stringify(value));
}

// South African phone numbers: 10 digits, starting with 0 (e.g. 0821234567).
// sanitizeSAPhoneInput strips anything that isn't a digit and caps the
// length as the person types, so it's impossible to type an 11th digit or
// a letter in the first place. isValidSAPhoneNumber is the final check
// before saving.
export function sanitizeSAPhoneInput(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isValidSAPhoneNumber(value) {
  return /^0\d{9}$/.test(value);
}