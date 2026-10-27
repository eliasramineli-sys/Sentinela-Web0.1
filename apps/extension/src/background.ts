import { analyzeUrl } from '../../../packages/detection-engine';
import { isAllowedRequest } from './protocol';
chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (!isAllowedRequest(message, sender, chrome.runtime.id, chrome.runtime.getURL('popup.html'))) return false;
  void (async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url) {
        sendResponse({ ok: false, error: 'Não foi possível ler a URL desta aba. Abra a extensão pelo ícone ou cole o endereço.' });
        return;
      }
      // Não persiste URL, título, favicon, resultado ou histórico; não altera a aba.
      sendResponse({ ok: true, analysis: analyzeUrl(tab.url) });
    } catch {
      sendResponse({ ok: false, error: 'A aba não está disponível. Tente novamente ou analise um link manualmente.' });
    }
  })();
  return true;
});
