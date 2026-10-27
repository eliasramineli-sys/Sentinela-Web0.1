import type { Brand } from './types';
// Catálogo limitado. Fontes e data de conferência em docs/REGRAS.md.
export const BRANDS: readonly Brand[] = [
  { id: 'govbr', name: 'Gov.br', domains: ['gov.br'], tokens: ['govbr', 'gov-br'], officialUrl: 'https://www.gov.br/' },
  { id: 'paypal', name: 'PayPal', domains: ['paypal.com'], tokens: ['paypal'], officialUrl: 'https://www.paypal.com/' }
];
export function isWithinDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}
// Mapa parcial; não implementa Unicode TR39 completo.
const CONFUSABLES: Record<string, string> = {
  'а': 'a', 'ɑ': 'a', 'α': 'a', 'е': 'e', 'ε': 'e', 'о': 'o', 'ο': 'o',
  'р': 'p', 'ρ': 'p', 'с': 'c', 'ϲ': 'c', 'х': 'x', 'χ': 'x',
  'у': 'y', 'ү': 'y', 'і': 'i', 'ι': 'i', 'ј': 'j', 'ѕ': 's', 'ԁ': 'd'
};
export function skeleton(text: string): string {
  return [...text.normalize('NFKC').toLowerCase()].map(c => CONFUSABLES[c] ?? c).join('');
}
export function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length]!;
}
