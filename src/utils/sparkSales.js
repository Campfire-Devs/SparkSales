export const COMMISSION_RATE = 0.05;

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