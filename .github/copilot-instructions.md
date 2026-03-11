# Copilot Instructions — New Architecture

These instructions govern **all code generation** in this workspace. Apply them strictly on every file you create or modify. When in doubt, reference `architecture.md` at the workspace root.

---

## 1. Mandatory Folder Structure

Every Next.js project MUST use this layout:

```
src/
  app/        ← Next.js App Router — routing, metadata, error/loading boundaries ONLY
  contexts/   ← Business domain: Bounded Contexts + Vertical Slices
  shared/     ← Shared Kernel: cross-cutting utilities with NO business logic
```

**Dependency direction is strictly unidirectional:**

```
app/  →  contexts/{name}/index.ts  →  shared/
```

Inner layers **never** import from outer layers.

---

## 2. Bounded Contexts

- Each subdirectory of `src/contexts/` is a Bounded Context (e.g. `cart/`, `catalog/`, `checkout/`, `orders/`, `identity/`).
- Boundaries are **semantic, not technical** — group by business sub-domain.
- A context exposes **one public API**: its root `index.ts`. Nothing outside imports deeper than that.
- Features within the same context communicate freely with each other.
- Cross-context communication goes **only** through `contexts/{name}/index.ts`.

```
src/contexts/
  cart/
    features/
      cart-items/
        index.ts   ← feature public API (internal to the context)
      coupon/
        index.ts
    index.ts       ← context public API (only entry point for outside code)
```

---

## 3. Vertical Slices

Group code by **business responsibility**, never by technical type.

### ❌ Anti-pattern — technical grouping

```
src/
  components/  ← mixes CartItem, ProductCard, CheckoutForm
  services/    ← mixes CartService, ProductService
  hooks/       ← mixes useCart, useProducts, useCheckout
```

### ✅ Pattern — Vertical Slice

```
contexts/cart/features/cart-items/
  model.ts           ← domain types + Zod schemas (source of truth)
  dto.ts             ← backend DTOs — never leak past mapper.ts
  mapper.ts          ← DTO ↔ domain conversion
  service.ts         ← pure domain logic, ZERO framework imports
  use-cases.ts       ← orchestration (only when api.ts grows complex)
  api.ts             ← Server Actions ('use server') + Route Handler calls
  components/
    CartItemsPage.tsx    ← Server Component: data fetch + session check
    CartItemsShell.tsx   ← 'use client': interactive state, grids, events
  hooks/               ← useCartItems, useCartActions
  store.ts             ← Jotai atoms (only if cross-component global state needed)
  index.ts             ← public exports of this feature
```

### Incremental Growth Rule

Start with **only what the current complexity demands**. Never add files speculatively.

| Complexity                          | Files present                                      |
| ----------------------------------- | -------------------------------------------------- |
| Pure CRUD                           | `model.ts` + `api.ts` + `components/` + `index.ts` |
| Unstable backend contract           | + `dto.ts` + `mapper.ts`                           |
| Domain logic present                | + `service.ts`                                     |
| Complex orchestration in `api.ts`   | + `use-cases.ts`                                   |
| Cross-component global state        | + `store.ts`                                       |
| Unstable / swappable infrastructure | + `ports.ts`                                       |

---

## 4. Internal Layer Rules (CSA)

### 4.1 `model.ts` — Types and Schemas

- Define domain types as **Zod schema inferences only**.
- This file is the single source of truth for validation and typing.
- No business logic. No framework imports.

```ts
import { z } from "zod";

export const CouponSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  active: z.boolean(),
  minOrderValue: z.number().positive().optional(),
});
export type Coupon = z.infer<typeof CouponSchema>;
```

### 4.2 `service.ts` — Pure Domain Logic

- **ZERO imports** from: `react`, `next`, `next/*`, `@/shared/next`, browser APIs.
- No `useState`, `useRouter`, `headers()`, `cookies()`, `getServerSession()`.
- Pure functions only — testable with Jest with no providers, no mocks of any framework.
- Throws `DomainError` (from `@/shared/errors`) for business rule violations.

