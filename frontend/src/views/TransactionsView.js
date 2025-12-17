// views/TransactionsView.js - Page de gestion des transactions

import { getAllTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/transactionService.js';
import { getAllCategories } from '../services/categoryService.js';
import { importFile } from '../services/importService.js';
import { cardShell } from '../utils/templates.js';
import { setBusy, renderErrorBlock } from '../utils/helpers.js';
import { groupTransactionsByMonth, getSortedMonths } from '../utils/dateUtils.js';
import { transactionFormTemplate } from '../components/TransactionForm.js';
import { transactionRowTemplate } from '../components/TransactionList.js';
import { monthNavigationTemplate, attachMonthNavigationEvents } from '../components/MonthNavigation.js';
import { importFormTemplate } from '../components/ImportForm.js';

export async function renderTransactionsView(state) {
  let error = "";
  
  // Charger les données seulement si vides
  try {
    if (!state.categories.length) {
      state.categories = await getAllCategories();
    }
    if (!state.transactions.length) {
      state.transactions = await getAllTransactions();
      // Initialiser au mois le plus récent
      if (!state.currentMonth && state.transactions.length > 0) {
        const byMonth = groupTransactionsByMonth(state.transactions);
        const months = getSortedMonths(byMonth);
        state.currentMonth = months[0] || null;
      }
    }
  } catch (e) {
    error = e.message || "Erreur pendant le chargement";
  }

  // Grouper les transactions par mois
  const transactionsByMonth = groupTransactionsByMonth(state.transactions);
  const sortedMonths = getSortedMonths(transactionsByMonth);
  
  // Vérifier que le mois courant est valide
  if (!state.currentMonth || !sortedMonths.includes(state.currentMonth)) {
    state.currentMonth = sortedMonths[0] || null;
    state.currentPage = 1;
  }

  const currentMonthTransactions = transactionsByMonth.get(state.currentMonth) || [];
  
  // Pagination dans le mois
  const totalPages = Math.ceil(currentMonthTransactions.length / state.itemsPerPage);
  if (state.currentPage > totalPages) state.currentPage = 1;
  
  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const endIndex = startIndex + state.itemsPerPage;
  const paginatedTransactions = currentMonthTransactions.slice(startIndex, endIndex);
  
  const listHtml = paginatedTransactions.map(transactionRowTemplate).join("");
  const monthNavHtml = monthNavigationTemplate(state.currentMonth, sortedMonths, currentMonthTransactions);
  
  const paginationHtml = totalPages > 1 ? `
    <div class="flex items-center justify-between gap-3 border-t border-white/10 pt-3 mt-3">
      <button class="btn-neon text-sm ${state.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
              data-action="prevPage" ${state.currentPage === 1 ? 'disabled' : ''}>
        ← Précédent
      </button>
      <div class="text-xs text-slate-400">
        Page ${state.currentPage}/${totalPages} • ${paginatedTransactions.length} sur ${currentMonthTransactions.length} transactions
      </div>
      <button class="btn-neon text-sm ${state.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" 
              data-action="nextPage" ${state.currentPage === totalPages ? 'disabled' : ''}>
        Suivant →
      </button>
    </div>
  ` : '';

  return `
    <div class="grid gap-6">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl">Transactions</h1>
          <p class="mt-1 text-sm text-slate-300">Gérez vos transactions financières.</p>
        </div>
        <button class="btn-neon" data-action="refresh">Rafraîchir</button>
      </div>

      ${error ? renderErrorBlock(error) : ""}

      <div class="grid gap-6 lg:grid-cols-2">
        ${cardShell(`
          <h2 class="font-display text-xl">Ajouter / Modifier</h2>
          <div class="mt-4" data-slot="form"></div>
          ${importFormTemplate()}
        `)}

        ${cardShell(`
          <div class="flex items-center justify-between">
            <h2 class="font-display text-xl">Relevé Mensuel</h2>
            <div class="text-xs text-slate-400">${state.transactions.length} transaction(s) total</div>
          </div>
          <div class="mt-4 grid gap-3" data-slot="list">
            ${listHtml || `<div class="text-sm text-slate-300">Aucune transaction ce mois.</div>`}
          </div>
          ${paginationHtml}
          ${monthNavHtml}
        `)}
      </div>
    </div>
  `;
}

export function attachTransactionsEvents(mount, state, onReload) {
  // Bouton rafraîchir
  const refreshBtn = mount.querySelector('[data-action="refresh"]');
  refreshBtn.addEventListener("click", async () => {
    setBusy(refreshBtn, true, "Refresh…");
    try {
      state.transactions = await getAllTransactions();
      state.currentPage = 1;
      onReload();
    } finally {
      setBusy(refreshBtn, false);
    }
  });

  // Pagination par page
  const prevPageBtn = mount.querySelector('[data-action="prevPage"]');
  if (prevPageBtn && !prevPageBtn.disabled) {
    prevPageBtn.addEventListener("click", () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        onReload();
      }
    });
  }

  const nextPageBtn = mount.querySelector('[data-action="nextPage"]');
  if (nextPageBtn && !nextPageBtn.disabled) {
    nextPageBtn.addEventListener("click", () => {
      state.currentPage++;
      onReload();
    });
  }

  // Navigation mensuelle
  const byMonth = groupTransactionsByMonth(state.transactions);
  const sortedMonths = getSortedMonths(byMonth);
  attachMonthNavigationEvents(mount, sortedMonths, state.currentMonth, (newMonth) => {
    state.currentMonth = newMonth;
    state.currentPage = 1; // Reset page quand on change de mois
    onReload();
  });

  // Formulaire de transaction
  const formSlot = mount.querySelector('[data-slot="form"]');
  mountTransactionForm(formSlot, state, onReload);

  // Liste des transactions (éditer/supprimer)
  const list = mount.querySelector('[data-slot="list"]');
  list.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    if (!action || !id) return;

    if (action === "edit") {
      const tx = state.transactions.find((t) => String(t.id) === String(id));
      if (tx) {
        mountTransactionForm(formSlot, state, onReload, { mode: "edit", transaction: tx });
      }
    }

    if (action === "delete") {
      const ok = confirm("Confirmer la suppression ?");
      if (!ok) return;

      setBusy(btn, true, "Suppression…");
      try {
        await deleteTransaction(id);
        state.transactions = await getAllTransactions();
        onReload();
      } catch (err) {
        alert(err.message || "Erreur lors de la suppression");
      } finally {
        setBusy(btn, false);
      }
    }
  });

  // Formulaire d'import
  const importForm = mount.querySelector('[data-form="importFile"]');
  const importMsg = mount.querySelector('[data-slot="importFileMsg"]');
  const importBtn = importForm.querySelector('button[type="submit"]');

  importForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    importMsg.innerHTML = "";
    setBusy(importBtn, true, "Import…");

    const fd = new FormData(importForm);
    const file = fd.get("file");

    try {
      const result = await importFile(file);
      const count = result.imported || 0;
      importMsg.innerHTML = `<div class="text-sm text-green-300">✓ ${count} transaction(s) importée(s)</div>`;
      state.transactions = await getAllTransactions();
      importForm.reset();
      onReload();
    } catch (err) {
      importMsg.innerHTML = renderErrorBlock(err.message || "Erreur lors de l'import");
    } finally {
      setBusy(importBtn, false);
    }
  });
}

