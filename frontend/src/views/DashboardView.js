// views/DashboardView.js - Page tableau de bord

import { getBalance } from '../services/transactionService.js';
import { cardShell } from '../utils/templates.js';

export async function renderDashboardView() {
  let balance = 0;
  try {
    const data = await getBalance();
    if (data && typeof data.balance !== 'undefined') {
      balance = Number(data.balance) || 0;
    }
  } catch (err) {
    console.error("Erreur chargement balance:", err);
    // Ne pas planter si pas connecté
    balance = 0;
  }

  const balanceClass = balance >= 0 ? "text-green-400" : "text-red-400";

  return `
    <div class="grid gap-6">
      <div>
        <h1 class="font-display text-2xl">Dashboard</h1>
        <p class="mt-1 text-sm text-slate-300">Vue d'ensemble de vos finances</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        ${cardShell(`
          <h2 class="font-display text-lg">Solde Total</h2>
          <div class="${balanceClass} mt-4 text-4xl font-bold">
            ${balance >= 0 ? '+' : ''}${balance.toFixed(2)} €
          </div>
          <p class="mt-2 text-xs text-slate-400">Toutes transactions confondues</p>
        `)}

        ${cardShell(`
          <h2 class="font-display text-lg">Actions Rapides</h2>
          <div class="mt-4 grid gap-2">
            <a href="#/transactions" class="btn-neon w-full text-center">
              Voir les transactions
            </a>
          </div>
        `)}
      </div>
    </div>
  `;
}

export function attachDashboardEvents(mount, onNavigate) {
  const goTransactionsBtn = mount.querySelector('[data-action="goTransactions"]');
  if (goTransactionsBtn) {
    goTransactionsBtn.addEventListener("click", () => onNavigate("/transactions"));
  }
}
