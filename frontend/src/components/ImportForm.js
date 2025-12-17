// components/ImportForm.js - Formulaire d'import de fichiers

import { inputBase } from '../utils/templates.js';

export function importFormTemplate() {
  return `
    <div class="mt-6 border-t border-white/10 pt-4">
      <h3 class="font-display text-lg">Import fichier</h3>
      <p class="mt-1 text-xs text-slate-400">Importez un relevé bancaire (CSV, PDF) ou un screenshot (PNG, JPG).</p>
      <form class="mt-3 grid gap-3" data-form="importFile">
        <input class="${inputBase()}" type="file" name="file" accept=".csv,.pdf,.png,.jpg,.jpeg" required />
        <button class="btn-neon" type="submit">Importer le fichier</button>
        <div class="grid gap-2" data-slot="importFileMsg"></div>
      </form>
    </div>
  `;
}
