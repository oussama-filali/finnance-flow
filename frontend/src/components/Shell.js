// components/Shell.js - Layout principal (header + footer)

export function renderShell({ content, user }) {
  const isAuthed = !!user;

  return `
    <div class="min-h-screen">
      <div class="pointer-events-none fixed inset-0 opacity-60 fx-scanlines"></div>

      <header class="sticky top-0 z-10 border-b border-white/10 bg-ink-900/70 backdrop-blur">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl glass-strong flex items-center justify-center animate-pulseGlow">
              <span class="font-display text-sm holo-text">φ</span>
            </div>
            <div>
              <div class="font-display text-lg leading-tight">FinanceFlow</div>
              <div class="text-xs text-slate-300">Budget • Transactions • Sessions</div>
            </div>
          </div>

          <nav class="flex items-center gap-2" data-nav-container>
            ${
              isAuthed
                ? `
                  <a href="#/dashboard" class="btn-neon">Dashboard</a>
                  <a href="#/transactions" class="btn-neon">Transactions</a>
                  <button class="btn-neon" data-action="logout">Deconnexion</button>
                `
                : `
                  <a href="#/login" class="btn-neon">Connexion</a>
                  <a href="#/register" class="btn-neon">Inscription</a>
                `
            }
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-8">
        ${content}
      </main>

      <footer class="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-400">
        <div class="opacity-80">FinanceFlow © ${new Date().getFullYear()}</div>
      </footer>
    </div>
  `;
}

export function attachShellEvents(mount, onNavigate, onLogout) {
  // Navigation
  mount.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const path = btn.getAttribute("data-nav");
      if (onNavigate) onNavigate(path);
    });
  });

  // Logout
  const logoutBtn = mount.querySelector('[data-action="logout"]');
  if (logoutBtn && onLogout) {
    logoutBtn.addEventListener("click", onLogout);
  }
}
