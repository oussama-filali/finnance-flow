// services/categoryService.js - Gestion des catégories

import { apiRequest } from './api.js';

export async function getAllCategories() {
  return await apiRequest("categories");
}

export async function getCategoryById(id) {
  return await apiRequest(`categories/${encodeURIComponent(id)}`);
}
