import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
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

function App() {
  return (
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
            element={<Login />}
          />

          {/* Application pages */}
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/sales"
              element={<Sales />}
            />

            <Route
              path="/expenses"
              element={<Expenses />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/settings"
              element={<Settings />}
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
  );
}

export default App;