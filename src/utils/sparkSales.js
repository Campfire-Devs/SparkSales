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

export const saleTotal = (sale) => {
  if (
    sale.total !== undefined &&
    sale.total !== null
  ) {
    return Number(sale.total || 0);
  }

  const quantity =
    Number(sale.quantity || 0);

  const unitPrice =
    Number(
      sale.unitPrice ??
      sale.price ??
      0
    );

  return quantity * unitPrice;
};

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

  export const calculateCommission = (
  grossProfitLoss,
  commissionRate = COMMISSION_RATE
) => {
  const gross =
    toNumber(grossProfitLoss);

  const rate =
    Math.max(
      0,
      toNumber(commissionRate)
    );

  return gross > 0
    ? gross * rate
    : 0;
};

export const calculateNetProfit = (
  grossProfitLoss,
  commission
) =>
  toNumber(grossProfitLoss) -
  toNumber(commission);

  


  export const calculateProfitMargin = (
  revenue,
  netProfit
) => {
  const totalRevenue =
    toNumber(revenue);

  if (totalRevenue <= 0) {
    return 0;
  }

  return (
    toNumber(netProfit) /
    totalRevenue
  ) * 100;
};

export const detectLoss = (
  netProfit
) => {
  const amount =
    toNumber(netProfit);

  if (amount < 0) {
    return {
      isLoss: true,
      isBreakEven: false,
      status: 'Loss',
      lossAmount:
        Math.abs(amount),
    };
  }

  if (amount === 0) {
    return {
      isLoss: false,
      isBreakEven: true,
      status: 'Break-even',
      lossAmount: 0,
    };
  }

  return {
    isLoss: false,
    isBreakEven: false,
    status: 'Profit',
    lossAmount: 0,
  };
};

