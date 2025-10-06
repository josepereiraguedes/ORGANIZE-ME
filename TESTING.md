# Testing Guide

This project uses Vitest as the test runner with Testing Library for React component testing.

## Test Structure

Tests are colocated with the files they test, following the pattern:
- `src/components/Button.tsx` → `src/components/Button.test.tsx`
- `src/services/authService.ts` → `src/services/authService.test.ts`

## Running Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui
```

## Test Types

### Unit Tests
Test individual functions and services in isolation.

### Integration Tests
Test how multiple units work together.

### Component Tests
Test React components using Testing Library.

## Test Coverage

The project aims for:
- 80%+ coverage for critical business logic
- 100% coverage for utility functions
- Component tests for all user interactions

## Mocking

Use Vitest's built-in mocking capabilities:
- `vi.mock()` for module mocks
- `vi.fn()` for function mocks
- `vi.spyOn()` for spying on real functions

## Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Arrange-Act-Assert pattern**
4. **Mock external dependencies**
5. **Test edge cases**
6. **Keep tests isolated**