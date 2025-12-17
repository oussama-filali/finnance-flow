// components/MonthNavigation.js - Navigation mensuelle

import { formatMonthDisplay, calculateMonthBalance } from '../utils/dateUtils.js';

export function monthNavigationTemplate(currentMonth, sortedMonths, currentMonthTransactions) {
  const currentMonthIndex = sortedMonths.indexOf(currentMonth);
  const monthDisplay = formatMonthDisplay(currentMonth);
  const monthBalance = calculateMonthBalance(currentMonthTransactions);

  if (sortedMonths.length <= 1) {
    return `
      <div class="text-center border-t border-white/10 pt-4">
        <div class="text-sm font-display">${monthDisplay}</div>
        <div class="text-xs text-slate-400 mt-1">
          ${currentMonthTransactions.length} transaction(s) • 
          Solde: <span class="${monthBalance >= 0 ? 'text-green-400' : 'text-red-400'}">${monthBalance.toFixed(2)} €</span>
        </div>
      </div>
    `;
  }

  return `
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
  `;
}

export function attachMonthNavigationEvents(mount, sortedMonths, currentMonth, onMonthChange) {
  const prevMonthBtn = mount.querySelector('[data-action="prevMonth"]');
  if (prevMonthBtn && !prevMonthBtn.disabled) {
    prevMonthBtn.addEventListener("click", () => {
      const currentIndex = sortedMonths.indexOf(currentMonth);
      if (currentIndex >= 0 && currentIndex < sortedMonths.length - 1) {
        onMonthChange(sortedMonths[currentIndex + 1]);
      }
    });
  }

  const nextMonthBtn = mount.querySelector('[data-action="nextMonth"]');
  if (nextMonthBtn && !nextMonthBtn.disabled) {
    nextMonthBtn.addEventListener("click", () => {
      const currentIndex = sortedMonths.indexOf(currentMonth);
      if (currentIndex > 0) {
        onMonthChange(sortedMonths[currentIndex - 1]);
      }
    });
  }
}
