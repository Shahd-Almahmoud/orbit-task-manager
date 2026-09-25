// =============================================================
// ✅ Global API client
// Every API request in the project goes through here:
//   getReq(path)              → GET
//   postReq(path, body)       → POST
//   updateReq(path, body)     → PUT
//   patchReq(path, body)      → PATCH
//   deleteReq(path)           → DELETE
// It handles: API URL (proxy or direct) + auth token + JSON headers +
//             IIS workaround for PUT/PATCH/DELETE + error parsing + session expiry.
// On failure it throws ApiError (carrying status and data), so in pages:
//   try { const data = await getReq("/tasks"); … } catch (err) { setError(err.message); }
// Note: every helper returns ready-to-use data (it auto-unwraps { data: … }).
// =============================================================
import {
  API_URL,
  clearSessionCookies,
  getStoredToken,
  withMethodOverride,
} from "@/lib/config";

export class ApiError extends Error {
  constructor(message, { status = 0, data = null, url = "" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

// A clear, user-friendly message based on the status code
function statusMessage(status) {
  if (status === 401 || status === 403) {
    return "Your session is not valid. Please login again.";
  }
  if (status === 404) return "The requested record was not found.";
  if (status === 422) return "The submitted data is invalid.";
  if (status === 429) return "Too many requests. Please try again later.";
  if (status >= 500) return "Server error. Please try again later.";
  return "Request failed. Please try again.";
}

// Extract the first error message from a Laravel response ({message} / {errors:{email:[...]}}) or from raw text
function extractMessage(data, status) {
  if (!data) return statusMessage(status);

  if (typeof data === "string") {
    const text = data.trim();
    if (!text) return statusMessage(status);
    return text.startsWith("<") ? statusMessage(status) : text.slice(0, 300);
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (data.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors)
      .flat()
      .find((value) => typeof value === "string" && value.trim());
    if (first) return first.trim();
  }

  return statusMessage(status);
}

// Read the body even when it is HTML (to avoid the "Unexpected token '<'" error)
async function readBody(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * The core request — all public helpers go through it.
 * @returns The parsed JSON data, or null when the response has no body
 * @throws {ApiError}
 */
export async function apiRequest(method, path, options = {}) {
  const { body, auth = true, headers = {}, redirectOn401 = true, signal } =
    options;

  if (!API_URL) {
    throw new ApiError(
      "API base URL is not configured. Check NEXT_PUBLIC_BASE_API_URL in .env",
    );
  }

  const requestHeaders = { Accept: "application/json" };
  if (body !== undefined && body !== null) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getStoredToken();
    if (token) requestHeaders.Authorization = `Bearer ${token}`;
  }

  // Bypass the IIS/Plesk block: PUT/PATCH/DELETE → POST + X-HTTP-Method-Override
  const { method: finalMethod, headers: finalHeaders } = withMethodOverride(
    method,
    { ...requestHeaders, ...headers },
  );

  const url = `${API_URL}${path}`;

  let response;
  try {
    response = await fetch(url, {
      method: finalMethod,
      headers: finalHeaders,
      body:
        body === undefined || body === null ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    console.error(`[api] ${finalMethod} ${url} failed:`, error);
    throw new ApiError(
      `Network error: cannot reach ${API_URL}. Check your connection (CORS or an invalid certificate can block it).`,
      { url },
    );
  }

  const data = await readBody(response);

  // Session expired → clear cookies + redirect to the login page
  if (response.status === 401 && auth && redirectOn401) {
    clearSessionCookies();
    if (typeof window !== "undefined") window.location.href = "/login";

    throw new ApiError("Session expired. Please login again.", {
      status: 401,
      data,
      url,
    });
  }

  if (!response.ok) {
    throw new ApiError(extractMessage(data, response.status), {
      status: response.status,
      data,
      url,
    });
  }

  return unwrapData(data);
}

// ===== Public helpers (use these in pages instead of calling fetch directly) =====
export const getReq = (path, options = {}) => apiRequest("GET", path, options);

export const postReq = (path, body, options = {}) =>
  apiRequest("POST", path, { ...options, body });

export const updateReq = (path, body, options = {}) =>
  apiRequest("PUT", path, { ...options, body });

export const patchReq = (path, body, options = {}) =>
  apiRequest("PATCH", path, { ...options, body });

// The {} body is required because DELETE is sent as POST + X-HTTP-Method-Override
export const deleteReq = (path, options = {}) =>
  apiRequest("DELETE", path, { body: {}, ...options });

/**
 * Auto-unwraps the { data: ... } envelope so pages never need to call unwrapData.
 */
const unwrapData = (payload) =>
  payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload;
