// views/RegisterView.js - Page d'inscription

import { register } from '../services/authService.js';
import { inputBase, cardShell } from '../utils/templates.js';
import { setBusy, renderErrorBlock } from '../utils/helpers.js';

export function renderRegisterView(onNavigate, onRegisterSuccess) {
  return cardShell(`
    <h1 class="font-display text-2xl">Inscription</h1>
    <p class="mt-2 text-sm text-slate-300">Créez un compte pour gérer vos finances.</p>

    <form class="mt-6 grid gap-4" data-form="register">
      <div>
        <label class="mb-1.5 block text-sm text-slate-300">Nom d'utilisateur</label>
        <input class="${inputBase()}" type="text" name="username" required />
      </div>
      <div>
        <label class="mb-1.5 block text-sm text-slate-300">Mot de passe</label>
        <input class="${inputBase()}" type="password" name="password" minlength="6" required />
      </div>
      <button class="btn-neon mt-2" type="submit">S'inscrire</button>
      <div class="text-sm" data-slot="msg"></div>
    </form>

    <div class="mt-6 border-t border-white/10 pt-4 text-center text-sm text-slate-300">
      Déjà un compte ?
      <button class="holo-text font-medium" data-action="goLogin">Se connecter</button>
    </div>
  `);
}

export function attachRegisterEvents(mount, onNavigate, onRegisterSuccess) {
  const form = mount.querySelector('[data-form="register"]');
  const msg = mount.querySelector('[data-slot="msg"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const loginBtn = mount.querySelector('[data-action="goLogin"]');

  loginBtn.addEventListener("click", () => onNavigate("/login"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.innerHTML = "";
    setBusy(submitBtn, true, "Inscription…");

    const fd = new FormData(form);
    const username = String(fd.get("username") || "").trim();
    const password = String(fd.get("password") || "");

    try {
      const data = await register(username, password);
      if (data.user) {
        onRegisterSuccess(data.user);
      } else {
        msg.innerHTML = renderErrorBlock("Échec de l'inscription");
      }
    } catch (err) {
      msg.innerHTML = renderErrorBlock(err.message || "Erreur lors de l'inscription");
    } finally {
      setBusy(submitBtn, false);
    }
  });
}