```ts
// ✅ Correct
import { DomainError } from "@/shared/errors";
import type { Coupon, CartSummary } from "./model";

export function applyCoupon(cart: CartSummary, coupon: Coupon): CartSummary {
  if (!coupon.active)
    throw new DomainError("COUPON_INACTIVE", "Expired coupon.");
  const discount =
    coupon.type === "PERCENT"
      ? cart.subtotal * (coupon.value / 100)
      : coupon.value;
  return { ...cart, discount, total: cart.subtotal - discount };
}
```

```ts
// ❌ Wrong — framework imports inside service.ts
import { headers } from "next/headers";
import { useState } from "react";
```

### 4.3 `api.ts` — Server Actions

- Add `'use server'` at the top.
- Validate **all** inputs with Zod before processing.
- Check session/auth before business logic.
- Return `ActionResult<T>` (from `@/shared/types/action-result`).
- Delegate to `service.ts` or `use-cases.ts` — never implement business logic here.
- Never call another Server Action or Route Handler.

```ts
"use server";
import { CouponSchema } from "./model";
import { applyCouponUseCase } from "./use-cases";
import type { ActionResult } from "@/shared/types/action-result";
import type { CartSummary } from "./model";

export async function applyCouponAction(
  rawCode: unknown,
  cartId: string,
): Promise<ActionResult<CartSummary>> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "UNAUTHORIZED" };

  const parsed = CouponSchema.shape.code.safeParse(rawCode);
  if (!parsed.success)
    return { ok: false, error: "INVALID_INPUT", issues: parsed.error.issues };

  try {
    const result = await applyCouponUseCase(parsed.data, cartId);
    revalidatePath("/cart");
    return { ok: true, data: result };
  } catch (err) {
    if (err instanceof DomainError) return { ok: false, error: err.code };
    return { ok: false, error: "UNEXPECTED_ERROR" };
  }
}
```

### 4.4 `use-cases.ts` — Orchestration (optional)

- Pure: coordinates `service.ts` + `mapper.ts` + HTTP calls.
- No session, no `revalidatePath`, no `headers()`, no `cookies()`.
- Reusable by both Server Actions and Route Handlers without duplication.
- Add this file **only** when `api.ts` becomes complex with orchestration logic.

### 4.5 `components/` — Page & Shell Convention

**`{Feature}Page.tsx`** — Server Component (RSC):

- Fetch data (via Server Component or `await` calls).
- Validate session — redirect if unauthorized.
- Pass initial data to the Shell.
- No business logic. No client-side state.

**`{Feature}Shell.tsx`** — Client Component:

- Must have `'use client'` at the top.
- Interactive state, events, charts, data grids.
- Uses hooks for behavior.
- Composes Presentation Components.

```tsx
// ✅ Correct split
// CartItemsPage.tsx (Server Component)
export default async function CartItemsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const items = await fetchCartItems(session.user.cartId);
  return <CartItemsShell initialItems={items} />;
}

// CartItemsShell.tsx ('use client')
("use client");
export function CartItemsShell({ initialItems }: Props) {
  const { items, removeItem } = useCartItems(initialItems);
  return <CartItemsGrid items={items} onRemove={removeItem} />;
}
```

### 4.6 Presentation Components

- Pure: props in, callbacks out.
- Zero business logic. Zero fetch. Zero global state.
- Must be renderable in Storybook with mocked data and no external dependencies.

### 4.7 `hooks/` — UI Logic Only

- Encapsulate UI behavior: filtering, sorting, local interaction state, data transformation for display.
- **Do NOT** execute business logic inside hooks.
- **Do NOT** call `fetch` directly — use React Query for server state.

### 4.8 `dto.ts` + `mapper.ts`

- `dto.ts` mirrors the exact backend API shape (snake_case, legacy naming, etc.).
- `mapper.ts` converts DTO ↔ domain type.
- DTOs **never leak** beyond `mapper.ts`.
- When backend contract changes, only `dto.ts` and `mapper.ts` need updates.

---

## 5. Import Rules (Enforced by CI)

These are **build errors** enforced by Dependency Cruiser. Violations fail CI.

