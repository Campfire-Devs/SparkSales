import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSparkSales } from "../context/SparkSalesContext";
import {
  api,
  setAuthToken as setLegacyApiAuthToken,
} from "../lib/apiClient";
import { getSettings } from "../api/settingsApi";
import { setAuthToken } from "../api/client";
import { readAccountSetting, writeAccountSetting } from "../utils/sparkSales";

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function useDailyNotifications() {
  const { account, token } = useAuth();
  const { business, totals } = useSparkSales();
  const [settingsState, setSettingsState] = useState(null);

  useEffect(() => {
    if (!token || !account) {
      return;
    }

    let active = true;

    async function loadSettings() {
      try {
        setAuthToken(token);
        setLegacyApiAuthToken(token);
        const settings = await getSettings();
        if (active) {
          setSettingsState({
            token,
            accountEmail: account.email,
            preferences: {
              dailySummaryEmail: Boolean(settings?.dailySummaryEmail),
              lossAlerts: Boolean(settings?.lossAlerts),
            },
          });
        }
      } catch (error) {
        console.error("Could not load notification preferences:", error);
        if (active) {
          setSettingsState({
            token,
            accountEmail: account.email,
            preferences: null,
          });
        }
      }
    }

    void loadSettings();

    const handleSettingsUpdated = () => {
      void loadSettings();
    };
    window.addEventListener("sparksales-settings-updated", handleSettingsUpdated);

    return () => {
      active = false;
      window.removeEventListener(
        "sparksales-settings-updated",
        handleSettingsUpdated,
      );
    };
  }, [account, token]);

  const appSettings =
    settingsState?.token === token &&
    settingsState?.accountEmail === account?.email
      ? settingsState.preferences
      : null;

  useEffect(() => {
    if (!token || !account || !business || !appSettings) return;

    const today = todayKey();

    if (appSettings.dailySummaryEmail) {
      const lastSent = readAccountSetting(account, "lastDailySummaryDate", "");
      if (lastSent !== today) {
        // Mark it sent up front so a slow response or a re-render in the
        // same session can't trigger a second send for today.
        writeAccountSetting(account, "lastDailySummaryDate", today);
        api.sendDailySummary().catch((error) => {
          console.error("Could not send daily summary:", error);
          writeAccountSetting(account, "lastDailySummaryDate", lastSent);
        });
      }
    }

    if (appSettings.lossAlerts && totals.netProfit < 0) {
      const lastAlerted = readAccountSetting(account, "lastLossAlertDate", "");
      if (lastAlerted !== today) {
        writeAccountSetting(account, "lastLossAlertDate", today);
        api.sendLossAlert().catch((error) => {
          console.error("Could not send loss alert:", error);
          writeAccountSetting(account, "lastLossAlertDate", lastAlerted);
        });
      }
    }
  }, [token, account, business, totals, appSettings]);
}
