/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiRequest, setAuthToken } from "../api/client";
import { COMMISSION_RATE, saleTotal } from "../utils/sparkSales";
import { useAuth } from "./AuthContext";

const normalizeBusiness = (value) => {
  if (!value) return null;

  return {
    ...value,
    commissionRate: Math.max(
      Number(value.commissionRate) || COMMISSION_RATE,
      COMMISSION_RATE
    ),
  };
};

const normalizeSale = (sale) => ({
  ...sale,
  id: sale.saleId ?? sale.id,
  date: sale.saleDate
    ? String(sale.saleDate).slice(0, 10)
    : sale.date ?? "",
});

const normalizeExpense = (expense) => ({
  ...expense,
  id: expense.expenseId ?? expense.id,
  item: expense.name ?? expense.item ?? "",
  date: expense.expenseDate
    ? String(expense.expenseDate).slice(0, 10)
    : expense.date ?? "",
});

const buildSalePayload = (input) => ({
  product: String(input.product ?? "").trim(),
  category: String(input.category ?? "").trim(),
  seller: String(input.seller ?? "").trim(),
  quantity: Number(input.quantity),
  unitPrice: Number(input.unitPrice),
  paymentMethod: String(input.paymentMethod ?? "Cash").trim(),
  saleDate: input.saleDate ?? input.date,
});

const buildExpensePayload = (input) => ({
  name: String(input.name ?? input.item ?? "").trim(),
  seller: String(input.seller ?? "General/Stall").trim(),
  category: String(input.category ?? "").trim(),
  amount: Number(input.amount),
  expenseDate: input.expenseDate ?? input.date,
  note: input.note ? String(input.note).trim() : null,
});

const SparkSalesContext = createContext(null);

