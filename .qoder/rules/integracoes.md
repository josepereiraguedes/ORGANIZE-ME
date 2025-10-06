---
trigger: manual
alwaysApply: true
---
rules:
  - "Centralize integrações externas em services/facades para desacoplar lógica."
  - "Implemente retries e backoff exponencial para chamadas instáveis."
  - "Nunca comite chaves ou tokens; forneça instruções para .env."
  - "Faça validação de contratos (contract testing) quando integrar com terceiros."
