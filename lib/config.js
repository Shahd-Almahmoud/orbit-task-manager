// ✅ Single source of truth for the API URL
// Priority: the primary (remote/production) API first, then the local API as a fallback
// Priority: NEXT_PUBLIC_BASE_API_URL (remote/production) || NEXT_PUBLIC_LOCAL_API_URL (local backend)
const RAW_BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_URL ||
  "";

// Strip any trailing "/" to avoid //login or /api//login
export const DIRECT_API_URL = RAW_BASE_API_URL.trim().replace(/\/+$/, "");

// When the proxy is enabled (app/api/[...path]/route.js) the browser goes through Next.js
// on the same origin → no CORS issues and no browser SSL certificate issues.
const USE_API_PROXY = process.env.NEXT_PUBLIC_API_PROXY === "true";

export const API_PROXY_PATH = "/api";

// The URL actually used by browser code
export const API_URL = USE_API_PROXY ? API_PROXY_PATH : DIRECT_API_URL;

// Cookie names used to persist the session
export const TOKEN_COOKIE = "access_token";
export const LEGACY_TOKEN_COOKIE = "token";
export const USER_COOKIE = "user";

// Shared cookie settings (7 days + available on every page)
export const SESSION_COOKIE_OPTIONS = {
  expires: 7,
  path: "/",
  sameSite: "lax",
};

// ===== Method Override (IIS/Plesk workaround) =====
// The backend server (IIS + Plesk/WebDAV) rejects PUT / PATCH / DELETE before they reach
// Laravel and replies with 405 Method Not Allowed, so we send the request as a POST with an
// X-HTTP-Method-Override header (Laravel/Symfony supports it natively) and the original verb runs.
// A healthy server behaves exactly the same, hence the default is enabled.
// To disable it (after fixing IIS): NEXT_PUBLIC_HTTP_METHOD_OVERRIDE=false
export const METHOD_OVERRIDE_HEADER = "X-HTTP-Method-Override";

const USE_METHOD_OVERRIDE =
  process.env.NEXT_PUBLIC_HTTP_METHOD_OVERRIDE !== "false";

const OVERRIDABLE_METHODS = ["PUT", "PATCH", "DELETE"];

// Returns { method, headers } ready to pass straight into fetch():
//   const { method, headers } = withMethodOverride("DELETE", getAuthHeaders());
export function withMethodOverride(method, headers = {}) {
  const upper = String(method || "GET").toUpperCase();

  if (!USE_METHOD_OVERRIDE || !OVERRIDABLE_METHODS.includes(upper)) {
    return { method: upper, headers };
  }

  return {
    method: "POST",
    headers: { ...headers, [METHOD_OVERRIDE_HEADER]: upper },
  };
}

// ✅ Session read/write helpers (client-side only)
export function getStoredToken() {
  if (typeof document === "undefined") return null;
  const read = (name) => {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
    );
    return match ? decodeURIComponent(match[1]) : null;
  };
  return read(TOKEN_COOKIE) || read(LEGACY_TOKEN_COOKIE) || null;
}

export function getStoredUser() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${USER_COOKIE}=([^;]*)`),
  );
  if (!match) return null;

  const raw = decodeURIComponent(match[1]);
  if (!raw || raw === "undefined") return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Corrupted session cookie:", error);
    return null;
  }
}

export function clearSessionCookies() {
  if (typeof document === "undefined") return;
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  [TOKEN_COOKIE, LEGACY_TOKEN_COOKIE, USER_COOKIE].forEach((name) => {
    document.cookie = `${name}=; ${expire}`;
  });
}
