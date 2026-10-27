# Metodologia do motor 0.1

Não é um classificador estatístico. O motor lista sinais independentes e calcula uma categoria discreta: algum `danger` → **alto risco**; senão algum `warning` → **atenção**; caso contrário → **baixo risco identificado**. URL não analisável nunca recebe baixo risco. Informações como HTTPS não neutralizam alertas.

## Regras e interpretação

| Código | Tipo | Gatilho e limite |
| --- | --- | --- |
| `INVALID_URL` | warning / não analisado | Tipo inválido, excesso de tamanho, sintaxe, caracteres de controle, esquema ou hostname não suportado |
| `HTTPS` | info | A URL tem esquema HTTPS; não faz handshake nem confere certificado |
| `HTTP` | warning | Transporte potencialmente sem proteção; isoladamente não é fraude |
| `USERINFO` | warning | Usuário/senha na URL; não exibe os valores |
| `IP_ADDRESS` | warning | Servidor IPv4/IPv6, também possível em redes legítimas |
| `RESERVED_DOMAIN` | warning | `.example`, `.test`, `.invalid`, `.localhost` e seus subdomínios |
| `UNKNOWN_SUFFIX` | warning | Sufixo não reconhecido na cópia local; não é prova de domínio inválido |
| `NO_REGISTRABLE_DOMAIN` | warning | PSL sem eTLD+1; exceção explícita do catálogo para o próprio `gov.br` |
| `NONSTANDARD_PORT` | warning | Porta não padrão; válida em muitos serviços |
| `SHORTENER` | warning | Nome exato de encurtador no pequeno catálogo; destino não é seguido |
| `MANY_SUBDOMAINS` | warning | Cinco ou mais rótulos de subdomínio, além do domínio registrável |
| `LONG_HOST` | warning | Host acima de 180 caracteres, dificultando leitura |
| `IDN` | info | Presença de punycode; não implica fraude |
| `MIXED_SCRIPTS` | warning | Latim e grego/cirílico no mesmo rótulo; também pode ser legítimo |
| `OFFICIAL_DOMAIN` | info | Domínio do catálogo ou subdomínio com fronteira exata de rótulo |
| `DECEPTIVE_*` | danger | Domínio de uma marca aparece como sequência de rótulos em host não pertencente a ela, ou no usuário antes do `@` |
| `HOMOGRAPH_*` | warning/danger | Mapa Unicode parcial se aproxima de marca; danger só com contexto de ação, exceto se estrutura também satisfizer `DECEPTIVE_*` |
| `BRAND_ACTION_*` | danger | Token delimitado de marca e termo de ação no hostname ou caminho, fora do domínio do catálogo |
| `BRAND_SIMILAR_*` | warning | Menção de marca sem contexto forte ou distância de edição 1; mesmo junto de “login”, typo isolado permanece atenção |

As heurísticas **não bloqueiam** o destino. Um alerta alto pode ser falso positivo, por exemplo uma comunidade que usa marca e termos de autenticação no próprio endereço. A explicação descreve o indício, não uma conclusão jurídica ou confirmação de fraude.

## Catálogo inicial

Conferido em 27/10/2026, sem atualização remota automática:

| Marca | Domínio-base | Fonte oficial | Limite |
| --- | --- | --- | --- |
| Gov.br | `gov.br` | https://www.gov.br/ | Abrange domínio-base e subdomínios; não garante integridade de cada serviço |
| PayPal | `paypal.com` | https://www.paypal.com/br/home | Só esse domínio e subdomínios; outros domínios legítimos da marca podem faltar |

Tokens: Gov.br → `govbr`, `gov-br`; PayPal → `paypal`. Os nomes são usados para análise nominativa; não há vínculo, endosso ou uso dos logotipos das instituições.

Termos de ação delimitados: `login`, `signin`, `entrar`, `acesso`, `senha`, `verificar`, `validar`, `pagamento`, `pagar`, `resgate`, `desenrola`, `beneficio`, `atualizar`, `seguranca`.

Encurtadores reconhecidos por hostname exato: `bit.ly`, `t.co`, `tinyurl.com`, `cutt.ly`, `is.gd`. Não é uma lista completa nem uma acusação contra esses serviços.

## Normalização e minimização

- Limite de 8.192 caracteres. URLs sem esquema só recebem `https://` quando parecem um domínio; esquemas arbitrários são rejeitados.
- Parser WHATWG `URL`; ASCII normalizado, porta padrão omitida e um ponto terminal removido do hostname.
- Controles, barras invertidas, espaços não codificados e caracteres invisíveis selecionados são rejeitados. Não substitui validação de todos os caracteres Unicode possíveis.
- PSL empacotada com `tldts`, **seção privada habilitada**. A lista serve para limites de domínio, não reputação, titularidade, DNS ou prova de validade de um TLD.
- Punycode é decodificado somente para comparação e exibição secundária. Mapa parcial cirílico/grego e distância de edição 1 têm cobertura limitada e permanecem experimentais.
- Caminho é decodificado uma vez e limitado a 2.048 caracteres para procurar termos de ação. Query/fragmento não são inspecionados pelas regras de marca.
- Nenhum valor digitado em páginas, mensagem de e-mail, corpo da página ou header é lido.

## Atualização e qualidade

O lock fixa a versão de `tldts` que incorpora a PSL. Antes de uma distribuição, revise atualizações da dependência e do catálogo, gere novo build e repita os testes. Não há download de regras ou código em runtime.

O corpus sintético não mede eficácia real. HTTPS de sites maliciosos, domínios novos, typos não cobertos, marcas ausentes, redirects, conteúdo dinâmico e domínios oficiais comprometidos podem não ser sinalizados. Não há categoria “ameaça conhecida” sem um fornecedor de reputação confiável.
