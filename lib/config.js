// ✅ مصدر واحد لرابط الـ API (Single source of truth)
// الأولوية: رابط الـ API الأساسي (الإنتاج/الريموت) ثم الـ API المحلي كبديل
// Priority: NEXT_PUBLIC_BASE_API_URL (remote/production) || NEXT_PUBLIC_LOCAL_API_URL (local backend)
const RAW_BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_URL ||
  "";

// إزالة أي "/" زائدة في نهاية الرابط لتفادي //login أو /api//login
export const DIRECT_API_URL = RAW_BASE_API_URL.trim().replace(/\/+$/, "");

// عند تفعيل البروكسي (app/api/[...path]/route.js) يمر المتصفح عبر Next.js
// بنفس الأصل (same-origin) → لا مشاكل CORS ولا مشاكل شهادة SSL في المتصفح.
const USE_API_PROXY = process.env.NEXT_PUBLIC_API_PROXY === "true";

export const API_PROXY_PATH = "/api";

// الرابط المستخدم في كود المتصفح
export const API_URL = USE_API_PROXY ? API_PROXY_PATH : DIRECT_API_URL;

// مفاتيح الكوكيز المستخدمة لحفظ الجلسة
export const TOKEN_COOKIE = "access_token";
export const LEGACY_TOKEN_COOKIE = "token";
export const USER_COOKIE = "user";

// إعدادات موحدة للكوكيز (7 أيام + متاحة لكل الصفحات)
export const SESSION_COOKIE_OPTIONS = {
  expires: 7,
  path: "/",
  sameSite: "lax",
};

// ===== Method Override (IIS/Plesk workaround) =====
// سيرفر الباك إند (IIS + Plesk/WebDAV) يرفض أفعال PUT / PATCH / DELETE قبل أن تصل
// إلى Laravel ويرد 405 Method Not Allowed، لذلك نرسل الطلب كـ POST مع ترويسة
// X-HTTP-Method-Override (Laravel/Symfony يدعمها أصلًا) فيُنفَّذ الفعل الأصلي.
// النتيجة نفسها تمامًا على سيرفر سليم، لذا التركيز الافتراضي = مفعّل.
// للتعطيل (بعد إصلاح IIS): NEXT_PUBLIC_HTTP_METHOD_OVERRIDE=false
export const METHOD_OVERRIDE_HEADER = "X-HTTP-Method-Override";

const USE_METHOD_OVERRIDE =
  process.env.NEXT_PUBLIC_HTTP_METHOD_OVERRIDE !== "false";

const OVERRIDABLE_METHODS = ["PUT", "PATCH", "DELETE"];

// يُرجع { method, headers } الجاهزة للتمرير إلى fetch() مباشرة:
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

// ✅ مساعدات قراءة/كتابة الجلسة (Client-side فقط)
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
