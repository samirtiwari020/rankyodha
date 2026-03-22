const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const toAbsoluteUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
};

export const getAuthToken = () => localStorage.getItem("auth_token");

export const saveAuthSession = (token: string, user?: unknown) => {
  localStorage.setItem("auth_token", token);
  if (user) {
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (requireAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(toAbsoluteUrl(path), {
    ...options,
    headers
  });

  const text = await response.text();
  let data: unknown = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const maybeError = data as { message?: string; error?: string };
    const message = maybeError?.message || maybeError?.error || "Request failed";
    throw new Error(message);
  }

  return data as T;
};