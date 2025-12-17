// app.js - Orchestrateur principal de l'application

import { checkAuth, logout } from './services/authService.js';
import { renderShell } from './components/Shell.js';
import { renderLoginView, attachLoginEvents } from './views/LoginView.js';
import { renderRegisterView, attachRegisterEvents } from './views/RegisterView.js';
import { renderDashboardView } from './views/DashboardView.js';
import { renderTransactionsView, attachTransactionsEvents } from './views/TransactionsView.js';

// État global de l'application
const state = {
  user: null,
  transactions: [],
  categories: [],
  currentMonth: null,
  currentPage: 1,
  itemsPerPage: 10,
};

// Point de montage de l'application
const appRoot = document.getElementById("app");

// Récupère la route depuis l'URL (#/dashboard, #/login, etc.)
function getHashRoute() {
  const raw = (location.hash || "").replace(/^#/, "");
  return raw || "/";
}

// Navigation programmatique
function navigate(route) {
  location.hash = `#${route}`;
}

// Rendu principal - appelé à chaque changement de route
async function render() {
  const route = getHashRoute();

  // Routes publiques (sans authentification)
  if (route === "/login") {
    appRoot.innerHTML = renderLoginView();
    attachLoginEvents(appRoot, navigate, (user) => {
      state.user = user;
      navigate("/dashboard");
    });
    return;
  }

  if (route === "/register") {
    appRoot.innerHTML = renderRegisterView();
    attachRegisterEvents(appRoot, navigate, () => {
      navigate("/login");
    });
    return;
  }

  // Routes protégées - vérifier l'authentification
  if (!state.user) {
    navigate("/login");
    return;
  }

  // Rendu avec shell (navigation + header)
  let content = "";

  try {
    if (route === "/dashboard" || route === "/") {
      content = await renderDashboardView(state);
    } else if (route === "/transactions") {
      content = await renderTransactionsView(state);
    } else {
      content = `<div class="text-center text-slate-300">Page non trouvée: ${route}</div>`;
    }
  } catch (err) {
    content = `
      <div class="rounded bg-red-500/20 border border-red-500/30 p-4 text-red-200">
        <strong>Erreur:</strong> ${err.message || "Erreur pendant le rendu"}
      </div>
    `;
  }

  appRoot.innerHTML = renderShell({
    user: state.user,
    content,
  });

  // Attacher l'événement de déconnexion
  const logoutBtn = appRoot.querySelector('[data-action="logout"]');
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await logout();
      } catch (e) {
        console.error("Erreur logout:", e);
      }
      state.user = null;
      state.transactions = [];
      state.categories = [];
      state.currentMonth = null;
      navigate("/login");
    });
  }

  // Attacher les événements spécifiques à la page
  if (route === "/transactions") {
    attachTransactionsEvents(appRoot, state, render);
  }
}

// Initialisation de l'application
async function init() {
  try {
    // Essayer de charger l'utilisateur connecté
    const user = await checkAuth();
    if (user) {
      state.user = user;
    }
  } catch (e) {
    console.log("Pas de session active:", e.message);
  }

  // Rendre la page initiale
  await render();

  // Écouter les changements de route (hashchange)
  window.addEventListener("hashchange", render);
}

// Démarrage
init();
