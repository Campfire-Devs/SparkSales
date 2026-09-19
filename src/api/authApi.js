import { apiRequest } from "./client";

export async function registerUser(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser() {
  return apiRequest("/api/auth/me");
}

export async function changePassword(payload) {
  return apiRequest("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}