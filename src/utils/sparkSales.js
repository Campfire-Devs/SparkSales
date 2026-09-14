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