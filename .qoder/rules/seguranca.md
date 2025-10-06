---
trigger: manual
alwaysApply: true
---
rules:
  - "Nunca exponha segredos no código fonte. Use variáveis de ambiente (.env) e .env.example."
  - "Sanitize inputs para proteger contra SQL Injection e XSS."
  - "Implemente autenticação e autorização seguras (JWT, OAuth quando aplicável)."
  - "Configure headers de segurança (Content-Security-Policy, X-Frame-Options, HSTS) e CORS corretamente."
  - "Sugira rate limiting e logging de segurança para endpoints sensíveis."
