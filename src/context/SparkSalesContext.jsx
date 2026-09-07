import { createContext, useContext, useState } from "react";

const SparkSalesContext = createContext();

export const SparkSalesProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [commissionRate, setCommissionRate] = useState(0.05);

  const value = {
    business,
    setBusiness,
    sales,
    setSales,
    expenses,
    setExpenses,
    commissionRate,
    setCommissionRate,
  };

  return (
    <SparkSalesContext.Provider value={value}>
      {children}
    </SparkSalesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSparkSales = () => {
  const context = useContext(SparkSalesContext);

  if (!context) {
    throw new Error(
      "useSparkSales must be used inside SparkSalesProvider"
    );
  }

  return context;
};