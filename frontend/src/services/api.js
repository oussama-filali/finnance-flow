// services/api.js - Configuration et requêtes API de base

const DEFAULT_API_BASE = "http://localhost:8000";

export function getApiBase() {
  const envBase = (import.meta?.env?.VITE_API_BASE || "").trim();
  return envBase || DEFAULT_API_BASE;
}

export function apiUrl(path) {
  const base = getApiBase().replace(/\/$/, "");
  const clean = String(path || "").replace(/^\//, "");
  return `${base}/${clean}`;
}

export async function apiRequest(path, { method = "GET", json, formData } = {}) {
  const headers = {};
  let body;

  if (formData) {
    body = formData;
  } else if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const res = await fetch(apiUrl(path), {
    method,
    headers,
    body,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  
  if (!res.ok) {
    let msg = `Erreur HTTP ${res.status}`;
    try {
      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.error) msg = data.error;
      }
    } catch {}
    throw new Error(msg);
  }

  if (contentType.includes("application/json")) {
    return await res.json();
  }
  return await res.text();
}
