// utils/helpers.js - Fonctions utilitaires

export function setBusy(btn, isBusy, loadingText = "Chargement…") {
  if (!btn) return;
  
  if (isBusy) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = loadingText;
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || btn.textContent;
  }
}

export function renderErrorBlock(message) {
  return `
    <div class="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
      <div class="text-sm text-red-200">${message}</div>
    </div>
  `;
}
