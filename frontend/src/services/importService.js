// services/importService.js - Import de fichiers

import { apiRequest } from './api.js';

export async function importFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  return await apiRequest("import/transactions", {
    method: "POST",
    formData,
  });
}
