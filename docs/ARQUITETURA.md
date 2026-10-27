# Arquitetura 0.1

## Componentes e fluxo

1. O usuário abre a action da extensão, concedendo o acesso temporário de `activeTab`.
2. O popup envia a mensagem de formato único `ANALYZE_ACTIVE_TAB` ao service worker.
3. O worker valida o ID da extensão, a URL exata do popup e o formato da mensagem; consulta somente a aba ativa da janela corrente.
4. O worker executa o motor puro `analyzeUrl` e responde com um resultado sem credenciais, caminho, query ou fragmento.
5. O popup renderiza texto com `textContent`, mostra os sinais, detalhes, limites e a origem do resultado.

Para links colados, o mesmo motor roda dentro do popup, sem mensagem e sem abrir o destino. Um contador impede uma resposta antiga do worker de substituir uma análise manual mais recente.

O motor não usa DOM, rede, armazenamento ou API do navegador. As mesmas entradas produzem os mesmos sinais; só o horário muda. O build `esbuild` inclui as dependências e a PSL no pacote. Não existe carregamento de código remoto, CDN ou WASM.

## Decisões

| Decisão | Justificativa e custo |
| --- | --- |
| TypeScript + HTML/CSS sem React | Interface pequena; reduz dependências e complexidade do pacote |
| Manifest V3, worker sob demanda | Atende o alvo Chromium; sem processo persistente de monitoramento |
| `activeTab` e `storage` apenas | URL temporária da aba e tema; sem `tabs`, `<all_urls>`, `scripting` ou host permissions |
| Sem content scripts | A fase 0.1 não examina formulários, textos ou inputs |
| `tldts` com `allowPrivateDomains: true` | Evita confundir `github.io` com o limite de controle de cada site hospedado |
| ASCII como identidade principal | Reduz ambiguidade visual de IDNs; Unicode aparece nos detalhes |
| Regras discretas e explicadas | Não há base empírica para afirmar uma probabilidade de fraude |
| Sem bloqueio/redirecionamento | Heurísticas iniciais não justificam bloquear um site legítimo |
| Tema em `chrome.storage.local` | Sem histórico ou sincronização com conta |
| Nenhum backend nesta fase | Não é necessário para análise estrutural local; evita transmissão de URLs e SSRF |

`gov.br` é também um sufixo público na PSL. `www.gov.br` pode aparecer como domínio registrável; o próprio `gov.br` não tem eTLD+1 segundo a lista. O reconhecimento do catálogo verifica fronteiras de rótulo separadamente. A UI preserva ambos os conceitos.

## Privacidade e erros

URLs completas existem temporariamente na resposta de `tabs.query`, no campo manual e na função de análise. O motor consulta trechos do caminho apenas em memória para termos de ação. Query/fragmento não participam das regras de marca. O resultado não contém esses trechos; nomes de servidor podem conter identificadores e continuam visíveis localmente.

URLs inválidas, protocolos não suportados e falhas de API geram indisponibilidade/atenção. Não reutilizamos silenciosamente um resultado anterior como confirmação da aba atual. Falha ao salvar tema mantém o tema só na sessão e não impede a análise.

## Evolução

Backend, PostgreSQL, Redis, dashboard e mobile não foram criados. A fase 0.2 deverá projetar um adaptador de reputação com consentimento, minimização de URLs e revisão de licença/custo do fornecedor. Um serviço de expansão de links exigirá isolamento de rede e controles específicos contra SSRF antes de existir qualquer fetch.

Referências oficiais:

- https://developer.chrome.com/docs/extensions/develop/concepts/activeTab
- https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy
- https://github.com/remusao/tldts
- https://publicsuffix.org/learn/
