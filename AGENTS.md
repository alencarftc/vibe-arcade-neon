# Agent Instructions — New Architecture

> This file is read by autonomous AI coding agents (Claude Code, OpenAI Codex, Gemini CLI, etc.).
> For GitHub Copilot instructions, see `.github/copilot-instructions.md`.
> For complete architecture rationale, see `architecture.md`.

---

## Prime Directive

This workspace uses a strict **Bounded Context + Vertical Slice** architecture. Every file you create or modify must comply with the rules below. Architecture violations are **CI build errors**, not warnings.

---

## Mandatory Structure

```
src/
  app/        ← Next.js App Router ONLY (routing, metadata, error/loading boundaries)
  contexts/   ← All business logic, grouped by domain
  shared/     ← Cross-cutting utilities with zero business logic
```

Dependency flow: `app/` → `contexts/{name}/index.ts` → `shared/`. Never reverse.

---

## Pre-Flight Checklist

Before generating or modifying any file, verify:

- [ ] Does this file live in the correct layer (`app/`, `contexts/`, or `shared/`)?
- [ ] If in `contexts/`, is it inside a properly named Bounded Context folder?
- [ ] If creating a feature, have I created/updated `index.ts` at the feature AND context level?
- [ ] Am I importing across context boundaries only via `contexts/{name}/index.ts`?
- [ ] Is `service.ts` free of all React, Next.js, and browser API imports?
- [ ] Does `api.ts` have `'use server'`, validate inputs with Zod, check auth, and return `ActionResult<T>`?
- [ ] Are all Server State managed by React Query, not Jotai atoms?
- [ ] Are React Query keys prefixed by context name?

---

## Bounded Contexts

```
src/contexts/
  {context-name}/
    features/
      {feature-name}/
        index.ts   ← feature public API (accessible within context only)
    index.ts       ← context public API (only entry point for outside code)
```

- Features in the **same context** communicate freely.
- Cross-context communication: **only via** `contexts/{name}/index.ts`.
- `app/`: **only imports from** `contexts/{name}/index.ts`.

---

## Feature File Anatomy

### Minimum viable (CRUD):
```
{feature}/
  model.ts       ← Zod schemas + inferred types
  api.ts         ← 'use server' Server Actions
  components/
    {Feature}Page.tsx    ← RSC: fetch + session check
    {Feature}Shell.tsx   ← 'use client': state + events
  index.ts       ← public exports
```

### Add files only when justified:
| File | Add when |
|---|---|
| `dto.ts` + `mapper.ts` | Backend contract differs from domain shape |
| `service.ts` | Business logic exists beyond simple CRUD |
| `use-cases.ts` | `api.ts` orchestration grows complex |
| `store.ts` | Cross-component global UI state is needed |
| `ports.ts` | Infrastructure is unstable or swappable |

---

## Hard Rules — Never Violate

### 1. Import boundaries
```
❌ contexts/A → contexts/B/features/...   (use contexts/B/index.ts)
❌ app/       → contexts/name/features/... (use contexts/name/index.ts)
❌ shared/    → contexts/                  (inverted dependency)
❌ contexts/  → app/                       (inverted dependency)
❌ service.ts → react, next/*, shared/next (framework in domain)
```

### 2. service.ts purity
`service.ts` must be **pure TypeScript with zero framework dependencies**. It must be testable with plain Jest — no providers, no mocks of React or Next.js.

```ts
// ✅ Allowed in service.ts
import { DomainError } from '@/shared/errors';
import type { Thing } from './model';

// ❌ Never in service.ts
import { headers } from 'next/headers';
import { useState } from 'react';
import { cache } from 'react';
```

### 3. api.ts contract
Every Server Action must:
1. Start with `'use server'`
2. Validate input with Zod (`safeParse`)
3. Check session before business logic
4. Return `ActionResult<T>` from `@/shared/types/action-result`
5. Catch `DomainError` and return `{ ok: false, error: err.code }`
6. Never expose stack traces

### 4. Component split
- `{Feature}Page.tsx` = RSC only. No `'use client'`. No interactive state. No business logic.
- `{Feature}Shell.tsx` = `'use client'` only. No data fetching. No session logic.

