// ==========================================
// REVENUE CALCULATION
// ==========================================

export const calculateRevenue = (sales = []) => {
  return sales.reduce((total, sale) => {
    const saleAmount =
      sale.total !== undefined && sale.total !== null
        ? Number(sale.total || 0)
        : Number(sale.quantity || 0) *
          Number(
            sale.unitPrice ??
            sale.price ??
            0
          );

    return total + saleAmount;
  }, 0);
};


// ==========================================
// EXPENSE CALCULATION
// ==========================================

export const calculateExpenses = (
  expenses = []
) => {
  return expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );
};


// ==========================================
// GROSS PROFIT / LOSS
// ==========================================

export const calculateGrossProfit = (
  revenue,
  expenses
) => {
  return (
    Number(revenue || 0) -
    Number(expenses || 0)
  );
};


// ==========================================
// SPARKSALES COMMISSION
// ==========================================

export const calculateCommission = (
  grossProfit,
  commissionRate = 0.05
) => {
  const profit =
    Number(grossProfit || 0);

  if (profit <= 0) {
    return 0;
  }

  return (
    profit *
    Number(commissionRate || 0)
  );
};


// ==========================================
// NET PROFIT
// ==========================================

export const calculateNetProfit = (
  grossProfit,
  commission
) => {
  return (
    Number(grossProfit || 0) -
    Number(commission || 0)
  );
};


// ==========================================
// PROFIT MARGIN
// ==========================================

export const calculateProfitMargin = (
  revenue,
  netProfit
) => {
  const revenueValue =
    Number(revenue || 0);

  if (revenueValue <= 0) {
    return 0;
  }

  return (
    (Number(netProfit || 0) /
      revenueValue) *
    100
  );
};


// ==========================================
// LOSS DETECTION
// ==========================================

export const detectLoss = (
  grossProfit,
  netProfit
) => {
  if (Number(grossProfit || 0) < 0) {
    return {
      isLoss: true,
      status: "Loss",
      message:
        "Expenses are greater than revenue.",
    };
  }

  if (Number(netProfit || 0) < 0) {
    return {
      isLoss: true,
      status: "Loss",
      message:
        "The business has a negative net profit.",
    };
  }

  if (Number(netProfit || 0) === 0) {
    return {
      isLoss: false,
      status: "Break-even",
      message:
        "The business is currently breaking even.",
    };
  }

  return {
    isLoss: false,
    status: "Profit",
    message:
      "The business is operating at a profit.",
  };
};


// ==========================================
// COMPLETE FINANCIAL SUMMARY
// ==========================================

export const calculateFinancialSummary = (
  sales = [],
  expenses = [],
  commissionRate = 0.05
) => {
  const revenue =
    calculateRevenue(sales);

  const expenseTotal =
    calculateExpenses(expenses);

  const grossProfit =
    calculateGrossProfit(
      revenue,
      expenseTotal
    );

  const commission =
    calculateCommission(
      grossProfit,
      commissionRate
    );

  const netProfit =
    calculateNetProfit(
      grossProfit,
      commission
    );

  const profitMargin =
    calculateProfitMargin(
      revenue,
      netProfit
    );

  const lossStatus =
    detectLoss(
      grossProfit,
      netProfit
    );

  return {
    revenue,
    expenses: expenseTotal,
    grossProfit,
    commission,
    netProfit,
    profitMargin,
    ...lossStatus,
  };
};

  