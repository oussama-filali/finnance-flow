// views/LoginView.js - Page de connexion

import { login } from '../services/authService.js';
import { inputBase, cardShell } from '../utils/templates.js';
import { setBusy, renderErrorBlock } from '../utils/helpers.js';

export function renderLoginView(onNavigate, onLoginSuccess) {
  return cardShell(`
    <h1 class="font-display text-2xl">Connexion</h1>
    <p class="mt-2 text-sm text-slate-300">Connectez-vous pour acceder a votre dashboard.</p>

    <form class="mt-6 grid gap-4" data-form="login">
      <div>
        <label class="mb-1.5 block text-sm text-slate-300">Nom d'utilisateur</label>
        <input class="${inputBase()}" type="text" name="username" required />
      </div>
      <div>
        <label class="mb-1.5 block text-sm text-slate-300">Mot de passe</label>
        <input class="${inputBase()}" type="password" name="password" required />
      </div>
      <button class="btn-neon mt-2" type="submit">Se connecter</button>
      <div class="text-sm" data-slot="msg"></div>
    </form>

    <div class="mt-6 border-t border-white/10 pt-4 text-center text-sm text-slate-300">
      Pas encore de compte ?
      <button class="holo-text font-medium" data-action="goRegister">S'inscrire</button>
    </div>
  `);
}

export function attachLoginEvents(mount, onNavigate, onLoginSuccess) {
  const form = mount.querySelector('[data-form="login"]');
  const msg = mount.querySelector('[data-slot="msg"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const registerBtn = mount.querySelector('[data-action="goRegister"]');

  registerBtn.addEventListener("click", () => onNavigate("/register"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";
    setBusy(submitBtn, true, "Connexion…");

    const fd = new FormData(form);
    const username = String(fd.get("username") || "").trim();
    const password = String(fd.get("password") || "");

    try {
      const data = await login(username, password);
      if (data.user) {
        onLoginSuccess(data.user);
      } else {
        msg.innerHTML = renderErrorBlock("Échec de connexion");
      }
    } catch (err) {
      msg.innerHTML = renderErrorBlock(err.message || "Erreur lors de la connexion");
    } finally {
      setBusy(submitBtn, false);
    }
  });
}
