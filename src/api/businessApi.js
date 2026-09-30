import { apiRequest } from "./client";

export async function getMyBusiness() {
  return apiRequest("/api/business");
}

export async function createBusiness(payload) {
  return apiRequest("/api/business", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateBusiness(payload) {
  return apiRequest("/api/business", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateCommissionRate(commissionRate) {
  return apiRequest("/api/business/commission-rate", {
    method: "PUT",
    body: JSON.stringify({
      commissionRate,
    }),
  });
}