/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ─── Cross-context internal imports ──────────────────────────────────────
    {
      name: 'no-cross-context-internal-imports',
      severity: 'error',
      comment:
        'Contexts communicate only via their public index.ts. ' +
        'Import from contexts/B/index.ts, never from contexts/B/features/...',
      from: { path: '^src/contexts/([^/]+)/.+' },
      to: {
        path: '^src/contexts/(?!\\1/)([^/]+)/.+',
        pathNot: ['^src/contexts/[^/]+/index\\.ts$', '^src/shared/'],
      },
    },

    // ─── shared/ must not depend on contexts/ ────────────────────────────────
    {
      name: 'no-shared-importing-contexts',
      severity: 'error',
      comment: 'Shared Kernel must not depend on any Bounded Context.',
      from: { path: '^src/shared/' },
      to: { path: '^src/contexts/' },
    },

    // ─── app/ must not bypass context public API ──────────────────────────────
    {
      name: 'no-app-bypassing-context-api',
      severity: 'error',
      comment:
        'app/ must import from contexts/{name}/index.ts only, ' +
        'never from contexts/{name}/features/...',
      from: { path: '^src/app/' },
      to: { path: '^src/contexts/[^/]+/features/' },
    },

    // ─── contexts/ must not import from app/ ─────────────────────────────────
    {
      name: 'no-contexts-importing-app',
      severity: 'error',
      comment: 'contexts/ must never depend on app/ — inverted dependency.',
      from: { path: '^src/contexts/' },
      to: { path: '^src/app/' },
    },

    // ─── service.ts / use-cases.ts must stay framework-free ──────────────────
    {
      name: 'no-domain-importing-framework',
      severity: 'error',
      comment:
        'service.ts and use-cases.ts must not import React, Next.js, or shared/next. ' +
        'These files must be testable with plain Jest.',
      from: { path: '(service|use-cases)\\.ts$' },
      to: {
        path: '^(react$|react/|next$|next/|src/shared/next)',
      },
    },
  ],

  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    moduleSystems: ['es6', 'cjs'],
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      archi: {
        collapsePattern:
          '^(node_modules|src/shared|src/contexts/[^/]+|src/app)',
      },
    },
  },
};
