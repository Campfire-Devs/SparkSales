const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:5001";

// JWT is kept in memory.
// AuthContext is responsible for setting/clearing it.
let authToken = null;

function setAuthToken(token) {
  authToken = token;
}

async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType =
    response.headers.get("content-type") || "";

  const isJson = contentType.includes("application/json");

  const data = isJson
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.title ||
          "Something went wrong.";

    const error = new Error(message);

    // Keep the HTTP status available to callers.
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

export {
  API_BASE_URL,
  apiRequest,
  setAuthToken,
};