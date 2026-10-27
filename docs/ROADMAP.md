# Roadmap e plataformas

## Evolução do produto

| Versão | Escopo | Estado / porta de saída |
| --- | --- | --- |
| 0.1 | Motor local, popup, integração sob demanda, testes e documentação | Implementado; validação nativa Chrome/Edge Windows pendente |
| 0.2 | Reputação, cache e tratamento de indisponibilidade | Planejado; avaliar fonte, licença, limites, custos, consentimento, minimização e atualização verificável |
| 0.3 | Links antes da abertura e e-mail | Planejado; acesso restrito e explícito; não ler toda a caixa; SPF/DKIM/DMARC não garantem legitimidade |
| 0.4 | ML como camada complementar | Planejado; dados licenciados, validação independente, sem decisões de bloqueio só por IA |
| 0.5 | Dashboard e denúncias | Planejado; consentimento, moderação, prevenção de abuso, revisão e trilha de decisões |
| 1.0 | Distribuição pública | Planejado; revisão independente, suporte, licença, privacidade, compatibilidade e processo de atualização |

Nenhuma data ou taxa de detecção está prometida. A versão 0.1 não chama APIs pagas e não exige servidor; uma futura publicação ou serviço pode ter custos próprios, a avaliar antes de contratar.

## Matriz de plataformas

| Plataforma | Caminho proposto | Estado atual |
| --- | --- | --- |
| Chrome Windows | WebExtension Manifest V3 | Alvo 0.1; instalação nativa pendente |
| Edge Windows | Mesmo pacote MV3 | Alvo 0.1; instalação nativa pendente |
| Opera Windows | Avaliar APIs/permissões e distribuição | Não validado |
| Firefox desktop | Manifesto e background específicos quando necessário | Não adaptado/não validado |
| Firefox Android | Avaliar suporte atual, UX e distribuição de add-on | Planejado; não validado |
| Chrome Android | Aplicativo complementar para links compartilhados | Planejado; não se presume instalação de extensão comum |
| Safari iOS | Safari Web Extension empacotada em app | Planejado; requer avaliação atual de Xcode, assinatura e distribuição Apple |
| Android/iOS app | Receber URL por compartilhamento e analisar | Planejado; não existe app nesta entrega |

Os caminhos mobile são propostas de arquitetura, não afirmações de compatibilidade. Na fase correspondente, conferir documentação oficial e executar testes físicos antes de anunciar suporte.
