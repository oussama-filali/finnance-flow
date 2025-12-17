// components/TransactionList.js - Affichage d'une transaction

export function transactionRowTemplate(t) {
  const amount = parseFloat(t.amount || 0);
  const amountClass = amount >= 0 ? "text-green-400" : "text-red-400";
  const categoryName = t.category_name || "Sans catégorie";

  return `
    <div class="glass rounded-xl p-4 transition hover:bg-white/5">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <div class="font-medium text-slate-100 truncate">${t.title}</div>
            ${t.subcategory_text ? `<span class="text-xs text-slate-400">• ${t.subcategory_text}</span>` : ''}
          </div>
          <div class="mt-1 flex items-center gap-3 text-xs text-slate-400">
            <span>${t.date}</span>
            <span>•</span>
            <span>${categoryName}</span>
            ${t.location ? `<span>• ${t.location}</span>` : ''}
          </div>
          ${t.description ? `<div class="mt-2 text-xs text-slate-300">${t.description}</div>` : ''}
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="${amountClass} text-lg font-semibold whitespace-nowrap">
            ${amount >= 0 ? '+' : ''}${amount.toFixed(2)} €
          </div>
          <div class="flex gap-1">
            <button class="btn-neon text-xs py-1 px-2" data-action="edit" data-id="${t.id}">Éditer</button>
            <button class="btn-neon text-xs py-1 px-2" data-action="delete" data-id="${t.id}">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
