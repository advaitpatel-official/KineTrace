export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://kinetrace.onrender.com";

export const API_KEY =
  import.meta.env.VITE_API_KEY || "";

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (API_KEY) {
    headers.set("X-API-Key", API_KEY);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}