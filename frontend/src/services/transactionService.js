// services/transactionService.js - Gestion des transactions

import { apiRequest } from './api.js';

export async function getAllTransactions() {
  return await apiRequest("transactions");
}

export async function getTransactionById(id) {
  return await apiRequest(`transactions/${encodeURIComponent(id)}`);
}

export async function createTransaction(data) {
  return await apiRequest("transactions", { method: "POST", json: data });
}

export async function updateTransaction(id, data) {
  return await apiRequest(`transactions/${encodeURIComponent(id)}`, {
    method: "PUT",
    json: data,
  });
}

export async function deleteTransaction(id) {
  return await apiRequest(`transactions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getBalance() {
  return await apiRequest("transactions/balance");
}
