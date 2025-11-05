// client/utils/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function getAuthHeader(): Record<string,string> {
  const token = localStorage.getItem("mms_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;

  // merge headers but keep user-specified ones
  const headers = new Headers(opts.headers ?? {});
  Object.entries(getAuthHeader()).forEach(([k, v]) => headers.set(k, v));

  const resp = await fetch(url, { ...opts, headers });
  const text = await resp.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!resp.ok) {
    const err: any = new Error(`API error ${resp.status}: ${text}`);
    err.status = resp.status;
    err.body = data;
    throw err;
  }
  return data;
}

/**
 * Upload a FormData to an endpoint (multipart). Returns parsed JSON or throws.
 * Adds Authorization header automatically if token exists.
 */
export async function apiUpload(path: string, form: FormData, opts: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : "/" + path}`;

  const headers = new Headers(opts.headers ?? {});
  Object.entries(getAuthHeader()).forEach(([k, v]) => headers.set(k, v));

  // Important: do NOT set Content-Type for FormData; browser sets it automatically.
  const resp = await fetch(url, { method: "POST", body: form, ...opts, headers });
  const text = await resp.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!resp.ok) {
    const err: any = new Error(`Upload error ${resp.status}: ${text}`);
    err.status = resp.status;
    err.body = data;
    throw err;
  }
  return data;
}

/* ---------- New OTP helpers ---------- */

/* ---------- New OTP helpers ---------- */

/**
 * Request OTP to be sent to `email`. Server: POST /auth/request-otp { email }
 */
export async function requestSignupOtp(email: string) {
  return apiFetch("/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

/**
 * Verify OTP for signup. Server: POST /auth/verify-otp { email, otp }
 */
export async function verifySignupOtp(email: string, otp: string) {
  return apiFetch("/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
}

