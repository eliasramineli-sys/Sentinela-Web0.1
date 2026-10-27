# Privacidade — versão local 0.1

Atualizado em 27/10/2026. Esta descrição técnica cobre o código entregue. Uma futura operação pública precisará definir responsável, contato, termos e revisão jurídica apropriada; este documento não certifica conformidade com LGPD.

## Tratamento atual

| Dado | Finalidade | Onde existe | Retenção |
| --- | --- | --- | --- |
| URL da aba ativa | Análise solicitada pelo usuário | Worker e popup em memória | Durante execução/contexto; sem persistência própria |
| URL colada | Análise antes de abrir | Campo do popup e motor em memória | Campo limpo após análise suportada; popup descartado ao fechar |
| Trechos de caminho | Contexto de acesso/pagamento | Função em memória; não incluídos no resultado | Durante a chamada |
| Username de URL | Detectar domínio oficial mascarado antes de `@` | Função em memória | Durante a chamada; nunca devolvido |
| Servidor, Unicode, PSL, sinais e horário | Explicar resultado local | DOM do popup em memória | Até nova análise/fechamento |
| Tema claro/escuro | Aparência | `chrome.storage.local`, chave `theme` | Até exclusão das preferências ou remoção administrada pelo navegador |

Não há conta, sincronização, histórico próprio, telemetria, cookies de rastreamento, venda de dados, analytics ou comunicação com backend/terceiros. O código não chama APIs de rede, e a CSP inclui `connect-src 'none'`.

O próprio hostname pode conter dados pessoais ou identificadores; ele é exibido porque identifica o destino. Não assumimos que toda URL possa ser anonimizada apenas removendo query. Não compartilhe resultados com identificadores sem revisar.

## O que não é acessado

A extensão não injeta content scripts e não tem permissão `scripting`. Não lê campos digitados, senhas em formulários, cartões, dados bancários, texto da página, caixa de e-mail, anexos ou outras abas. URLs podem conter credenciais ou identificadores; nesses casos, a extensão os trata transitoriamente como descrito acima, sem registrá-los ou transmiti-los.

O retorno da API do navegador pode conter título/favicon; o worker usa apenas a URL e não os armazena. O navegador e o sistema operacional têm seus próprios ciclos de memória, armazenamento e configurações; limpar preferências não é promessa de apagamento forense de RAM ou backups externos.

## Permissões e escolhas

`activeTab` fornece acesso temporário à URL da aba acionada; não solicita acesso a todos os sites. `storage` guarda apenas o tema local. Não há permissões opcionais nesta versão.

Em Preferências, **Excluir preferências locais** limpa o armazenamento próprio da extensão. Fechar o popup descarta o resultado; remover a extensão é controlado pelo navegador. Clicar voluntariamente em “Consultar endereço oficial” abre o site oficial, com as requisições normais do navegador fora do motor de análise.

## Versões futuras

Qualquer reputação externa, denúncia, e-mail ou telemetria exigirá novo desenho de minimização, finalidade, consentimento quando aplicável, retenção e exclusão. Não será ativado silenciosamente pela versão 0.1. Não há canal de coleta de denúncias nesta entrega.