| From                           | To                               |  Allowed?  |
| ------------------------------ | -------------------------------- | :--------: |
| `contexts/A/features/x`        | `contexts/A/features/y`          |  ✅ Free   |
| `contexts/A`                   | `contexts/B/index.ts`            |     ✅     |
| `contexts/A`                   | `contexts/B/features/...`        | ❌ BLOCKED |
| `app/`                         | `contexts/{name}/index.ts`       |     ✅     |
| `app/`                         | `contexts/{name}/features/...`   | ❌ BLOCKED |
| anything                       | `shared/`                        |  ✅ Free   |
| `shared/`                      | `contexts/`                      | ❌ BLOCKED |
| `contexts/`                    | `app/`                           | ❌ BLOCKED |
| `service.ts` or `use-cases.ts` | `react`, `next/*`, `shared/next` | ❌ BLOCKED |

**Always use path aliases** (`@/contexts/...`, `@/shared/...`) for cross-feature imports.

---

## 6. State Management

| State type            | Solution                                | Location                  |
| --------------------- | --------------------------------------- | ------------------------- |
| Server state          | React Query (`useQuery`, `useMutation`) | `hooks/` of the feature   |
| Global UI state       | Jotai atoms                             | `store.ts` of the feature |
| Local component state | `useState` / `useReducer`               | Inside the component      |

**Rules:**

- React Query keys **must** be prefixed by context name: `['cart', cartId]`, not just `[cartId]`.
- Jotai atoms belong to the feature that defines them — always export via `index.ts`.
- ❌ Never use React Query for pure UI state (`isDrawerOpen`, `activeTab`) — use `useState`.
- ❌ Never mirror server data in a Jotai atom — React Query is the single source of truth for server state.

```ts
// ✅ React Query with context-prefixed key
export function useCart(cartId: string) {
  return useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => fetchCart(cartId),
    staleTime: 30_000,
  });
}

// ✅ Jotai atom for UI-only global state
export const cartDrawerOpenAtom = atom(false);
```

---

## 7. Error Handling

Use the hierarchy from `@/shared/errors`:

```ts
// Throw in service.ts
throw new DomainError("COUPON_INACTIVE", "Expired or disabled coupon.");

// Catch in api.ts — return ActionResult<T>, never expose stack trace
if (err instanceof DomainError) return { ok: false, error: err.code };
return { ok: false, error: "UNEXPECTED_ERROR" };
```

Error propagation:

1. `service.ts` throws `DomainError` (business rule violated)
2. `api.ts` catches it → returns `ActionResult<T>`
3. Hooks receive `ActionResult<T>` via `useMutation`
4. UI displays user-friendly message (toast/inline) — **never raw error codes**

---

## 8. Shared Kernel (`shared/`)

```
shared/
  api/      ← http client, error handlers, interceptors
  errors/   ← AppError, DomainError, ValidationError, UnauthorizedError
  hooks/    ← usePermissions, usePagination, useDebounce
  types/    ← UserRole, Pagination, ApiResponse, Money, ActionResult
  utils/    ← formatCurrency, formatDate, cn()
  lib/      ← analytics, logger, observability
  ui/       ← Button, Card, Modal, Badge, Input, Spinner (generic primitives ONLY)
  next/     ← authOptions, RSC helpers — framework-specific
```

**Promotion criteria:** used by **3+ features in different contexts** AND carries **no domain semantics**.

| Component                            | Where              | Why                        |
| ------------------------------------ | ------------------ | -------------------------- |
| `<Button>`, `<Modal>`, `<Badge>`     | `shared/ui/`       | Generic, no domain context |
| `<CartBadge count={3}>`              | `contexts/cart/`   | Has cart semantics         |
| `<OrderStatusChip status="shipped">` | `contexts/orders/` | Has order semantics        |

- ❌ `service.ts` and `use-cases.ts` never import from `shared/next/`
- ❌ Domain-named components (`CartBadge`, `OrderStatusChip`) never go in `shared/ui/`

---

## 9. Hexagonal Architecture — Selective

Add `ports.ts` **only** when at least one is true:

- Infrastructure can change (REST → gRPC, Lambda → Step Functions)
- Multiple simultaneous implementations needed
- Maximum domain isolation required for testability

