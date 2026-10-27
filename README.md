# Sentinela Web 0.1

**Sua segurança começa antes do clique.**

Extensão Manifest V3 para ajudar a identificar sinais estruturais de phishing em URLs. O projeto nasceu da ideia de transformar uma experiência com uma página falsa de governo em uma ferramenta de orientação acessível.

**MVP local em desenvolvimento. Não garante segurança, não comprova fraude e não bloqueia navegação.** A versão 0.1 verifica o endereço quando você abre a extensão ou cola um link. Não monitora automaticamente sites, formulários ou e-mails.

## Instalação rápida no Windows — sem programar

O ZIP da entrega contém o código-fonte e a pasta **`extensao-pronta`**, já compilada. Você não precisa instalar Node.js para usar esse build.

1. Extraia **todo** o ZIP para uma pasta permanente, como `C:\Projetos\Sentinela-Web`.
2. No Chrome, digite `chrome://extensions`. No Edge, digite `edge://extensions`.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** (ou **Carregar descompactada**).
5. Selecione a pasta **`sentinela-web\extensao-pronta`**, que contém `manifest.json`.
6. Fixe o ícone da extensão. Abra uma página HTTP/HTTPS e clique no ícone para analisar sua URL.
7. Para conferir um link recebido sem abri-lo, cole o **endereço real** no campo do popup e clique em **Analisar**.

Não abra `popup.html` com duplo clique para instalar: isso não disponibiliza as APIs da extensão. Não apague nem mova a pasta depois de carregá-la. O guia detalhado está em [docs/INSTALACAO.md](docs/INSTALACAO.md).

**Compatibilidade:** o manifesto tem como alvo Chrome/Edge baseados em Chromium 120+. O motor, o pacote e a interface foram verificados neste ambiente; **a instalação nativa e o uso no Windows ainda precisam de validação**. Opera, Firefox, Android, Safari e iOS não estão validados nem são anunciados como compatíveis.

## O que esta versão entrega

| Recurso | Situação |
| --- | --- |
| Motor local em TypeScript, sem servidor ou chave de API | Implementado e testado |
| Normalização HTTP/HTTPS, Unicode/ASCII e domínio registrável | Implementado e testado; PSL via `tldts`, incluindo seção privada |
| Subdomínios enganosos, userinfo (`@`), HTTP, portas, IPs e encurtadores | Implementado e testado; não expande encurtadores |
| Catálogo inicial de Gov.br e PayPal | Implementado e testado; cobertura limitada |
| Homógrafos e pequenas alterações de grafia | Heurísticas experimentais, com casos testados; sem validação estatística |
| Popup, detalhes, alerta de alto risco, claro/escuro e opções | Implementado; 18 verificações em harness de interface |
| Aba ativa → service worker → motor → popup | Implementado; testado com APIs Chrome simuladas; validação nativa pendente |
| Reputação, “ameaça conhecida”, e-mail, IA/ML, denúncias | Planejado; não implementado |
| Bloqueio automático ou monitoramento da navegação | Fora do escopo da 0.1 |

## Resultados explicáveis

- **Baixo risco identificado:** nenhum indicador relevante nas verificações realizadas. Não é garantia de segurança.
- **Atenção — risco indeterminado:** informação insuficiente ou indicadores ambíguos.
- **Alto risco:** estrutura enganosa ou combinação de marca do catálogo e termos de acesso/pagamento. Pode haver falsos positivos.
- **Ameaça conhecida:** indisponível; dependerá de reputação externa confiável na fase 0.2.

Não há pontuação de 0 a 100 ou probabilidade de fraude. [Metodologia e limitações das regras](docs/REGRAS.md).