function mountTransactionForm(formSlot, state, onReload, options = {}) {
  const { mode = "create", transaction = null } = options;

  formSlot.innerHTML = transactionFormTemplate({
    mode,
    transaction,
    categories: state.categories,
  });

  const form = formSlot.querySelector('[data-form="tx"]');
  const msg = form.querySelector('[data-slot="msg"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const resetBtn = form.querySelector('[data-action="resetForm"]');

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      mountTransactionForm(formSlot, state, onReload, { mode: "create", transaction: null });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    setBusy(submitBtn, true, "Envoi…");

    const fd = new FormData(form);
    const payload = {
      title: String(fd.get("title") || "").trim(),
      amount: Number(fd.get("amount")),
      date: String(fd.get("date") || "").slice(0, 10),
      location: String(fd.get("location") || "").trim() || null,
      description: String(fd.get("description") || "").trim() || null,
      category_id: String(fd.get("category_id") || ""),
      subcategory_text: String(fd.get("subcategory_text") || "").trim() || null,
    };

    try {
      if (mode === "edit" && fd.get("id")) {
        await updateTransaction(String(fd.get("id")), payload);
        msg.textContent = "Transaction mise à jour.";
      } else {
        await createTransaction(payload);
        msg.textContent = "Transaction ajoutée.";
      }

      state.transactions = await getAllTransactions();
      onReload();
    } catch (err) {
      msg.textContent = err.message || "Erreur pendant l'envoi";
    } finally {
      setBusy(submitBtn, false);
    }
  });
}
