export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.error) || "Terjadi kesalahan pada server");
  }
  return data;
}

export const apiGet = (path) => request(path);

export const apiPost = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body ?? {}) });

export const apiPut = (path, body) =>
  request(path, { method: "PUT", body: JSON.stringify(body ?? {}) });

export const apiDelete = (path) => request(path, { method: "DELETE" });
