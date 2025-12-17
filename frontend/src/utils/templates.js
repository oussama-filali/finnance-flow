// utils/templates.js - Templates HTML réutilisables

export function inputBase() {
  return "rounded-lg border border-white/20 bg-ink-800/50 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 outline-none ring-offset-2 ring-offset-ink-900 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50";
}

export function cardShell(content) {
  return `
    <div class="glass-strong rounded-2xl p-6 shadow-2xl">
      ${content}
    </div>
  `;
}
