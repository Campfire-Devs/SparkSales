const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : "https://localhost:5001/api");

let authToken = null;

// AuthContext calls this whenever the token changes (login, register, logout).
export function setAuthToken(token) {
  authToken = token;
}

export function getOAuthUrl(provider) {
  if (provider !== "google" && provider !== "apple") {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }
  return `${API_BASE}/auth/${provider}`;
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(message || `Request to ${path} failed (${res.status})`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: data }),
  login: (data) => request("/auth/login", { method: "POST", body: data }),
  changePassword: (data) => request("/auth/change-password", { method: "PUT", body: data }),

  // Business
  getMyBusiness: () => request("/business"),
  createBusiness: (data) => request("/business", { method: "POST", body: data }),
  updateBusiness: (data) => request("/business", { method: "PUT", body: data }),
  updateCommissionRate: (rate) =>
    request("/business/commission-rate", { method: "PUT", body: { commissionRate: rate } }),

  // Sales / expenses
  getSales: () => request("/sales"),
  addSale: (data) => request("/sales", { method: "POST", body: data }),
  getExpenses: () => request("/expenses"),
  addExpense: (data) => request("/expenses", { method: "POST", body: data }),

  // Team
  getTeam: () => request("/team"),
  addTeamMember: (data) => request("/team", { method: "POST", body: data }),
  removeTeamMember: (id) => request(`/team/${id}`, { method: "DELETE" }),

  // Settings
  getSettings: () => request("/settings"),
  updateSettings: (data) => request("/settings", { method: "PUT", body: data }),

  // Deletion requests
  getDeletionRequest: (email) => request(`/deletion-request?email=${encodeURIComponent(email)}`),
  requestDeletion: (email, businessName, reason) =>
    request("/deletion-request", { method: "POST", body: { email, businessName, reason } }),
  cancelDeletion: (id) => request(`/deletion-request/${id}/cancel`, { method: "POST" }),
};