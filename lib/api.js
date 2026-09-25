// =============================================================
// ✅ عميل الـ API الموحّد (Global API client)
// كل طلبات المشروع تمر من هنا:
//   getReq(path)              → GET
//   postReq(path, body)       → POST
//   updateReq(path, body)     → PUT
//   patchReq(path, body)      → PATCH
//   deleteReq(path)           → DELETE
// يتولّى: رابط الـ API (بروكسي أو مباشر) + التوكن + هيدرز JSON +
//         تجاوز حجب IIS لأفعال PUT/PATCH/DELETE + قراءة الأخطاء + انتهاء الجلسة.
// عند الفشل يرمي ApiError (يحوي status و data)، لذا في الصفحات:
//   try { const data = await getReq("/tasks"); … } catch (err) { setError(err.message); }
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

// رسالة واضحة للمستخدم حسب كود الحالة
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

// استخراج أول رسالة خطأ من رد Laravel ({message} / {errors:{email:[...]}}) أو من نص
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

// قراءة الجسم حتى لو كان HTML (لتفادي خطأ "Unexpected token '<'")
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
 * الطلب الأساسي — كل الدوال العامة تمر من هنا.
 * @returns البيانات (JSON) أو null عندما لا يوجد جسم
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

  // تجاوز حجب IIS/Plesk: PUT/PATCH/DELETE → POST + X-HTTP-Method-Override
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

  // انتهاء الجلسة → تنظيف + تحويل لصفحة الدخول
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

  return data;
}

// ===== الدوال العامة (استخدمها في الصفحات بدل fetch مباشرة) =====
export const getReq = (path, options = {}) => apiRequest("GET", path, options);

export const postReq = (path, body, options = {}) =>
  apiRequest("POST", path, { ...options, body });

export const updateReq = (path, body, options = {}) =>
  apiRequest("PUT", path, { ...options, body });

export const patchReq = (path, body, options = {}) =>
  apiRequest("PATCH", path, { ...options, body });

// الجسم {} ضروري لأن DELETE يُرسل كـ POST + X-HTTP-Method-Override
export const deleteReq = (path, options = {}) =>
  apiRequest("DELETE", path, { body: {}, ...options });

// فكّ غلاف { data: ... } (الباك إند يستخدمه في بعض المسارات فقط)
export const unwrapData = (payload) =>
  payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload;
