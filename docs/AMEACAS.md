# Modelo de ameaças 0.1

## Ativos, fronteiras e hipóteses

Ativos: URLs potencialmente sensíveis, identidade do destino exibido, precisão das explicações e integridade do pacote. A página visitada, o endereço colado e os remetentes de mensagens são entradas não confiáveis. O popup e o worker pertencem à extensão; dependências/build são parte da cadeia de fornecimento.

Hipóteses: navegador e sistema não comprometidos; pacote instalado corresponde ao código entregue; usuário aciona a análise. O produto não é antivírus, filtro de rede ou verificador de transações financeiras.

| Ameaça | Controle atual | Limite residual |
| --- | --- | --- |
| URL enganosa/Unicode | Parser, PSL privada, ASCII principal, catálogo com fronteiras e mapa parcial | Semelhanças não cobertas podem passar |
| XSS na interface | `textContent`, ausência de `innerHTML`, scripts locais, CSP restrita | Compromisso do build/dependência pode alterar a lógica |
| Página enviando comandos ao worker | Verificação de ID, URL exata do popup e esquema único; sem content scripts ou conexão externa | Extensão já comprometida está fora dessa proteção |
| Roubo de URL/tokens | Sem rede, logs, histórico; campos minimizados na resposta | URL bruta existe temporariamente em memória; hostname pode conter dados pessoais |
| SSRF e execução de conteúdo remoto | Nenhum servidor, fetch ou expansão de destino | Fase de reputação exigirá novo modelo e isolamento antes de implementar |
| Esgotamento por entrada enorme | Limite de 8.192 caracteres e limites de rótulos DNS | Latência de produção ainda não foi medida |
| Falsa confiança em domínio oficial/HTTPS | Avisos, nenhuma garantia, informações não cancelam alertas | Usuário pode ignorar o texto; integridade do conteúdo não é verificada |
| Resultado antigo após navegação | Análise sob demanda, origem explícita, sem badge verde persistente; descarte de resposta antiga | Popup já aberto não acompanha todas as navegações |
| Denúncias maliciosas | Módulo não existe; nenhuma denúncia muda classificação | Exigirá moderação, auditoria e recurso na fase 0.5 |
| Cadeia de dependências | Lock gerado pelo npm, versões fixas, licenças preservadas, audit e testes | Audit sem achados não significa ausência de vulnerabilidades |
| Atualização adulterada | Fonte/versionamento, SHA-256 do ZIP, sem código remoto | ZIP não assinado; hash não confirma autoria ou canal de origem |

## Regras de implementação

Não interpolar URLs em HTML, comandos de shell ou destinos abertos automaticamente. Os links oficiais vêm somente do catálogo revisado. Não adicionar `eval`, código remoto, `unsafe-eval`, host permissions ou telemetria sem revisar o modelo de ameaças e a finalidade.

CSP: `default-src 'self'`, scripts/estilos/imagens/fontes locais; `connect-src`, `object-src`, `base-uri`, `form-action` e `frame-src` restritos conforme manifesto. Links de navegação voluntária para serviços oficiais continuam possíveis. Sem credenciais padrão, segredos ou backend.

## Antes da distribuição pública

Executar instalação nativa e testes manuais nas versões alvo de Chrome/Edge, revisão de dependências e permissões, avaliação com corpus real licenciado, acessibilidade com leitor de tela, consumo/latência e revisão independente de segurança. Resolver licença do código, suporte, responsável pelo produto, assinatura/distribuição e processo de atualização. Estas etapas permanecem pendentes; não são alegadas como concluídas.
