// utils/dateUtils.js - Utilitaires pour les dates et mois

export function groupTransactionsByMonth(transactions) {
  const byMonth = new Map();
  
  (transactions || []).forEach(tx => {
    const date = new Date(tx.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, []);
    }
    byMonth.get(monthKey).push(tx);
  });
  
  return byMonth;
}

export function getSortedMonths(transactionsByMonth) {
  return Array.from(transactionsByMonth.keys()).sort().reverse();
}

export function formatMonthDisplay(monthKey) {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  if (!monthKey) return 'Aucun mois';
  
  const [year, month] = monthKey.split('-');
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

export function calculateMonthBalance(transactions) {
  return transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
}