export function SparkSalesProvider({ children }) {
  const [business, setBusinessState] = useState(null);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
   * Tracks which authentication token has had its
   * workspace data successfully loaded.
   *
   * This prevents BusinessRequired from treating
   * a temporary business=null state as "no business".
   */
  const [loadedToken, setLoadedToken] = useState(null);

  /*
   * Prevent an older refresh request from overwriting
   * data belonging to a newer authenticated session.
   *
   * Example:
   * User A request starts
   * User B logs in
   * User B request starts
   * User A request finishes last
   *
   * Without this guard, User A's response could overwrite
   * User B's business state.
   */
  const refreshSequenceRef = useRef(0);

  /*
   * AuthContext owns the actual JWT state.
   * We receive it through the token stored by AuthContext.
   *
   * We do NOT read sales, expenses, or business
   * data from localStorage anymore.
   */

  /*
   * Load all financial/business data from the backend.
   */
  const refreshData = useCallback(async () => {
    const requestId = ++refreshSequenceRef.current;

    /*
     * A new refresh belongs to the current authentication
     * session. Until it completes, the workspace is not ready.
     */
    setLoadedToken(null);

    if (!token) {
      setBusinessState(null);
      setSales([]);
      setExpenses([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Make sure apiRequest has the current JWT before making requests.
    setAuthToken(token);

    setLoading(true);
    setError(null);

    try {
      let businessData = null;

      /*
       * A user may legitimately not have created a business yet.
       * In that case GET /api/business returns 404.
       */
      try {
        businessData = await apiRequest("/api/business");
      } catch (businessError) {
        if (
          businessError?.message !== "Set up your business first."
        ) {
          throw businessError;
        }
      }

      /*
       * Ignore responses from an older authentication session.
       */
      if (requestId !== refreshSequenceRef.current) {
        return;
      }

      /*
       * No business means this is a legitimate first-time
       * setup state.
       *
       * We can mark the CURRENT token as loaded here because
       * the backend has confirmed that this user has no business.
       */
      if (!businessData) {
        setBusinessState(null);
        setSales([]);
        setExpenses([]);
        setLoadedToken(token);
        return;
      }

      /*
       * Business exists, so now load the financial data
       * belonging to the same authenticated user.
       */
      const [salesData, expensesData] = await Promise.all([
        apiRequest("/api/sales"),
        apiRequest("/api/expenses"),
      ]);

      /*
       * The user/session may have changed while the requests
       * were in flight. Never apply stale responses.
       */
      if (requestId !== refreshSequenceRef.current) {
        return;
      }

      setBusinessState(normalizeBusiness(businessData));

      setSales(
        Array.isArray(salesData)
          ? salesData.map(normalizeSale)
          : []
      );

      setExpenses(
        Array.isArray(expensesData)
          ? expensesData.map(normalizeExpense)
          : []
      );

      /*
       * IMPORTANT:
       * The current user's complete workspace has now been loaded.
       * BusinessRequired can safely decide whether a business exists.
       */
      setLoadedToken(token);
    } catch (requestError) {
      /*
       * Do not let an older request overwrite the current
       * user's state or error.
       */
      if (requestId !== refreshSequenceRef.current) {
        return;
      }

      console.error("Failed to load SparkSales data:", requestError);

      setError(
        requestError?.message ||
          "Unable to load your SparkSales data."
      );

      setBusinessState(null);
      setSales([]);
      setExpenses([]);
      setLoadedToken(null);
    } finally {
      if (requestId === refreshSequenceRef.current) {
        setLoading(false);
      }
    }
  }, [token]);

  /*
   * Reload backend data whenever the authenticated session changes.
   *
   * The tiny delay allows AuthContext to finish its state update
   * before the backend refresh begins.
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void refreshData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [refreshData]);

  /*
   * Create or update the current business.
   *
   * This keeps the old setBusiness API available to the existing
   * frontend while moving the actual source of truth to the backend.
   */
  const setBusiness = useCallback(
    async (input) => {
      if (!token) {
        throw new Error("You must be logged in.");
      }

      setAuthToken(token);
      setError(null);

      const payload = {
        name: String(input.name ?? "").trim(),
        category: String(input.category ?? "").trim(),
        contact: input.contact
          ? String(input.contact).trim()
          : null,
        location: input.location
          ? String(input.location).trim()
          : null,
        stallNumber: input.stallNumber
          ? String(input.stallNumber).trim()
          : null,
        startingCapital: Number(input.startingCapital ?? 0),
      };

      const endpoint = "/api/business";
      const method = business ? "PUT" : "POST";

      const response = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      const normalizedBusiness = normalizeBusiness(response);

      setBusinessState(normalizedBusiness);
      setLoadedToken(token);

      return normalizedBusiness;
    },
    [business, token]
  );

  // ---------------------------------------------------------
  // Sales
  // ---------------------------------------------------------

  const addSale = useCallback(async (input) => {
    const response = await apiRequest("/api/sales", {
      method: "POST",
      body: JSON.stringify(buildSalePayload(input)),
    });

    const normalizedSale = normalizeSale(response);

    setSales((prev) => [normalizedSale, ...prev]);

    return normalizedSale;
  }, []);

  const updateSale = useCallback(async (id, input) => {
    const response = await apiRequest(`/api/sales/${id}`, {
      method: "PUT",
      body: JSON.stringify(buildSalePayload(input)),
    });

    const normalizedSale = normalizeSale(response);

    setSales((prev) =>
      prev.map((sale) =>
        sale.id === id ? normalizedSale : sale
      )
    );

    return normalizedSale;
  }, []);

  const deleteSale = useCallback(async (id) => {
    await apiRequest(`/api/sales/${id}`, {
      method: "DELETE",
    });

    setSales((prev) =>
      prev.filter((sale) => sale.id !== id)
    );
  }, []);

  // ---------------------------------------------------------
  // Expenses
  // ---------------------------------------------------------

  const addExpense = useCallback(async (input) => {
    const response = await apiRequest("/api/expenses", {
      method: "POST",
      body: JSON.stringify(buildExpensePayload(input)),
    });

    const normalizedExpense = normalizeExpense(response);

    setExpenses((prev) => [
      normalizedExpense,
      ...prev,
    ]);

    return normalizedExpense;
  }, []);

  const updateExpense = useCallback(async (id, input) => {
    const response = await apiRequest(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(buildExpensePayload(input)),
    });

    const normalizedExpense = normalizeExpense(response);

    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id
          ? normalizedExpense
          : expense
      )
    );

    return normalizedExpense;
  }, []);

  const deleteExpense = useCallback(async (id) => {
    await apiRequest(`/api/expenses/${id}`, {
      method: "DELETE",
    });

    setExpenses((prev) =>
      prev.filter((expense) => expense.id !== id)
    );
  }, []);

  /*
   * Legacy compatibility.
   *
   * The old frontend may still call resetData().
   * We no longer seed or reset financial data locally.
   *
   * For now, resetData simply refreshes the backend source of truth.
   * Once we finish migrating the UI, we can remove this legacy method.
   */
  const resetData = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  // ---------------------------------------------------------
  // Financial calculations
  // ---------------------------------------------------------

  const totals = useMemo(() => {
    const revenue = sales.reduce(
      (sum, sale) => sum + saleTotal(sale),
      0
    );

    const expenseTotal = expenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount ?? 0),
      0
    );

    const grossProfit = revenue - expenseTotal;

    /*
     * The business's commission rate now comes from the backend.
     *
     * We only fall back to the original 5% default when no
     * business has been loaded yet.
     */
    const commissionRate =
      Number(business?.commissionRate) || COMMISSION_RATE;

    const commission =
      grossProfit > 0
        ? grossProfit * commissionRate
        : 0;

    const unitsSold = sales.reduce(
      (sum, sale) =>
        sum + Number(sale.quantity ?? 0),
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
      commissionRate,
    };
  }, [business, sales, expenses]);

  /*
   * TRUE only when:
   * - there is no authenticated user, or
   * - backend data has finished loading for THIS exact token.
   *
   * This is the key protection against the login race.
   */
  const dataReady = !token || loadedToken === token;

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

      loading,
      error,
      refreshData,
      dataReady,
    }),
    [
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
      loading,
      error,
      refreshData,
      dataReady,
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