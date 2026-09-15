const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:5001";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("sparksales-token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  const data = isJson
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || "Something went wrong.";

    throw new Error(message);
  }

  return data;
}

export { API_BASE_URL, apiRequest };