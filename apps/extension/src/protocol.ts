export function isAllowedRequest(message: unknown, sender: chrome.runtime.MessageSender, runtimeId: string, popupUrl: string): boolean {
  if (sender.id !== runtimeId || sender.url !== popupUrl || !message || typeof message !== 'object' || Array.isArray(message)) return false;
  const object = message as Record<string, unknown>;
  return Object.keys(object).length === 1 && object.type === 'ANALYZE_ACTIVE_TAB';
}
