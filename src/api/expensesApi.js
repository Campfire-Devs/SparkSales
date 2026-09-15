import { apiRequest } from "./client";

export async function getExpenses() {
  return apiRequest("/api/expenses");
}

export async function getExpense(id) {
  return apiRequest(`/api/expenses/${id}`);
}

export async function createExpense(payload) {
  return apiRequest("/api/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateExpense(id, payload) {
  return apiRequest(`/api/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteExpense(id) {
  return apiRequest(`/api/expenses/${id}`, {
    method: "DELETE",
  });
}