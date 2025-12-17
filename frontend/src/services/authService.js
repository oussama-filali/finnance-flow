// services/authService.js - Gestion de l'authentification

import { apiRequest } from './api.js';

export async function login(username, password) {
  const data = await apiRequest("Auth/Login.php", {
    method: "POST",
    json: { username, password },
  });
  return data;
}

export async function register(username, password) {
  const data = await apiRequest("Auth/Register.php", {
    method: "POST",
    json: { username, password },
  });
  return data;
}

export async function logout() {
  await apiRequest("Auth/Logout.php", { method: "POST" });
}

export async function checkAuth() {
  try {
    const data = await apiRequest("user");
    return data.user || null;
  } catch {
    return null;
  }
}
