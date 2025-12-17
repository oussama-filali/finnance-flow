// components/TransactionForm.js - Formulaire de transaction

import { inputBase } from '../utils/templates.js';

export function transactionFormTemplate({ mode, transaction, categories }) {
  const isEdit = mode === "edit";
  const tx = transaction || {};

  return `
    <form class="grid gap-4" data-form="tx">
      ${isEdit ? `<input type="hidden" name="id" value="${tx.id || ''}" />` : ''}
      
      <div>
        <label class="mb-1.5 block text-sm text-slate-300">Titre</label>
        <input class="${inputBase()}" type="text" name="title" value="${tx.title || ''}" required />
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm text-slate-300">Montant (€)</label>
          <input class="${inputBase()}" type="number" step="0.01" name="amount" value="${tx.amount || ''}" required />
        </div>
        <div>
          <label class="mb-1.5 block text-sm text-slate-300">Date</label>
          <input class="${inputBase()}" type="date" name="date" value="${tx.date || new Date().toISOString().slice(0, 10)}" required />
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm text-slate-300">Lieu (optionnel)</label>
        <input class="${inputBase()}" type="text" name="location" value="${tx.location || ''}" />
      </div>

      <div>
        <label class="mb-1.5 block text-sm text-slate-300">Description (optionnel)</label>
        <textarea class="${inputBase()}" name="description" rows="2">${tx.description || ''}</textarea>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm text-slate-300">Catégorie</label>
          <select class="${inputBase()}" name="category_id">
            <option value="">-- Aucune --</option>
            ${(categories || []).map(c => 
              `<option value="${c.id}" ${tx.category_id == c.id ? 'selected' : ''}>${c.name}</option>`
            ).join('')}
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm text-slate-300">Sous-catégorie (texte libre)</label>
          <input class="${inputBase()}" type="text" name="subcategory_text" value="${tx.subcategory_text || ''}" placeholder="Ex: Restaurant, Essence..." />
        </div>
      </div>

      <div class="flex gap-3 border-t border-white/10 pt-4">
        <button class="btn-neon flex-1" type="submit">
          ${isEdit ? 'Mettre à jour' : 'Ajouter'}
        </button>
        ${isEdit ? '<button class="btn-neon" type="button" data-action="resetForm">Annuler</button>' : ''}
      </div>

      <div class="text-sm text-cyan-300" data-slot="msg"></div>
    </form>
  `;
}
