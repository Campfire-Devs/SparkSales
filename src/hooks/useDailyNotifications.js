import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSparkSales } from "../context/SparkSalesContext";
import { api } from "../lib/apiClient";
import { readAccountSetting, writeAccountSetting } from "../utils/sparkSales";

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const defaultAppSettings = {
  dailySummaryEmail: false,
  notificationEmail: "",
  lossAlerts: false,
};

// Fires the daily-summary and loss-alert emails using whatever's actually in
// SparkSalesContext right now. There's no server-side data or scheduler
// behind this — it only fires while the app is open in a tab, at most once
// per calendar day each, using this account's own settings from Settings.jsx.
export function useDailyNotifications() {
  const { account, token } = useAuth();
  const { business, totals } = useSparkSales();

  useEffect(() => {
    if (!token || !account || !business) return;

    const appSettings = readAccountSetting(account, "app", defaultAppSettings);
    const recipient = appSettings.notificationEmail || account.email;
    const today = todayKey();

    if (appSettings.dailySummaryEmail) {
      const lastSent = readAccountSetting(account, "lastDailySummaryDate", "");
      if (lastSent !== today) {
        // Mark it sent up front so a slow response or a re-render in the
        // same session can't trigger a second send for today.
        writeAccountSetting(account, "lastDailySummaryDate", today);
        api
          .sendDailySummary({
            businessName: business.name,
            recipient,
            revenue: totals.revenue,
            expenses: totals.expenses,
            grossProfit: totals.grossProfit,
            netProfit: totals.netProfit,
          })
          .catch(() => {
            // Sending failed — clear the marker so it's retried next time
            // the app is opened today, instead of silently skipping today.
            writeAccountSetting(account, "lastDailySummaryDate", lastSent);
          });
      }
    }

    if (appSettings.lossAlerts && totals.netProfit < 0) {
      const lastAlerted = readAccountSetting(account, "lastLossAlertDate", "");
      if (lastAlerted !== today) {
        writeAccountSetting(account, "lastLossAlertDate", today);
        api
          .sendLossAlert({
            businessName: business.name,
            recipient,
            netProfit: totals.netProfit,
          })
          .catch(() => {
            writeAccountSetting(account, "lastLossAlertDate", lastAlerted);
          });
      }
    }
  }, [token, account, business, totals]);
}
