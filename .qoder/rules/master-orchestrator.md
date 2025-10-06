---
trigger: manual
alwaysApply: true
---
workflow:
  name: "Full Agent Orchestrator"
  description: "Executa os agentes em sequência para revisão, criação e continuação de projetos."
  sequence:
    - arquitetura.yml
    - clean-code.yml
    - refatoracao.yml
    - performance.yml
    - seguranca.yml
    - database.yml
    - api.yml
    - frontend.yml
    - backend.yml
    - ui-ux.yml
    - acessibilidade.yml
    - testes.yml
    - integracoes.yml
    - qualidade.yml
    - devops.yml
    - documentacao.yml