| Entrada — analisada apenas como texto | Resultado esperado | Motivo |
| --- | --- | --- |
| `https://www.gov.br/` | Baixo risco identificado | Domínio no catálogo; sem outros sinais |
| `https://www.gov.br.conta.example/` | Alto risco | `gov.br` não controla o destino `conta.example` |
| `https://desenrola-gov-br.example/pagamento` | Alto risco | Marca e contexto de pagamento fora do catálogo |
| `https://paypal-comunidade.example/` | Atenção | Menção ambígua à marca |
| `http://example.com/` | Atenção | HTTP, isoladamente, não comprova fraude |
| `https://bit.ly/simulacao` | Atenção | Destino final desconhecido |
| `javascript:alert(1)` | Análise indisponível | Protocolo não suportado; nunca é executado |

Domínios `.example` são reservados para testes. Os endereços oficiais e de encurtadores usados nos testes são strings: os testes não precisam visitá-los.

## Desenvolvimento

Requisito: **Node.js 24**, npm e acesso ao registro npm para instalar dependências. Todas as dependências estão fixadas no `package-lock.json`. Comandos PowerShell a partir da raiz do projeto:

```powershell
npm ci
npm run verify
```

`verify` executa a checagem TypeScript, testes automatizados, build e verificações estáticas do pacote. O build atualiza `extensao-pronta`. Depois de alterar o código, recarregue a extensão na página de extensões.

Para testar a interface em Chromium:

```powershell
npx playwright install chromium
npm run test:browser
```

Esse teste usa **APIs `chrome.*` simuladas**, com worker e motor reais. Não comprova carregamento nativo ou compatibilidade do Windows. Há suporte opcional à variável `SENTINELA_CHROMIUM_PATH` para um executável de Chromium já instalado. Não há modo de demonstração dentro da extensão entregue.

Para gerar outro ZIP, instale também Python 3 com o launcher `py` no Windows:

```powershell
npm run package
```

O ZIP aparece em `release`, com fonte e build, sem `node_modules`, evidências internas, dados locais ou `.git`. O SHA-256 é gerado ao lado do ZIP. Ele permite comparar arquivos, mas não equivale a assinatura de autoria.

## Estrutura

```text
apps/extension/           Manifesto, páginas, estilos, ícones e integração
packages/detection-engine/ Motor e tipos compartilhados
tests/                   Testes e corpus sintético
scripts/                 Build, verificações e empacotamento
docs/                    Instalação, metodologia, segurança e roadmap
.github/workflows/       CI preparada para GitHub
extensao-pronta/          Build instalável incluído na entrega; gerado, ignorado no Git
```

## Evidências e limites

Em **27/10/2026**: checagem TypeScript; **86 testes automatizados aprovados**; build; validação estática MV3; **18 verificações de interface em Chromium 153.0.8010.0**, com APIs simuladas. A auditoria `npm audit` retornou zero vulnerabilidades conhecidas naquele momento. Isso não substitui auditoria de segurança ou validação de eficácia contra phishing.

Não há taxa de acerto, precisão, recall ou F1 de produção: o corpus é sintético e escrito para verificar comportamento das regras. [Relatório de validação](docs/VALIDACAO.md).

## Privacidade, contribuição e evolução

A extensão não faz requisições externas. Só o tema é persistido, via armazenamento local do navegador. URLs/resultados não são gravados. A URL pode conter dados pessoais no próprio hostname; o servidor real é exibido localmente. Não compartilhe capturas sem revisá-las.

- [Arquitetura](docs/ARQUITETURA.md)
- [Privacidade](docs/PRIVACIDADE.md)
- [Modelo de ameaças](docs/AMEACAS.md)
- [Critérios por funcionalidade](docs/ACEITACAO.md)
- [Roadmap e plataformas](docs/ROADMAP.md)
- [Contribuição](CONTRIBUTING.md) e [reporte de segurança](SECURITY.md)
- [Histórico](CHANGELOG.md) e [licenciamento pendente](LICENSE)

Repositório: https://github.com/eliasramineli-sys/Sentinela-Web0.1. Consulte a aba Actions para o estado das verificações remotas; os resultados locais estão documentados acima. A escolha de licença do código próprio permanece com o titular; as licenças das dependências estão preservadas no build.
