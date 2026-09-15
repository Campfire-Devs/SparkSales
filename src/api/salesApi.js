import { apiRequest } from "./client";

export async function getSales() {
  return apiRequest("/api/sales");
}

export async function getSale(id) {
  return apiRequest(`/api/sales/${id}`);
}

export async function createSale(payload) {
  return apiRequest("/api/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSale(id, payload) {
  return apiRequest(`/api/sales/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteSale(id) {
  return apiRequest(`/api/sales/${id}`, {
    method: "DELETE",
  });
}