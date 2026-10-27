# Funcionalidades, testes e critérios de aceitação

| Funcionalidade e objetivo | Implementação | Risco/limitação | Testes e critério observável |
| --- | --- | --- | --- |
| Ler endereço corretamente | WHATWG URL + limites de entrada/host | Parser não confirma DNS/certificado | Inválidos/protocolos rejeitados sem exceção nem baixo risco; fuzz de 500 entradas |
| Mostrar domínio real | `tldts` + seção privada | PSL estática; não atesta titularidade | `example.co.uk`, `gov.br`, `github.io`, IP e domínio reservado com saídas esperadas |
| Encontrar imitações iniciais | Catálogo Gov.br/PayPal; fronteira de rótulo; contexto de ação | Falsos positivos/negativos e catálogo incompleto | `gov.br.conta.example` alto; oficial sem indícios baixo; menção em caminho não vira imitação |
| Alertar sem falsas métricas | Categorias discretas e indicadores explicados | Heurísticas sem validação estatística | Sem `score`, probabilidade ou “ameaça conhecida” artificial; `danger` gera alto |
| Identificar homógrafos iniciais | ASCII/Unicode e mapa parcial | Experimental, sem TR39 completo | Caso `раypal.example/login` sinalizado; `bücher.de` não é malicioso só por IDN |
| Sinalizar incerteza estrutural | HTTP/IP/porta/encurtador/muitos subdomínios | Sinais comuns em serviços legítimos | HTTP isolado não é alto; encurtador não é seguido nem “ameaça conhecida” |
| Integrar a aba sob demanda | Worker + `activeTab`, mensagem restrita | Integração nativa ainda não validada | Harness exercita worker real com APIs simuladas; roteiro Windows pendente |
| Conferir link sem abrir | Motor no popup, sem navegação | Usuário precisa copiar endereço real, não só texto do link | Campo manual gera resultado; nenhuma requisição ao destino no harness |
| Explicar resultado | Popup com estado, servidor, origem, sinais e detalhes | Conteúdo pode exigir rolagem | Harness verifica baixo/alto/indisponível e quatro verificações nos detalhes |
| Orientar em alto risco | Painel destacado e link oficial estático | Sem bloqueio, histórico anterior ou prova de fraude | Painel visível só em alto; href confere com catálogo |
| Proteger dados | Resposta sem userinfo/caminho/query/fragmento, tema único persistente | Host pode conter identificador | Teste de segredos, inspeção de storage no harness e pacote sem APIs de rede |
| Permitir personalização/exclusão | Tema e limpar storage local | Falha de storage mantém tema só na sessão | Tema sobrevive à reabertura do harness; exclusão esvazia dados |
| Tolerar falhas e concorrência | Estados indisponíveis + contador de requisição | Não acompanha navegação sem nova análise | API indisponível não deixa verde; manual funciona; resposta antiga não sobrescreve resultado |
| Empacotar e reproduzir | Lock, build local, CI, ZIP de fonte/build | CI remota ainda não executada | `npm run verify`; recursos do manifesto e fontes presentes; ZIP íntegro |

Todos os testes são de comportamento esperado no corpus sintético ou em APIs simuladas. Não comprovam taxa de detecção de golpes reais. Os detalhes de evidência e pendências estão em `VALIDACAO.md`.
