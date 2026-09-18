const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:5001";

let authToken = null;

function setAuthToken(token) {
  authToken = token;

  console.log(
    "🔑 API token updated:",
    token ? "TOKEN SET" : "TOKEN CLEARED"
  );
}

async function apiRequest(endpoint, options = {}) {
  const method = options.method || "GET";
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  console.group(`🌐 API ${method} ${endpoint}`);
  console.log("URL:", url);
  console.log("Authenticated:", Boolean(authToken));

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType =
      response.headers.get("content-type") || "";

    const isJson = contentType.includes("application/json");

    const data = isJson
      ? await response.json()
      : await response.text();

    console.log("Status:", response.status);
    console.log("Response:", data);

    if (!response.ok) {
      const message =
        typeof data === "string"
          ? data
          : data?.message ||
            data?.title ||
            "Something went wrong.";

      const error = new Error(message);

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", error);
    throw error;
  } finally {
    console.groupEnd();
  }
}

export {
  API_BASE_URL,
  apiRequest,
  setAuthToken,
};