Otherwise, skip ports entirely — do not add complexity preemptively.

---

## 10. `index.ts` Exports (MANDATORY)

Every feature and every context **must** have an `index.ts` that exports its public API.

```ts
// contexts/cart/features/coupon/index.ts
export type { Coupon, CartSummary } from "./model";
export { applyCouponAction } from "./api";
export { CouponForm } from "./components/CouponForm";

// contexts/cart/index.ts
export type { Coupon, CartSummary } from "./features/coupon";
export { applyCouponAction } from "./features/coupon";
export { CartItemsPage } from "./features/cart-items";
```

---

## 11. Testing

| Layer                     | Type        | Tools                          | Coverage                              |
| ------------------------- | ----------- | ------------------------------ | ------------------------------------- |
| `service.ts`              | Unit (pure) | Jest                           | **High** — all business logic         |
| `model.ts` (Zod)          | Unit (pure) | Jest                           | Medium — edge cases                   |
| `api.ts` (Server Actions) | Integration | Jest + mocked httpClient       | Medium — happy path + expected errors |
| `hooks/`                  | Component   | Testing Library + `renderHook` | Medium — visible behavior             |
| Presentation Components   | Visual      | Storybook                      | Low — mocked data                     |
| Pages/Shells              | E2E smoke   | Playwright                     | Low — critical flows only             |

- `service.ts` tests work with **zero** framework imports or mocks.
- Server Actions are tested with mocked `httpClient` — **never** hit real APIs.
- Test hook **behavior** visible to components, not internal implementation.

### TDD Workflow (mandatory for new features)

1. Write `service.test.ts` and `model.test.ts` **before** implementing.
2. Verify tests fail (RED) with `pnpm test`.
3. Implement until tests pass (GREEN).
4. Refactor with tests green.

### 3A Pattern (Arrange-Act-Assert)

Every `it()` block must follow 3A. Mark each section with a comment:

```ts
it('removes played card from hand', () => {
  // Arrange
  const state = makeState();
  const cardId = 'h1';

  // Act
  const newState = playCard(state, cardId);

  // Assert
  expect(newState.hands.human.find(c => c.id === cardId)).toBeUndefined();
});
```

- **One concept per test** — split multi-concept scenarios into separate `it()` blocks.
- Co-locate tests: `service.test.ts` sits next to `service.ts`.
- Jest config: `jest.config.ts` at root — supports `@/` alias via `moduleNameMapper`.

---

## 12. Quick Diagnostic

| Symptom                                        | Diagnosis              | Fix                                        |
| ---------------------------------------------- | ---------------------- | ------------------------------------------ |
| `service.ts` imports `react` or `next/*`       | Wrong layer            | Move to `hooks/` or `api.ts`               |
| Page component has business logic              | Shell leaking          | Extract to `service.ts`                    |
| `shared/ui/CartBadge.tsx`                      | Shared Kernel inflated | Move to `contexts/cart/`                   |
| Jotai atom mirrors server data                 | Two sources of truth   | Delete atom, use React Query               |
| `contexts/A` imports `contexts/B/features/...` | Cross-context internal | Import only from `contexts/B/index.ts`     |
| Two contexts are excessively chatty            | Wrong boundaries       | Consider merging or extracting sub-slice   |
| `api.ts` has orchestration logic               | Action doing too much  | Extract to `use-cases.ts`                  |
| Atom imported cross-context without `index.ts` | Unclear ownership      | Expose via `index.ts` or move to `shared/` |

---

## 13. `app/` Layer

`app/` (Next.js App Router) may contain:

- Route segments (`page.tsx`, `layout.tsx`)
- Metadata exports
- `error.tsx`, `loading.tsx` boundaries
- `revalidatePath` / `revalidateTag` calls
- Composition of multiple contexts on a single screen

`app/` must **never** contain:

- Business rules or domain logic
- Logic duplicated from any `service.ts`
- Direct imports from `contexts/{name}/features/...` (only from `contexts/{name}/index.ts`)

---

_For the complete rationale and examples, see [architecture.md](../architecture.md) at the workspace root._
