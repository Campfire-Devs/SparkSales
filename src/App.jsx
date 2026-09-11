import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import RegisterBusiness from "./pages/RegisterBusiness";

import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";

import {
  SparkSalesProvider,
} from "./context/SparkSalesContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { useSparkSales } from "./context/SparkSalesContext";

function App() {
  return (
    <AuthProvider>
      <SparkSalesProvider>
        <BrowserRouter>
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

          {/* Application pages */}
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<BusinessRequired><Dashboard /></BusinessRequired>}
            />

            <Route
              path="/sales"
              element={<BusinessRequired><Sales /></BusinessRequired>}
            />

            <Route
              path="/expenses"
              element={<BusinessRequired><Expenses /></BusinessRequired>}
            />

            <Route
              path="/reports"
              element={<BusinessRequired><Reports /></BusinessRequired>}
            />

            <Route
              path="/settings"
              element={<BusinessRequired><Settings /></BusinessRequired>}
            />

            <Route
              path="/register-business"
              element={<RegisterBusiness />}
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

            {/* Catch-all */}
            <Route
              path="*"
              element={<NotFound />}
            />
          </Route>
          </Routes>
        </BrowserRouter>
      </SparkSalesProvider>
    </AuthProvider>
  );
}

export default App;

function BusinessRequired({ children }) {
  const { token } = useAuth();
  const { business } = useSparkSales();
  const location = useLocation();

  if (!token) return <Navigate to="/register" replace state={{ from: location }} />;
  if (!business) return <Navigate to="/register-business" replace />;
  return children;
}