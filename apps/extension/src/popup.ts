import { analyzeUrl, STATUS_LABELS } from '../../../packages/detection-engine';
import type { Analysis } from '../../../packages/detection-engine';
import { BRANDS } from '../../../packages/detection-engine/brands';
import { loadTheme, toggleTheme } from './theme';
function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Elemento de interface ausente: ${id}`);
  return node as T;
}
function text(tag: string, value: string, className = ''): HTMLElement {
  const node = document.createElement(tag); node.textContent = value; node.className = className; return node;
}
function render(result: Analysis, source: 'manual' | 'tab'): void {
  el('result').className = `result ${result.status}`; el('result').setAttribute('aria-busy', 'false');
  el('status').textContent = result.supported ? STATUS_LABELS[result.status] : 'Análise indisponível';
  el('status-symbol').textContent = result.status === 'high' ? '!' : result.status === 'low' ? '✓' : '?';
  el('summary').textContent = !result.supported ? 'Use o campo abaixo para conferir uma URL HTTP ou HTTPS.'
    : result.status === 'high' ? 'Sinais relevantes de possível imitação. Confira antes de agir.'
    : result.status === 'attention' ? 'Há pontos que exigem conferência ou informação insuficiente.'
    : 'Nenhum sinal relevante nas verificações locais realizadas.';
  el('hostname').textContent = result.hostname ?? 'Endereço não analisado';
  el('source').textContent = source === 'manual' ? 'LINK INFORMADO' : 'ABA ATIVA';
  el('domain').textContent = `Domínio registrável: ${result.registrableDomain ?? 'não identificado'}`;
  el('announcement').textContent = `${el('status').textContent}. Servidor: ${result.hostname ?? 'não disponível'}.`;
  const list = el('indicators'); list.replaceChildren();
  for (const indicator of result.indicators) {
    const li = text('li', '', `indicator ${indicator.severity}`);
    li.append(text('span', indicator.severity === 'danger' ? '!' : indicator.severity === 'warning' ? '·' : '✓', 'indicator-icon'));
    const content = text('div', ''); content.append(text('h3', indicator.title), text('p', indicator.explanation));
    li.append(content); list.append(li);
  }
  el('signal-count').textContent = `${result.indicators.filter(i => i.severity !== 'info').length} ponto(s) de atenção`;
  el('warning-panel').hidden = result.status !== 'high'; el('official-links').replaceChildren();
  for (const related of result.relatedBrands) {
    const brand = BRANDS.find(b => b.name === related.name && b.officialUrl === related.officialUrl);
    if (!brand) continue;
    const link = text('a', `Consultar endereço oficial de ${brand.name}`) as HTMLAnchorElement;
    link.href = brand.officialUrl; link.target = '_blank'; link.rel = 'noopener noreferrer';
    el('official-links').append(link);
  }
  const technical = el('technical'); technical.replaceChildren();
  const pairs = [
    ['Servidor ASCII', result.hostname], ['Forma Unicode (conferir com ASCII)', result.unicodeHostname],
    ['Domínio registrável (PSL)', result.registrableDomain], ['Sufixo público', result.publicSuffix],
    ['Subdomínio (PSL)', result.subdomain || 'nenhum'], ['Seção privada da PSL', result.privateSuffix ? 'sim' : 'não'],
    ['Protocolo da URL', result.protocol], ['Domínio no catálogo', result.officialBrand ?? 'nenhuma correspondência'],
    ['Analisado em', new Date(result.analyzedAt).toLocaleString('pt-BR')]
  ];
  for (const [key, value] of pairs) { technical.append(text('dt', key!), text('dd', value ?? 'não identificado')); }
  el('checks').replaceChildren(...result.checks.map(c => text('li', c)));
  el('limitations').replaceChildren(...result.limitations.map(c => text('li', c)));
}
let requestNumber = 0;
async function analyzeActiveTab(): Promise<void> {
  const request = ++requestNumber;
  el('refresh').setAttribute('disabled', ''); el('error').hidden = true; el('result').setAttribute('aria-busy', 'true');
  try {
    const response = await chrome.runtime.sendMessage({ type: 'ANALYZE_ACTIVE_TAB' });
    if (request !== requestNumber) return;
    if (!response?.ok || !response.analysis) throw new Error('TAB_UNAVAILABLE');
    render(response.analysis as Analysis, 'tab');
  } catch {
    if (request !== requestNumber) return;
    render(analyzeUrl(''), 'tab');
    el('error').textContent = 'Não foi possível ler esta aba. Abra uma página HTTP/HTTPS e clique no ícone da extensão, ou cole um link.';
    el('error').hidden = false;
  } finally {
    if (request === requestNumber) { el('refresh').removeAttribute('disabled'); el('result').setAttribute('aria-busy', 'false'); }
  }
}
el('manual-form').addEventListener('submit', event => {
  event.preventDefault(); ++requestNumber; el('refresh').removeAttribute('disabled'); el('error').hidden = true;
  const input = el<HTMLInputElement>('url-input'); const result = analyzeUrl(input.value);
  if (result.supported) input.value = '';
  render(result, 'manual');
});
el('refresh').addEventListener('click', () => { void analyzeActiveTab(); });
el('theme').addEventListener('click', () => { void toggleTheme(); });
void loadTheme(); void analyzeActiveTab();
