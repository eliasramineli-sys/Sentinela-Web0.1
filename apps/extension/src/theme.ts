export async function loadTheme(): Promise<void> {
  try {
    const data = await chrome.storage.local.get('theme');
    const theme: unknown = data.theme;
    document.documentElement.dataset.theme = theme === 'light' || theme === 'dark' ? theme
      : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch { /* A falha de preferências não impede a análise local. */ }
}
export async function toggleTheme(): Promise<void> {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { await chrome.storage.local.set({ theme }); } catch { /* Mantém o tema nesta sessão. */ }
}
