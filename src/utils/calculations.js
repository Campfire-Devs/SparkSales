export const calculateRevenue = (sales) => {
  return sales.reduce((total, sale) => total + sale.total, 0);
};

export const calculateExpenses = (expenses) => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculateGrossProfit = (revenue, expenses) => {
  return revenue - expenses;
};

export const calculateCommission = (grossProfit, commissionRate = 0.05) => {
  if (grossProfit <= 0) return 0;

  return grossProfit * commissionRate;
};

export const calculateNetProfit = (grossProfit, commission) => {
  return grossProfit - commission;
};

export const calculateProfitMargin = (revenue, netProfit) => {
  if (revenue <= 0) return 0;

  return (netProfit / revenue) * 100;
};