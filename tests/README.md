# Testes do Sistema de Gestão de Estoque

## Visão Geral
Este diretório contém todos os testes automatizados para o Sistema de Gestão de Estoque, garantindo que todas as funcionalidades estejam funcionando corretamente.

## Estrutura de Testes

```
tests/
├── basic-functionality.test.ts     # Testes básicos de funcionalidade
├── crud-operations.test.ts         # Testes das operações CRUD
├── export-functionality.test.ts    # Testes de exportação de relatórios
├── comprehensive-integration-test.ts # Testes abrangentes do sistema
├── run-tests.ts                    # Executor de testes
└── README.md                       # Documentação dos testes
```

## Scripts de Teste

### Testes Unitários e Funcionais
```bash
npm test
```
Verifica as funcionalidades básicas do sistema.

### Testes de Integração Abrangentes
```bash
npm run test:integration
```
Testa todos os aspectos do sistema, incluindo frontend, armazenamento local e funcionalidades.

### Executar Todos os Testes
```bash
npm test
```

## Cobertura de Testes

Os testes cobrem as seguintes áreas:

1. **Frontend**
   - Carregamento das páginas principais
   - Funcionalidades dos componentes
   - Navegação entre rotas
   - Sistema de notificações
   - Tema claro/escuro

2. **Armazenamento Local**
   - Operações CRUD para produtos
   - Operações CRUD para clientes
   - Operações CRUD para transações
   - Validação de dados
   - Tratamento de erros

3. **Funcionalidades Específicas**
   - Dashboard e resumo financeiro
   - Geração de relatórios em PDF
   - Exportação de dados em CSV
   - Atualização automática de estoque
   - Importação e exportação de dados entre dispositivos

## Como Adicionar Novos Testes

1. Crie um novo arquivo de teste no formato `[nome]-test.ts`
2. Implemente os testes usando a mesma estrutura dos arquivos existentes
3. Adicione o script correspondente no `package.json`
4. Atualize este README com a descrição do novo teste

## Manutenção dos Testes

- Execute todos os testes antes de fazer deploy
- Atualize os testes quando adicionar novas funcionalidades
- Verifique se todos os testes passam após refatorações
- Mantenha os relatórios de teste atualizados