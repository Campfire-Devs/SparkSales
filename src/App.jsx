import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";

import AppLayout from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RegisterBusiness from "./pages/RegisterBusiness";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";

import { SparkSalesProvider } from "./context/SparkSalesContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useSparkSales } from "./context/SparkSalesContext";

import { useDailyNotifications } from "./hooks/useDailyNotifications";

function App() {
  return (
    <AuthProvider>
      <SparkSalesProvider>
        <BrowserRouter>
          <RouteDebugger />
          <NotificationWatcher />

          <Routes>
            {/* Public pages */}
            <Route
              path="/"
              element={<Landing />}
            />

            <Route
              path="/login"
              element={<AuthPage />}
            />

            <Route
              path="/register"
              element={<AuthPage />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />

            {/* Informational pages */}
            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />

            <Route
              path="/terms-and-conditions"
              element={<TermsConditions />}
            />

            {/* Application pages */}
            <Route element={<AppLayout />}>
              <Route
                path="/dashboard"
                element={
                  <BusinessRequired>
                    <Dashboard />
                  </BusinessRequired>
                }
              />

              <Route
                path="/sales"
                element={
                  <BusinessRequired>
                    <Sales />
                  </BusinessRequired>
                }
              />

              <Route
                path="/expenses"
                element={
                  <BusinessRequired>
                    <Expenses />
                  </BusinessRequired>
                }
              />

              <Route
                path="/reports"
                element={
                  <BusinessRequired>
                    <Reports />
                  </BusinessRequired>
                }
              />

              <Route
                path="/settings"
                element={
                  <BusinessRequired>
                    <Settings />
                  </BusinessRequired>
                }
              />

              <Route
                path="/register-business"
                element={<RegisterBusiness />}
              />
            </Route>

            {/* Catch-all */}
            <Route
              path="*"
              element={<NotFound />}
            />
          </Routes>
        </BrowserRouter>
      </SparkSalesProvider>
    </AuthProvider>
  );
}

export default App;

/*
 * Runs the daily-summary / loss-alert check on every page,
 * not just Settings.
 *
 * Renders nothing.
 */
function NotificationWatcher() {
  useDailyNotifications();

  return null;
}

function BusinessRequired({ children }) {
  const {
    token,
    loading: authLoading,
  } = useAuth();

  const {
    business,
    loading,
    error,
    dataReady,
  } = useSparkSales();

  const location = useLocation();

  useEffect(() => {
    console.group("🔐 BusinessRequired");

    console.log("Current path:", location.pathname);
    console.log("Token exists:", Boolean(token));
    console.log("Auth loading:", authLoading);
    console.log("Business:", business);
    console.log("Data loading:", loading);
    console.log("Data ready:", dataReady);
    console.log("Error:", error);

    console.log(
      "Decision:",
      !token
        ? "REDIRECT → /login"
        : authLoading
          ? "WAIT → authentication loading"
          : loading || !dataReady
            ? "WAIT → loading workspace"
            : error
              ? "SHOW ERROR"
              : !business
                ? "REDIRECT → /register-business"
                : "ALLOW → protected page"
    );

    console.groupEnd();
  }, [
    token,
    authLoading,
    business,
    loading,
    dataReady,
    error,
    location.pathname,
  ]);

  /*
   * No authenticated session.
   */
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /*
   * AuthContext is still restoring/checking the session.
   */
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7FCFC0] border-t-[#063D35]" />

          Loading your session...
        </div>
      </div>
    );
  }

  /*
   * We have a token, but SparkSalesContext has not finished
   * loading data for THIS token yet.
   *
   * This is the important protection against the bug we found.
   */
  if (loading || !dataReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7FCFC0] border-t-[#063D35]" />

          Loading your workspace...
        </div>
      </div>
    );
  }

  /*
   * The backend has finished loading for the current user,
   * so an error at this point is a real loading failure.
   */
  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">
            Unable to load your workspace
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-[#063D35] px-5 py-3 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /*
   * The API request has completed and the backend confirmed
   * that this user has no business.
   */
  if (!business) {
    return (
      <Navigate
        to="/register-business"
        replace
      />
    );
  }

  return children;
}

function RouteDebugger() {
  const location = useLocation();

  const {
    token,
    account,
    loading: authLoading,
  } = useAuth();

  const {
    business,
    loading: dataLoading,
    error: dataError,
    dataReady,
  } = useSparkSales();

  useEffect(() => {
    console.group("🚦 SparkSales Route Debug");

    console.log("Path:", location.pathname);
    console.log("Search:", location.search);

    console.log(
      "Token exists:",
      Boolean(token)
    );

    console.log(
      "Account:",
      account
    );

    console.log(
      "Auth loading:",
      authLoading
    );

    console.log(
      "Business:",
      business
    );

    console.log(
      "Data loading:",
      dataLoading
    );

    console.log(
      "Data ready:",
      dataReady
    );

    console.log(
      "Data error:",
      dataError
    );

    console.groupEnd();
  }, [
    location.pathname,
    location.search,
    token,
    account,
    authLoading,
    business,
    dataLoading,
    dataReady,
    dataError,
  ]);

  return null;
}