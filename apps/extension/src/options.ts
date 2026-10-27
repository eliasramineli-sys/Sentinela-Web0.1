import { loadTheme, toggleTheme } from './theme';
document.getElementById('theme')?.addEventListener('click', () => { void toggleTheme(); });
document.getElementById('clear')?.addEventListener('click', () => {
  void (async () => {
    const feedback = document.getElementById('feedback')!;
    try { await chrome.storage.local.clear(); document.documentElement.dataset.theme = 'dark'; feedback.textContent = 'Preferências locais excluídas.'; }
    catch { feedback.textContent = 'Não foi possível excluir as preferências. Tente novamente.'; }
  })();
});
void loadTheme();
