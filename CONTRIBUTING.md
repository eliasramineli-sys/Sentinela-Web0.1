# Contribuição

Leia `docs/REGRAS.md`, `docs/AMEACAS.md` e `docs/PRIVACIDADE.md` antes de mudar regras, permissões ou tratamento de dados. O licenciamento do código próprio ainda depende de escolha do titular.

1. Instale Node.js 24 e execute `npm ci`.
2. Crie uma branch para a mudança. Evite renomear ou reiniciar a estrutura sem necessidade.
3. Adicione casos de URL apenas como texto. Use domínios reservados para exemplos enganosos; não visite sites maliciosos nos testes.
4. Para novas regras, documente gatilho, severidade, falsos positivos plausíveis e limite de cobertura. Não transforme mera palavra-chave em prova de fraude.
5. Execute `npm run verify` e, quando houver mudança de UI/integração, `npm run test:browser`.
6. Faça instalação manual no navegador alvo quando alterar manifesto/integração. Registre versão, plataforma e resultado sem exagerar o alcance dos testes.

Não adicione URLs com tokens, dados pessoais reais, históricos de navegação, logs de vítimas, chaves ou bases sem licença. Não inclua `node_modules` ou builds no Git. O ZIP de entrega pode incluir o build gerado para facilitar instalação.

A CI está preparada, mas seu resultado remoto só existe depois da publicação e execução no GitHub. Permissões adicionais, bibliotecas novas e APIs externas devem vir com justificativa, impacto de privacidade e atualização da documentação.
