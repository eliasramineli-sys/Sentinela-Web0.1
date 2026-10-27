import { parse } from 'tldts';
import { toUnicode } from 'punycode/';
import { BRANDS, editDistance, isWithinDomain, skeleton } from './brands';
import type { Analysis, Indicator } from './types';
export type { Analysis, Indicator, Risk } from './types';
export const STATUS_LABELS = {
  low: 'Baixo risco identificado', attention: 'Atenção — risco indeterminado', high: 'Alto risco'
} as const;
export const LIMITATIONS = [
  'Análise estrutural local do endereço; não comprova a segurança da página.',
  'Sem consulta de reputação, DNS, certificado, conteúdo da página ou destino de redirecionamentos.',
  'Marcas cobertas: Gov.br e PayPal. Homógrafos e erros de digitação têm cobertura parcial.'
];
const CHECKS = ['Normalização de URL', 'Domínio e Public Suffix List', 'Comparação de marcas do catálogo', 'Sinais estruturais'];
const SHORTENERS = new Set(['bit.ly', 't.co', 'tinyurl.com', 'cutt.ly', 'is.gd']);
const ACTION = /(?:^|[.\/_-])(?:login|signin|entrar|acesso|senha|verificar|validar|pagamento|pagar|resgate|desenrola|beneficio|atualizar|seguranca)(?:$|[.\/_-])/i;
const RESERVED = /(?:^|\.)(?:example|test|invalid|localhost)$/i;
function initial(): Analysis {
  return { version: '0.1.0', status: 'attention', supported: false, analyzedAt: new Date().toISOString(),
    hostname: null, unicodeHostname: null, registrableDomain: null, publicSuffix: null, subdomain: null,
    protocol: null, privateSuffix: false, indicators: [], officialBrand: null, relatedBrands: [],
    checks: [], limitations: [...LIMITATIONS] };
}
function invalid(message: string): Analysis {
  const result = initial();
  result.indicators.push({ code: 'INVALID_URL', severity: 'warning', title: 'Endereço não analisado', explanation: message });
  return result;
}
function decodePath(path: string): string {
  // Só em memória; caminhos não são devolvidos, registrados ou persistidos.
  try { return decodeURIComponent(path).slice(0, 2048); } catch { return path.slice(0, 2048); }
}
export function analyzeUrl(input: unknown): Analysis {
  if (typeof input !== 'string' || !input.trim()) return invalid('Informe uma URL HTTP ou HTTPS.');
  if (input.length > 8192) return invalid('O endereço excede o limite de 8.192 caracteres.');
  const raw = input.trim();
  if (/[\u0000-\u0020\u007f\\\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u.test(raw)) {
    return invalid('Há espaços, controles invisíveis ou barras invertidas. Use a URL original com codificação adequada.');
  }
  let candidate = raw;
  if (!/^https?:\/\//i.test(candidate)) {
    if (/^[\p{L}\p{N}.-]+(?::\d+)?(?:[/?#]|$)/u.test(raw) && raw.split(/[/?#]/)[0]!.includes('.')) candidate = `https://${raw}`;
    else return invalid('Somente HTTP/HTTPS são analisados. Páginas internas e arquivos locais não são suportados.');
  }
  let url: URL;
  try { url = new URL(candidate); } catch { return invalid('Não foi possível interpretar este endereço.'); }
  if (!['https:', 'http:'].includes(url.protocol) || !url.hostname) return invalid('Este tipo de endereço não é suportado.');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (host.includes('..') || (!host.startsWith('[') && !/^[a-z0-9.-]+$/.test(host))) return invalid('O nome do servidor não é válido para esta análise.');
  const labels = host.split('.');
  if (!host.startsWith('[') && (host.length > 253 || labels.some(l => !l || l.length > 63 || l.startsWith('-') || l.endsWith('-')))) {
    return invalid('O domínio contém rótulos inválidos ou excede os limites DNS.');
  }
  const parts = parse(host, { allowPrivateDomains: true, validateHostname: true });
  let unicodeHost: string;
  try { unicodeHost = toUnicode(host); } catch { return invalid('A codificação internacional do domínio não pôde ser interpretada.'); }
  const result = initial();
  Object.assign(result, { supported: true, hostname: host, unicodeHostname: unicodeHost,
    registrableDomain: parts.domain, publicSuffix: parts.publicSuffix, subdomain: parts.subdomain,
    protocol: url.protocol.replace(':', ''), privateSuffix: parts.isPrivate === true, checks: [...CHECKS] });
  const add = (code: string, severity: Indicator['severity'], title: string, explanation: string) => {
    if (!result.indicators.some(i => i.code === code)) result.indicators.push({ code, severity, title, explanation });
  };
  if (url.protocol === 'http:') add('HTTP', 'warning', 'Conexão sem HTTPS', 'O endereço usa HTTP. Dados podem trafegar sem proteção; isso, isoladamente, não prova fraude.');
  else add('HTTPS', 'info', 'O endereço usa HTTPS', 'HTTPS protege o transporte quando a conexão é válida. A extensão não verifica certificados nem a legitimidade do site.');
  if (url.username || url.password) add('USERINFO', 'warning', 'Há credenciais antes do domínio', 'O trecho antes de @ não identifica o site de destino. Confirme o nome do servidor exibido nesta análise.');
  if (parts.isIp) add('IP_ADDRESS', 'warning', 'Destino é um endereço IP', 'Não é possível associar este IP a uma instituição pelo catálogo. IPs também são usados em serviços legítimos e redes locais.');
  if (RESERVED.test(host)) add('RESERVED_DOMAIN', 'warning', 'Domínio reservado para testes ou uso local', 'Este endereço é reservado. Os exemplos .example são analisados sem visitar o destino.');
  else if (!parts.isIcann && !parts.isPrivate && !parts.isIp) add('UNKNOWN_SUFFIX', 'warning', 'Sufixo sem correspondência na lista local', 'A lista pode estar desatualizada. Isso não prova que o domínio seja inválido ou malicioso.');
  if (!parts.domain && !parts.isIp) add('NO_REGISTRABLE_DOMAIN', 'warning', 'Domínio registrável não identificado', 'Pode ser um sufixo público ou nome local. A análise de titularidade é limitada.');
  if (url.port) add('NONSTANDARD_PORT', 'warning', 'Porta não padrão', 'O endereço usa uma porta diferente da padrão do protocolo. Pode ser um serviço legítimo; confirme sua origem.');
  if (SHORTENERS.has(host)) add('SHORTENER', 'warning', 'Link encurtado', 'O destino final está oculto. Esta versão não segue o redirecionamento nem conhece a reputação do destino.');
  if ((parts.subdomain?.split('.').filter(Boolean).length ?? 0) >= 5) add('MANY_SUBDOMAINS', 'warning', 'Muitos níveis de subdomínio', 'Uma estrutura longa pode dificultar a leitura do domínio real. Não é prova de fraude.');
  if (host.length > 180) add('LONG_HOST', 'warning', 'Nome de servidor extenso', 'O nome é longo e dificulta a conferência visual.');
  if (host.includes('xn--')) add('IDN', 'info', 'Domínio internacionalizado (punycode)', 'Domínios internacionais são legítimos. Confira a forma ASCII; a detecção de semelhanças Unicode é parcial.');
  if (unicodeHost.split('.').some(l => /[a-z]/i.test(l) && /[\p{Script=Cyrillic}\p{Script=Greek}]/u.test(l))) {
    add('MIXED_SCRIPTS', 'warning', 'Alfabetos diferentes no mesmo rótulo', 'Há mistura de letras latinas com gregas ou cirílicas. Alguns caracteres podem parecer iguais; isso também ocorre em nomes legítimos.');
  }
  const official = BRANDS.find(b => b.domains.some(d => isWithinDomain(host, d)));
  if (official) {
    result.officialBrand = official.name;
    add('OFFICIAL_DOMAIN', 'info', `Domínio do catálogo: ${official.name}`, 'O nome do servidor está dentro de um domínio do catálogo. Isso não atesta conteúdo, integridade, remetente ou pagamentos.');
    if (host === 'gov.br') result.indicators = result.indicators.filter(i => i.code !== 'NO_REGISTRABLE_DOMAIN');
  }
  const hostnameSkeleton = skeleton(unicodeHost);
  const credentialContext = ACTION.test(`${hostnameSkeleton}/${decodePath(url.pathname)}`);
  for (const brand of BRANDS) {
    if (brand.domains.some(d => isWithinDomain(host, d))) continue;
    const embeddedDomain = brand.domains.some(d => (`.${hostnameSkeleton}.`).includes(`.${d}.`));
    const tokens = hostnameSkeleton.split(/[.-]/).filter(Boolean);
    const joined = tokens.join('-');
    const alias = brand.tokens.some(t => tokens.includes(t) || (`-${joined}-`).includes(`-${t}-`));
    const typo = tokens.some(t => brand.tokens.some(b => b.length >= 5 && t !== b && Math.abs(t.length - b.length) <= 1 && editDistance(t, b) === 1));
    const homograph = unicodeHost !== hostnameSkeleton && (alias || embeddedDomain);
    let userinfoBrand = false;
    try {
      const user = decodeURIComponent(url.username).toLowerCase();
      userinfoBrand = brand.domains.some(d => user === d || user.endsWith(`.${d}`));
    } catch { /* Nunca devolve credenciais. */ }
    if (!embeddedDomain && !alias && !typo && !userinfoBrand) continue;
    result.relatedBrands.push({ name: brand.name, officialUrl: brand.officialUrl });
    if (embeddedDomain || userinfoBrand) add(`DECEPTIVE_${brand.id}`, 'danger', `Estrutura pode se passar por ${brand.name}`,
      `O nome de ${brand.name} aparece em uma parte que não controla o destino. O servidor real não está nos domínios dessa marca no catálogo.`);
    else if (homograph) add(`HOMOGRAPH_${brand.id}`, credentialContext ? 'danger' : 'warning', `Semelhança visual com ${brand.name}`,
      `O mapa parcial de caracteres encontrou uma semelhança com ${brand.name} fora dos domínios do catálogo${credentialContext ? ', combinada com termos de acesso ou pagamento' : ''}. Confirme por um canal oficial.`);
    else if (alias && credentialContext) add(`BRAND_ACTION_${brand.id}`, 'danger', `Nome de ${brand.name} com termos de acesso ou pagamento`,
      'O endereço combina a marca com termos de ação fora dos domínios do catálogo. A combinação indica possível imitação; não comprova fraude.');
    else add(`BRAND_SIMILAR_${brand.id}`, 'warning', `Nome semelhante a ${brand.name}`,
      'Há referência ou grafia próxima da marca fora dos domínios conhecidos. Pode ser menção legítima; confirme quem opera o endereço.');
  }
  result.status = result.indicators.some(i => i.severity === 'danger') ? 'high'
    : result.indicators.some(i => i.severity === 'warning') ? 'attention' : 'low';
  return result;
}