### 5. State ownership
- Server state → React Query (`useQuery`/`useMutation`) in `hooks/`
- Global UI state → Jotai atoms in `store.ts`
- Local state → `useState` inside the component
- ❌ Never mirror server data in Jotai atoms
- ❌ Never use React Query for pure UI state (`isDrawerOpen`, `activeTab`)

### 6. index.ts is mandatory
- Every feature folder MUST export its public API via `index.ts`
- Every context folder MUST export its public API via `index.ts`
- Never import from a feature's internal files from outside that context

---

## Error Handling Pattern

```ts
// shared/errors — use these everywhere
DomainError      ← business rule violated (throw in service.ts)
ValidationError  ← invalid input
UnauthorizedError ← missing/invalid session

// shared/types/action-result
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; issues?: ZodIssue[] }
```

Flow: `service.ts` throws → `api.ts` catches → returns `ActionResult<T>` → hook via `useMutation` → UI shows message.

---

## Shared Kernel Rules

`shared/` only contains code used by **3+ features across different contexts** with **no domain semantics**.

```
shared/
  api/     errors/   hooks/   types/   utils/   lib/   ui/   next/
```

- `shared/ui/` = generic primitives only (`Button`, `Modal`, `Badge`, `Input`)
- Domain-named components (`CartBadge`, `OrderStatusChip`) → belong in their context
- `service.ts` / `use-cases.ts` → never import from `shared/next/`

---

## Testing Expectations

| Layer | Tool | Minimum |
|---|---|---|
| `service.ts` | Jest (pure) | High — all business rules |
| `model.ts` | Jest (pure) | Medium — validation edge cases |
| `api.ts` | Jest + mocks | Medium — happy path + auth errors |
| `hooks/` | Testing Library | Medium — visible behavior |
| Components | Storybook | Low — mocked props |
| Pages/Shells | Playwright | Low — critical flows |

### TDD Workflow (mandatory for new features)

1. Write tests **before** the implementation (`service.test.ts`, `model.test.ts`).
2. Run `pnpm test` — all new tests must fail first (RED).
3. Write the minimum implementation to make tests pass (GREEN).
4. Refactor if needed, keeping tests green.

### 3A Pattern (Arrange-Act-Assert)

Every test must follow the 3A structure. Each section must be clearly identifiable:

```ts
it('applies a skip card in 2-player mode keeping the same player turn', () => {
  // Arrange
  const state = makeState({ /* setup */ });

  // Act
  const newState = applySkip(state);

  // Assert
  expect(newState.currentPlayer).toBe('human');
});
```

Rules:
- **Arrange**: set up all objects, data, and context needed for the test.
- **Act**: call exactly ONE function / method under test.
- **Assert**: check the observable outcome. One logical assertion per test (multiple `expect` calls are fine as long as they verify a single concept).
- No business logic in tests. Tests must read like specifications.
- Co-locate test files: `service.test.ts` sits next to `service.ts`.

### Jest Configuration

- Config: `jest.config.ts` at workspace root.
- Path alias `@/` is supported via `moduleNameMapper`.
- `ts-jest` is used with `moduleResolution: node` override (Turbopack uses `bundler`, Jest needs `node`).
- Run all tests: `pnpm test`.
- Run with coverage: `pnpm test --coverage`.

---

## Common Mistakes to Avoid

| If you are tempted to... | Do this instead |
|---|---|
| Add business logic to a hook | Extract to `service.ts` |
| Import `contexts/B/features/...` from context A | Import from `contexts/B/index.ts` |
| Add `CartBadge` to `shared/ui/` | Put it in `contexts/cart/` |
| Store server data in a Jotai atom | Use React Query |
| Write orchestration logic in `api.ts` | Extract to `use-cases.ts` |
| Import `next/headers` in `service.ts` | Move to `api.ts` or `use-cases.ts` |
| Skip creating `index.ts` | Always create it — it is mandatory |

---

*See `templates/` for ready-to-use feature and context scaffolds.*
