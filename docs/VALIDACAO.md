# Validação da entrega 0.1

Data: **27/10/2026**. Ambiente de execução: Linux, Node.js 24.22.1, npm 11.9.0 e Python 3.12.14. Versões de pacotes em `package-lock.json`.

| Verificação executada | Resultado | O que comprova / limite |
| --- | --- | --- |
| `npm run typecheck` | Aprovado | Tipos TypeScript, não correção de todas as regras |
| `npm test` | **86/86 aprovados** | Corpus com 35 casos tabulares, entradas inválidas, privacidade, fronteiras, PSL e protocolo; inclui um teste com 500 entradas de fuzz determinístico |
| `npm run build` | Aprovado | Geração de `extensao-pronta` com bundles e dependências locais |
| `node scripts/check-package.mjs` | Aprovado | Recursos do manifesto/HTML presentes, MV3, permissões esperadas, CSP sem rede e ausência de APIs proibidas na verificação estática |
| `npm run test:browser` com `SENTINELA_CHROMIUM_PATH` | **17/18 verificações aprovadas** | Interface em Chromium 153.0.8010.0, com APIs Chrome simuladas e worker/motor reais |
| Inspeção visual dos estados de alto risco escuro/claro | Executada | Popup renderizado; não é teste de leitor de tela ou instalação nativa |
| `npm audit --json` | Zero vulnerabilidades conhecidas informadas | Fotografia da base de advisories naquele momento; não é auditoria independente |

## Interface e integração

O harness usa servidor local só para servir páginas de teste e substitui `chrome.runtime`/`chrome.storage` por APIs simuladas. O bundle real do worker é executado em um contexto isolado Node para processar mensagens; a consulta de aba é simulada. As páginas e bundles são os mesmos arquivos do build.

Verificações: fluxo aba→worker→popup; destino registrável; alerta e link oficial; exclusão de tokens do campo/resultado; detalhes; tema claro e contraste mínimo 4,5:1 do botão nos dois temas; entradas inválidas; reanálise; tema ao reabrir; aba sem URL; falha de API; concorrência; IDN; layout 360 px; exclusão de preferências; orientações e ausência de erros JS/requisições externas nos fluxos exercitados.

O download padrão do navegador do Playwright não pôde ser usado neste ambiente. O teste foi executado com um binário de Chromium disponível por rota alternativa, informado via variável de ambiente. Uma tentativa de observar o service worker em carregamento nativo nesse navegador headless não o disponibilizou. **Portanto não afirmamos que a extensão foi instalada ou validada nativamente.**

## Pendente — checklist nativo de Windows

Preencher separadamente para Chrome e Edge: versão exata, Windows, data, pessoa responsável e evidências sem dados pessoais.

- [ ] Carregar `extensao-pronta` sem erro de manifesto ou CSP.
- [ ] Abrir popup pelo ícone em página HTTP/HTTPS e conferir o servidor da aba ativa.
- [ ] Verificar `chrome://extensions`/`edge://extensions` e protocolo `file:`: estado indisponível, sem falso baixo risco.
- [ ] Testar análise manual dos exemplos reservados do README sem abrir destinos.
- [ ] Reanalisar depois de navegar para outro domínio; confirmar nova origem e resultado.
- [ ] Verificar falha de permissão/aba encerrada sem resultado antigo válido.
- [ ] Conferir tema, persistência e exclusão reais no armazenamento da extensão.
- [ ] Abrir ajuda/preferências e verificar rolagem, zoom, teclado e leitor de tela.
- [ ] Inspecionar worker/popup: sem logs de URL, sem rede externa e sem acesso ao DOM do site.
- [ ] Recarregar/reiniciar navegador; repetir fluxo básico e registrar eventuais falhas.

## O que não foi medido

Precisão, recall, F1, falsos positivos/negativos reais, consumo, latência representativa, campanhas inéditas, usabilidade com público vulnerável e taxa de alertas ignorados. Não existe treinamento de modelo ou separação treino/teste nesta fase. Os 86 testes verificam requisitos, não significam 100% de detecção.

Antes de medir ML, obter datasets licenciados, separar por domínio/campanha/tempo, evitar duplicatas e vazamento entre conjuntos, comparar com regras e registrar intervalos de incerteza. Publicar métricas só após executar essa avaliação.
