# Instalação no Windows

## Usar o build entregue

1. Baixe e extraia todo o arquivo `Sentinela-Web-0.1.0.zip`.
2. Localize `sentinela-web\extensao-pronta\manifest.json`. Esta é a pasta de instalação.
3. Abra `chrome://extensions` ou `edge://extensions` na barra do navegador.
4. Ative **Modo do desenvolvedor** e escolha **Carregar sem compactação**. A tradução pode variar.
5. Selecione `extensao-pronta`, não a pasta do código TypeScript nem o ZIP.
6. Use o menu de extensões para fixar o Sentinela Web na barra.
7. Em uma aba HTTP/HTTPS, clique no ícone para analisar o endereço.

Não precisa de servidor, Node.js, Python, conta ou API para usar esse build.

## Primeiro teste seguro

1. Não visite um site suspeito para testar.
2. No campo manual do popup, digite `https://www.gov.br.conta.example/`.
3. Espere **Alto risco**, com servidor `www.gov.br.conta.example` e domínio registrável `conta.example`.
4. Digite `https://www.gov.br/`; espere **Baixo risco identificado**, acompanhado do aviso de que não é garantia.
5. Digite `javascript:alert(1)`; espere **Análise indisponível**, sem execução.
6. Abra detalhes, alterne o tema e consulte as orientações.

O botão “Analisar aba novamente” consulta a aba corrente, mesmo se o último resultado era um link colado. O indicador “LINK INFORMADO”/“ABA ATIVA” mostra a origem de cada resultado.

## Limitações práticas

- Páginas internas (`chrome://`, `edge://`), arquivos locais e protocolos diferentes de HTTP/HTTPS não são analisados.
- Abrir o popup como arquivo HTML não instala a extensão. O campo manual pode depender de scripts bloqueados pelo contexto local; use o modo de instalação.
- Ao abrir links internos de ajuda, você abre uma página da extensão. Volte à aba que deseja analisar antes de acionar novamente seu ícone.
- Popup extenso permite rolagem. O navegador limita seu tamanho; os indicadores e o campo manual podem ficar abaixo da primeira área visível.
- Não há ícone de “site seguro” persistente: isso evita sinalizar confiança após uma navegação que ainda não foi analisada.
- Após navegar ou ser redirecionado, analise o novo endereço. Não há análise automática em segundo plano.
- A pasta precisa continuar no mesmo local. Para atualizar, substitua o build e clique em **Recarregar** na página de extensões.

## Compilar a partir do código

No PowerShell, na raiz do projeto:

```powershell
npm ci
npm run verify
```

Isso recria `extensao-pronta`. O projeto usa Node.js 24 e não exige Python para compilar. Só gerar ZIP pelo comando `npm run package` exige Python 3.

## Remover

Na página de extensões, clique em **Remover**. O navegador administra a remoção do armazenamento da extensão. Para apagar só as preferências, use **Preferências → Excluir preferências locais**.

## Compatibilidade e evidência

Chrome e Edge no Windows são o alvo desta entrega, mas ainda não foram exercitados nativamente no Windows. Os testes de interface desta entrega usam Chromium em Linux e simulam as APIs da extensão. Siga o roteiro manual em `VALIDACAO.md` antes de distribuir a outras pessoas.

Referências oficiais conferidas em 27/10/2026:

- https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world
- https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading
