const DEFAULT_API_BASE = "http://localhost:8000";

function getApiBase() {
  const envBase = (import.meta?.env?.VITE_API_BASE || "").trim();
  return envBase || DEFAULT_API_BASE;
}

function apiUrl(path) {
  const base = getApiBase().replace(/\/$/, "");
  const clean = String(path || "").replace(/^\//, "");
  return `${base}/${clean}`;
}

async function apiRequest(path, { method = "GET", json, formData } = {}) {
  const headers = {};
  let body;

  if (formData) {
    body = formData;
  } else if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const res = await fetch(apiUrl(path), {
    method,
    headers,
    body,
    credentials: "include",
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function formatAmount(amount) {
  const n = Number(amount || 0);
  const sign = n < 0 ? "-" : "+";
  const abs = Math.abs(n);
  return `${sign}${abs.toFixed(2)} `;
}

function formatDate(yyyyMmDd) {
  if (!yyyyMmDd) return "";
  try {
    const [y, m, d] = String(yyyyMmDd).slice(0, 10).split("-").map(Number);
    const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
    return dt.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "2-digit" });
  } catch {
    return String(yyyyMmDd);
  }
}

function el(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

function setBusy(button, busy, labelBusy = "Chargement…") {
  if (!button) return;
  button.disabled = !!busy;
  button.dataset._label = button.dataset._label || button.textContent;
  button.textContent = busy ? labelBusy : button.dataset._label;
}

function getHashRoute() {
  const raw = (location.hash || "").replace(/^#/, "");
  return raw || "/";
}

function navigate(route) {
  location.hash = `#${route}`;
}

async function tryLoadSessionUser() {
  try {
    return await apiRequest("user");
  } catch (e) {
    if (e && e.status === 401) return null;
    throw e;
  }
}

function moneyClass(amount) {
  return Number(amount) >= 0 ? "text-emerald-300" : "text-rose-300";
}

function cardShell(inner) {
  return `
    <div class="glass rounded-2xl p-5 neon-border">
      ${inner}
    </div>
  `;
}

function inputBase() {
  return "w-full rounded-xl bg-ink-850/70 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-cyan/40";
}

function labelBase() {
  return "text-xs uppercase tracking-wider text-slate-300";
}

export function startApp({ mountId }) {
  const mount = document.getElementById(mountId);
  if (!mount) throw new Error(`Je ne trouve pas l'element #${mountId}`);

  const state = {
    user: null,
    transactions: [],
    categories: [],
    currentMonth: null,
  };

  function renderShell(contentHtml) {
    const isAuthed = !!state.user;

    mount.innerHTML = `
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

            <nav class="flex items-center gap-2">
              ${
                isAuthed
                  ? `
                    <button class="btn-neon" data-nav="/dashboard">Dashboard</button>
                    <button class="btn-neon" data-nav="/transactions">Transactions</button>
                    <button class="btn-neon" data-action="logout">Deconnexion</button>
                  `
                  : `
                    <button class="btn-neon" data-nav="/login">Connexion</button>
                    <button class="btn-neon" data-nav="/register">Inscription</button>
                  `
              }
            </nav>
          </div>
        </header>

        <main class="mx-auto max-w-6xl px-4 py-8">
          ${contentHtml}
        </main>

        <footer class="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-400">
          <div class="opacity-80">FinanceFlow © ${new Date().getFullYear()}</div>
        </footer>
      </div>
    `;

    mount.querySelectorAll("[data-nav]").forEach((b) => {
      b.addEventListener("click", () => navigate(b.getAttribute("data-nav")));
    });

    const logoutBtn = mount.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        setBusy(logoutBtn, true, "Sortie…");
        try {
          await apiRequest("Auth/Logout.php", { method: "POST" });
        } catch {
          // Je garde un fallback : meme si l'API repond mal, je reviens a l'ecran login.
        } finally {
          state.user = null;
          state.transactions = [];
          state.categories = [];
          setBusy(logoutBtn, false);
          navigate("/login");
          render();
        }
      });
    }
  }

  function renderErrorBlock(message) {
    if (!message) return "";
    return `
      <div class="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-rose-100">
        <div class="text-sm">${message}</div>
      </div>
    `;
  }

  async function loadCategories() {
    state.categories = await apiRequest("categories");
  }

  async function loadTransactions() {
    state.transactions = await apiRequest("transactions");
    // Initialiser au mois le plus récent seulement si non défini
    if (!state.currentMonth && state.transactions.length > 0) {
      const months = Array.from(new Set(state.transactions.map(tx => {
        const date = new Date(tx.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }))).sort().reverse();
      state.currentMonth = months[0] || null;
    }
  }

  async function renderLogin() {
    renderShell(
      `
      <div class="grid gap-6 md:grid-cols-2">
        ${cardShell(`
          <h1 class="font-display text-2xl">Connexion</h1>
          <p class="mt-2 text-sm text-slate-300">Connectez-vous a votre compte.</p>
          <form class="mt-6 grid gap-4" data-form="login">
            <div>
              <div class="${labelBase()}">Nom d'utilisateur</div>
              <input class="${inputBase()}" name="username" autocomplete="username" required />
            </div>
            <div>
              <div class="${labelBase()}">Mot de passe</div>
              <input class="${inputBase()}" type="password" name="password" autocomplete="current-password" required />
            </div>
            <div class="grid gap-3">
              <button class="btn-neon" type="submit">Se connecter</button>
              <div class="text-xs text-slate-400">Pas de compte ? <a href="#/register">Creer un compte</a>.</div>
            </div>
            <div class="grid gap-2" data-slot="msg"></div>
          </form>
        `)}

        ${cardShell(`
          <h2 class="font-display text-xl">Info</h2>
          <p class="mt-2 text-sm text-slate-300">
            Connexion securisee par session.
          </p>
          <div class="mt-4 text-xs text-slate-400">
            Vos donnees sont protegees.
          </div>
        `)}
      </div>
      `
    );

    const form = mount.querySelector('[data-form="login"]');
    const msg = mount.querySelector('[data-slot="msg"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.innerHTML = "";
      const btn = form.querySelector('button[type="submit"]');
      setBusy(btn, true, "Connexion…");

      const fd = new FormData(form);
      const payload = {
        username: String(fd.get("username") || "").trim(),
        password: String(fd.get("password") || ""),
      };

      try {
        await apiRequest("Auth/Login.php", { method: "POST", json: payload });
        state.user = await tryLoadSessionUser();
        navigate("/dashboard");
        render();
      } catch (err) {
        msg.innerHTML = renderErrorBlock(err.message || "Erreur de connexion");
      } finally {
        setBusy(btn, false);
      }
    });
  }

  async function renderRegister() {
    renderShell(
      `
      <div class="grid gap-6 md:grid-cols-2">
        ${cardShell(`
          <h1 class="font-display text-2xl">Inscription</h1>
          <p class="mt-2 text-sm text-slate-300">Creez votre compte.</p>
          <form class="mt-6 grid gap-4" data-form="register">
            <div>
              <div class="${labelBase()}">Nom d'utilisateur</div>
              <input class="${inputBase()}" name="username" minlength="3" autocomplete="username" required />
              <div class="mt-1 text-xs text-slate-400">Minimum 3 caracteres.</div>
            </div>
            <div>
              <div class="${labelBase()}">Mot de passe</div>
              <input class="${inputBase()}" type="password" name="password" minlength="6" autocomplete="new-password" required />
              <div class="mt-1 text-xs text-slate-400">Minimum 6 caracteres.</div>
            </div>
            <div class="grid gap-3">
              <button class="btn-neon" type="submit">Creer mon compte</button>
              <div class="text-xs text-slate-400">Deja un compte ? <a href="#/login">Se connecter</a>.</div>
            </div>
            <div class="grid gap-2" data-slot="msg"></div>
          </form>
        `)}

        ${cardShell(`
          <h2 class="font-display text-xl">Securite</h2>
          <ul class="mt-3 space-y-2 text-sm text-slate-300">
            <li>Authentification securisee</li>
            <li>Donnees protegees et chiffrees</li>
            <li>Acces immediat apres inscription</li>
          </ul>
        `)}
      </div>
      `
    );

    const form = mount.querySelector('[data-form="register"]');
    const msg = mount.querySelector('[data-slot="msg"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.innerHTML = "";
      const btn = form.querySelector('button[type="submit"]');
      setBusy(btn, true, "Creation…");

      const fd = new FormData(form);
      const payload = {
        username: String(fd.get("username") || "").trim(),
        password: String(fd.get("password") || ""),
      };

      try {
        await apiRequest("Auth/Register.php", { method: "POST", json: payload });
        msg.innerHTML = `
          <div class="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-100">
            <div class="text-sm">Compte cree avec succes.</div>
          </div>
        `;
        setTimeout(() => {
          navigate("/login");
          render();
        }, 500);
      } catch (err) {
        msg.innerHTML = renderErrorBlock(err.message || "Erreur a l'inscription");
      } finally {
        setBusy(btn, false);
      }
    });
  }

  async function renderDashboard() {
    let balance = null;
    let error = "";

    try {
      const b = await apiRequest("transactions/balance");
      balance = b && typeof b.balance !== "undefined" ? Number(b.balance) : null;
      await loadTransactions();
    } catch (e) {
      error = e.message || "Erreur pendant le chargement";
    }

    const recent = (state.transactions || []).slice(0, 6);

    renderShell(
      `
      <div class="grid gap-6">
        <div class="grid gap-6 md:grid-cols-3">
          ${cardShell(`
            <div class="text-xs text-slate-300">Solde</div>
            <div class="mt-2 font-display text-3xl ${moneyClass(balance)}">${balance === null ? "—" : formatAmount(balance)}</div>
            <div class="mt-2 text-xs text-slate-400">Solde total de vos transactions.</div>
          `)}

          ${cardShell(`
            <div class="text-xs text-slate-300">Statut</div>
            <div class="mt-2 text-sm text-slate-100">${state.user ? "Connecte" : "Non connecte"}</div>
            <div class="mt-1 text-xs text-slate-400">Session active et securisee.</div>
          `)}

          ${cardShell(`
            <div class="text-xs text-slate-300">Actions rapides</div>
            <div class="mt-3 grid gap-2">
              <button class="btn-neon" data-nav="/transactions">Gerer mes transactions</button>
              <button class="btn-neon" data-nav="/dashboard">Rafraichir</button>
            </div>
          `)}
        </div>

        ${error ? renderErrorBlock(error) : ""}

        ${cardShell(`
          <div class="flex items-center justify-between">
            <h2 class="font-display text-xl">Dernieres transactions</h2>
            <div class="text-xs text-slate-400">${recent.length} element(s)</div>
          </div>
          <div class="mt-4 grid gap-2">
            ${
              recent.length
                ? recent
                    .map(
                      (t) => `
                        <div class="flex items-center justify-between rounded-xl border border-white/10 bg-ink-850/40 px-4 py-3">
                          <div>
                            <div class="text-sm text-slate-100">${t.title || "(sans titre)"}</div>
                            <div class="text-xs text-slate-400">${formatDate(t.date)}${t.location ? ` • ${t.location}` : ""}</div>
                          </div>
                          <div class="font-mono text-sm ${moneyClass(t.amount)}">${formatAmount(t.amount)}</div>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="text-sm text-slate-300">Aucune transaction pour le moment.</div>`
            }
          </div>
        `)}
      </div>
      `
    );

    mount.querySelectorAll("[data-nav]").forEach((b) => {
      b.addEventListener("click", () => navigate(b.getAttribute("data-nav")));
    });
  }

  function transactionFormTemplate({ mode, transaction, categories }) {
    const t = transaction || {};

    const catOptions = [`<option value="">(Aucune)</option>`]
      .concat(
        (categories || []).map((c) => `<option value="${c.id}" ${String(t.category_id || "") === String(c.id) ? "selected" : ""}>${c.name}</option>`)
      )
      .join("");

    return `
      <form class="grid gap-4" data-form="tx">
        <input type="hidden" name="id" value="${t.id || ""}" />

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="${labelBase()}">Titre *</div>
            <input class="${inputBase()}" name="title" value="${t.title ? String(t.title).replace(/"/g, "&quot;") : ""}" required />
          </div>
          <div>
            <div class="${labelBase()}">Montant * (negatif = depense)</div>
            <input class="${inputBase()}" name="amount" type="number" step="0.01" value="${t.amount ?? ""}" required />
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="${labelBase()}">Date *</div>
            <input class="${inputBase()}" name="date" type="date" value="${t.date ? String(t.date).slice(0, 10) : ""}" required />
          </div>
          <div>
            <div class="${labelBase()}">Lieu</div>
            <input class="${inputBase()}" name="location" value="${t.location ? String(t.location).replace(/"/g, "&quot;") : ""}" />
          </div>
        </div>

        <div>
          <div class="${labelBase()}">Description</div>
          <textarea class="${inputBase()}" name="description" rows="3">${t.description ? String(t.description) : ""}</textarea>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="${labelBase()}">Categorie</div>
            <select class="${inputBase()}" name="category_id" data-field="category">
              ${catOptions}
            </select>
          </div>
          <div>
            <div class="${labelBase()}">Sous-categorie (optionnel)</div>
            <input type="text" class="${inputBase()}" name="subcategory_text" 
                   placeholder="Ex: Courses alimentaires, Essence..." 
                   value="${t?.subcategory_text || ''}" />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button class="btn-neon" type="submit">${mode === "edit" ? "Mettre a jour" : "Ajouter"}</button>
          <button class="btn-neon" type="button" data-action="resetForm">Reinitialiser</button>
          <div class="ml-auto text-xs text-slate-400" data-slot="msg"></div>
        </div>
      </form>
    `;
  }

  function transactionRowTemplate(t) {
    return `
      <div class="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-ink-850/40 px-4 py-4">
        <div class="min-w-0">
          <div class="text-sm text-slate-100 truncate">${t.title || "(sans titre)"}</div>
          <div class="mt-1 text-xs text-slate-400">${formatDate(t.date)}${t.location ? ` • ${t.location}` : ""}</div>
          ${t.description ? `<div class="mt-2 text-xs text-slate-300">${String(t.description)}</div>` : ""}
        </div>
        <div class="shrink-0 flex flex-col items-end gap-2">
          <div class="font-mono text-sm ${moneyClass(t.amount)}">${formatAmount(t.amount)}</div>
          <div class="flex items-center gap-2">
            <button class="btn-neon" data-action="edit" data-id="${t.id}">Editer</button>
            <button class="btn-neon" data-action="delete" data-id="${t.id}">Supprimer</button>
          </div>
        </div>
      </div>
    `;
  }

  async function renderTransactions() {
    let error = "";
    
    // Charger les données seulement si vides
    try {
      if (!state.categories.length) await loadCategories();
      if (!state.transactions.length) await loadTransactions();
    } catch (e) {
      error = e.message || "Erreur pendant le chargement";
    }

    // Grouper les transactions par mois
    const transactionsByMonth = new Map();
    (state.transactions || []).forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!transactionsByMonth.has(monthKey)) {
        transactionsByMonth.set(monthKey, []);
      }
      transactionsByMonth.get(monthKey).push(tx);
    });

    // Trier les mois du plus récent au plus ancien
    const sortedMonths = Array.from(transactionsByMonth.keys()).sort().reverse();
    
    // Sélectionner le mois courant (ou réinitialiser si invalide)
    if (!state.currentMonth || !sortedMonths.includes(state.currentMonth)) {
      state.currentMonth = sortedMonths[0] || null;
    }

    const currentMonthTransactions = transactionsByMonth.get(state.currentMonth) || [];
    const currentMonthIndex = sortedMonths.indexOf(state.currentMonth);
    
    // Formater le nom du mois pour l'affichage
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    let monthDisplay = 'Aucun mois';
    if (state.currentMonth) {
      const [year, month] = state.currentMonth.split('-');
      monthDisplay = `${monthNames[parseInt(month) - 1]} ${year}`;
    }

    // Calculer le solde du mois
    const monthBalance = currentMonthTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    
    const listHtml = currentMonthTransactions.map(transactionRowTemplate).join("");

    const monthNavHtml = sortedMonths.length > 1 ? `
      <div class="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <button class="btn-neon ${currentMonthIndex >= sortedMonths.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                data-action="prevMonth" ${currentMonthIndex >= sortedMonths.length - 1 ? 'disabled' : ''}>
          ← Mois précédent
        </button>
        <div class="text-center">
          <div class="text-sm font-display">${monthDisplay}</div>
          <div class="text-xs text-slate-400 mt-1">
            ${currentMonthTransactions.length} transaction(s) • 
            Solde: <span class="${monthBalance >= 0 ? 'text-green-400' : 'text-red-400'}">${monthBalance.toFixed(2)} €</span>
          </div>
        </div>
        <button class="btn-neon ${currentMonthIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}" 
                data-action="nextMonth" ${currentMonthIndex === 0 ? 'disabled' : ''}>
          Mois suivant →
        </button>
      </div>
    ` : `
      <div class="text-center border-t border-white/10 pt-4">
        <div class="text-sm font-display">${monthDisplay}</div>
        <div class="text-xs text-slate-400 mt-1">
          ${currentMonthTransactions.length} transaction(s) • 
          Solde: <span class="${monthBalance >= 0 ? 'text-green-400' : 'text-red-400'}">${monthBalance.toFixed(2)} €</span>
        </div>
      </div>
    `;

    renderShell(
      `
      <div class="grid gap-6">
        <div class="flex items-end justify-between gap-4">
          <div>
            <h1 class="font-display text-2xl">Transactions</h1>
            <p class="mt-1 text-sm text-slate-300">Gerez vos transactions financieres.</p>
          </div>
          <button class="btn-neon" data-action="refresh">Rafraichir</button>
        </div>

        ${error ? renderErrorBlock(error) : ""}

        <div class="grid gap-6 lg:grid-cols-2">
          ${cardShell(`
            <h2 class="font-display text-xl">Ajouter / Modifier</h2>
            <div class="mt-4" data-slot="form"></div>

            <div class="mt-6 border-t border-white/10 pt-4">
              <h3 class="font-display text-lg">Import fichier</h3>
              <p class="mt-1 text-xs text-slate-400">Importez un relevé bancaire (CSV, PDF) ou un screenshot (PNG, JPG).</p>
              <form class="mt-3 grid gap-3" data-form="importFile">
                <input class="${inputBase()}" type="file" name="file" accept=".csv,.pdf,.png,.jpg,.jpeg" required />
                <button class="btn-neon" type="submit">Importer le fichier</button>
                <div class="grid gap-2" data-slot="importFileMsg"></div>
              </form>
            </div>
          `)}

          ${cardShell(`
            <div class="flex items-center justify-between">
              <h2 class="font-display text-xl">Relevé Mensuel</h2>
              <div class="text-xs text-slate-400">${(state.transactions || []).length} transaction(s) total</div>
            </div>
            <div class="mt-4 grid gap-3" data-slot="list">
              ${listHtml || `<div class="text-sm text-slate-300">Aucune transaction ce mois.</div>`}
            </div>
            ${monthNavHtml}
          `)}
        </div>
      </div>
      `
    );

    const refreshBtn = mount.querySelector('[data-action="refresh"]');
    refreshBtn.addEventListener("click", async () => {
      setBusy(refreshBtn, true, "Refresh…");
      try {
        await loadTransactions();
        render();
      } finally {
        setBusy(refreshBtn, false);
      }
    });

    const prevMonthBtn = mount.querySelector('[data-action="prevMonth"]');
    if (prevMonthBtn && !prevMonthBtn.disabled) {
      prevMonthBtn.addEventListener("click", () => {
        const months = Array.from(new Set((state.transactions || []).map(tx => {
          const date = new Date(tx.date);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }))).sort().reverse();
        
        const currentIndex = months.indexOf(state.currentMonth);
        if (currentIndex >= 0 && currentIndex < months.length - 1) {
          state.currentMonth = months[currentIndex + 1];
          render();
        }
      });
    }

    const nextMonthBtn = mount.querySelector('[data-action="nextMonth"]');
    if (nextMonthBtn && !nextMonthBtn.disabled) {
      nextMonthBtn.addEventListener("click", () => {
        const months = Array.from(new Set((state.transactions || []).map(tx => {
          const date = new Date(tx.date);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }))).sort().reverse();
        
        const currentIndex = months.indexOf(state.currentMonth);
        if (currentIndex > 0) {
          state.currentMonth = months[currentIndex - 1];
          render();
        }
      });
    }

    const formSlot = mount.querySelector('[data-slot="form"]');

    async function mountForm({ mode, transaction }) {
      formSlot.innerHTML = transactionFormTemplate({
        mode,
        transaction,
        categories: state.categories,
      });

      const form = formSlot.querySelector('[data-form="tx"]');
      const msg = form.querySelector('[data-slot="msg"]');
      const submitBtn = form.querySelector('button[type="submit"]');

      const resetBtn = form.querySelector('[data-action="resetForm"]');
      resetBtn.addEventListener("click", () => mountForm({ mode: "create", transaction: null }));

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
            await apiRequest(`transactions/${encodeURIComponent(String(fd.get("id")))}`, { method: "PUT", json: payload });
            msg.textContent = "Transaction mise a jour.";
          } else {
            await apiRequest("transactions", { method: "POST", json: payload });
            msg.textContent = "Transaction ajoutee.";
          }

          await loadTransactions();
          render();
        } catch (err) {
          msg.textContent = err.message || "Erreur pendant l'envoi";
        } finally {
          setBusy(submitBtn, false);
        }
      });
    }

    await mountForm({ mode: "create", transaction: null });

    const list = mount.querySelector('[data-slot="list"]');
    list.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      if (!action || !id) return;

      if (action === "edit") {
        const tx = (state.transactions || []).find((t) => String(t.id) === String(id));
        if (tx) {
          await mountForm({ mode: "edit", transaction: tx });
        }
      }

      if (action === "delete") {
        const ok = confirm("Confirmer la suppression ?");
        if (!ok) return;

        setBusy(btn, true, "Suppression…");
        try {
          await apiRequest(`transactions/${encodeURIComponent(String(id))}`, { method: "DELETE" });
          await loadTransactions();
          render();
        } catch (err) {
          alert(err.message || "Erreur suppression");
        } finally {
          setBusy(btn, false);
        }
      }
    });

    const importFileForm = mount.querySelector('[data-form="importFile"]');
    const importFileBtn = importFileForm.querySelector('button[type="submit"]');
    const importFileMsg = importFileForm.querySelector('[data-slot="importFileMsg"]');

    importFileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      importFileMsg.innerHTML = "";
      setBusy(importFileBtn, true, "Import…");

      const fd = new FormData(importFileForm);
      const file = fd.get("file");
      
      if (!file || !file.name) {
        importFileMsg.innerHTML = renderErrorBlock("Veuillez selectionner un fichier.");
        setBusy(importFileBtn, false);
        return;
      }

      try {
        const res = await apiRequest("import/transactions", { method: "POST", formData: fd });
        importFileMsg.innerHTML = `
          <div class="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-100">
            <div class="text-sm">Import termine. ${res?.imported ?? 0} transaction(s) importee(s).</div>
          </div>
        `;
        importFileForm.reset();
        await loadTransactions();
        render();
      } catch (err) {
        importFileMsg.innerHTML = renderErrorBlock(err.message || "Erreur import");
      } finally {
        setBusy(importFileBtn, false);
      }
    });
  }

  async function guardAuthed() {
    if (state.user) return true;

    const user = await tryLoadSessionUser();
    state.user = user;
    return !!state.user;
  }

  async function render() {
    const route = getHashRoute();

    // Je normalise les routes
    if (route === "/") {
      if (await guardAuthed()) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
      return;
    }

    if (route === "/login") {
      state.user = null;
      await renderLogin();
      return;
    }

    if (route === "/register") {
      state.user = null;
      await renderRegister();
      return;
    }

    // Routes protegees
    const ok = await guardAuthed();
    if (!ok) {
      navigate("/login");
      await renderLogin();
      return;
    }

    if (route === "/dashboard") {
      await renderDashboard();
      return;
    }

    if (route === "/transactions") {
      await renderTransactions();
      return;
    }

    // Route inconnue
    renderShell(cardShell(`<h1 class="font-display text-2xl">404</h1><p class="mt-2 text-sm text-slate-300">Page introuvable.</p>`));
  }

  window.addEventListener("hashchange", () => {
    render().catch((e) => {
      renderShell(renderErrorBlock(e.message || "Erreur"));
    });
  });

  render().catch((e) => {
    renderShell(renderErrorBlock(e.message || "Erreur"));
  });
}
