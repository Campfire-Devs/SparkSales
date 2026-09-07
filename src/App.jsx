import { BrowserRouter, Routes, Route } from "react-router-dom";

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

import { SparkSalesProvider } from "./context/SparkSalesContext";

function App() {
  return (
    <SparkSalesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/register"
            element={<RegisterBusiness />}
          />

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
            path="/privacy"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/terms"
            element={<TermsConditions />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </BrowserRouter>
    </SparkSalesProvider>
  );
}

export default App;