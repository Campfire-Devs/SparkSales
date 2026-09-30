import { apiRequest } from "./client";

export async function getSettings() {
  return apiRequest("/api/settings");
}

export async function updateSettings(payload) {
  return apiRequest("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}