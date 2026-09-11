/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  COMMISSION_RATE,
  saleTotal,
} from "../utils/sparkSales";

const seedSales = [
  {
    id: "s1",
    product: "Fudge Brownies",
    category: "Snacks",
    quantity: 24,
    unitPrice: 2.5,
    date: "2026-09-01",
    seller: "Amara",
  },
  {
    id: "s2",
    product: "Iced Lemonade",
    category: "Drinks",
    quantity: 40,
    unitPrice: 1.75,
    date: "2026-09-01",
    seller: "Jonah",
  },
  {
    id: "s3",
    product: "Friendship Bracelets",
    category: "Crafts",
    quantity: 18,
    unitPrice: 4,
    date: "2026-09-02",
    seller: "Priya",
  },
  {
    id: "s4",
    product: "Team Hoodie",
    category: "Merch",
    quantity: 6,
    unitPrice: 22,
    date: "2026-09-02",
    seller: "Amara",
  },
  {
    id: "s5",
    product: "Phone Case Prints",
    category: "Crafts",
    quantity: 12,
    unitPrice: 8.5,
    date: "2026-09-03",
    seller: "Leo",
  },
  {
    id: "s6",
    product: "Face Painting",
    category: "Services",
    quantity: 15,
    unitPrice: 3,
    date: "2026-09-03",
    seller: "Priya",
  },
  {
    id: "s7",
    product: "Cold Brew Coffee",
    category: "Drinks",
    quantity: 28,
    unitPrice: 3.25,
    date: "2026-09-04",
    seller: "Jonah",
  },
  {
    id: "s8",
    product: "Cookie Boxes",
    category: "Snacks",
    quantity: 20,
    unitPrice: 6,
    date: "2026-09-05",
    seller: "Leo",
  },
];

const seedExpenses = [
  {
    id: "e1",
    item: "Baking ingredients",
    category: "Ingredients",
    amount: 84.4,
    date: "2026-08-31",
    note: "Flour, cocoa, butter",
  },
  {
    id: "e2",
    item: "Lemons & sugar",
    category: "Ingredients",
    amount: 39.9,
    date: "2026-08-31",
    note: "Drinks ingredients",
  },
  {
    id: "e3",
    item: "Craft beads & thread",
    category: "Supplies",
    amount: 52.15,
    date: "2026-09-01",
    note: "Bracelet materials",
  },
  {
    id: "e4",
    item: "Poster printing",
    category: "Marketing",
    amount: 28,
    date: "2026-09-01",
    note: "A2 stall posters",
  },
  {
    id: "e5",
    item: "Stall rental",
    category: "Stall Fees",
    amount: 60,
    date: "2026-09-02",
    note: "Entrepreneurship Day",
  },
  {
    id: "e6",
    item: "Van hire share",
    category: "Transport",
    amount: 25.5,
    date: "2026-09-02",
    note: "Team transport",
  },
];

const STORAGE_KEY = "sparksales-data-v2";

const uid = () => Math.random().toString(36).slice(2, 10);

const normalizeBusiness = (value) => {
  if (!value || value.name === "SparkSales Business") return null;
  return value;
};

const SparkSalesContext = createContext(null);

export function SparkSalesProvider({ children }) {
  const [business, setBusiness] = useState(() => {
    try {
      return (
        normalizeBusiness(
          JSON.parse(localStorage.getItem(`${STORAGE_KEY}-business`))
        )
      );
    } catch {
      return null;
    }
  });

  const [sales, setSales] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem(`${STORAGE_KEY}-sales`)
        ) || seedSales
      );
    } catch {
      return seedSales;
    }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem(`${STORAGE_KEY}-expenses`)
        ) || seedExpenses
      );
    } catch {
      return seedExpenses;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY}-business`,
      JSON.stringify(business)
    );
  }, [business]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY}-sales`,
      JSON.stringify(sales)
    );
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY}-expenses`,
      JSON.stringify(expenses)
    );
  }, [expenses]);

  const addSale = useCallback(
    (input) =>
      setSales((prev) => [
        { ...input, id: uid() },
        ...prev,
      ]),
    []
  );

  const updateSale = useCallback(
    (id, input) =>
      setSales((prev) =>
        prev.map((sale) =>
          sale.id === id
            ? { ...input, id }
            : sale
        )
      ),
    []
  );

  const deleteSale = useCallback(
    (id) =>
      setSales((prev) =>
        prev.filter((sale) => sale.id !== id)
      ),
    []
  );

  const addExpense = useCallback(
    (input) =>
      setExpenses((prev) => [
        { ...input, id: uid() },
        ...prev,
      ]),
    []
  );

  const updateExpense = useCallback(
    (id, input) =>
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === id
            ? { ...input, id }
            : expense
        )
      ),
    []
  );

  const deleteExpense = useCallback(
    (id) =>
      setExpenses((prev) =>
        prev.filter((expense) => expense.id !== id)
      ),
    []
  );

  const resetData = useCallback(() => {
    setSales(seedSales);
    setExpenses(seedExpenses);
  }, []);

  const totals = useMemo(() => {
    const revenue = sales.reduce(
      (sum, sale) => sum + saleTotal(sale),
      0
    );

    const expenseTotal = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

    const grossProfit = revenue - expenseTotal;

    const commission =
      grossProfit > 0
        ? grossProfit * COMMISSION_RATE
        : 0;

    const unitsSold = sales.reduce(
      (sum, sale) =>
        sum + Number(sale.quantity || 0),
      0
    );

    return {
      revenue,
      expenses: expenseTotal,
      grossProfit,
      commission,
      netProfit: grossProfit - commission,
      unitsSold,
      transactions: sales.length,
      averageSale: sales.length
        ? revenue / sales.length
        : 0,
      margin: revenue
        ? (grossProfit / revenue) * 100
        : 0,
    };
  }, [sales, expenses]);

  const value = useMemo(
    () => ({
      business,
      setBusiness,
      sales,
      expenses,
      totals,
      addSale,
      updateSale,
      deleteSale,
      addExpense,
      updateExpense,
      deleteExpense,
      resetData,
    }),
    [
      business,
      sales,
      expenses,
      totals,
      addSale,
      updateSale,
      deleteSale,
      addExpense,
      updateExpense,
      deleteExpense,
      resetData,
    ]
  );

  return (
    <SparkSalesContext.Provider value={value}>
      {children}
    </SparkSalesContext.Provider>
  );
}

export function useSparkSales() {
  const context = useContext(SparkSalesContext);

  if (!context) {
    throw new Error(
      "useSparkSales must be used inside SparkSalesProvider"
    );
  }

  return context;
}