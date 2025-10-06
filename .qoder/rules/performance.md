---
trigger: manual
alwaysApply: true
---
rules:
  - "Use React.memo para componentes que renderizam frequentemente."
  - "Utilize useCallback para funções passadas como props e useMemo para cálculos pesados."
  - "Sugira virtualização (react-window/react-virtualized) para listas grandes."
  - "Implemente lazy loading de imagens e code splitting para rotas/módulos grandes."
  - "Verifique tamanhos de bundles e recomende split por feature quando necessário."
