// Build tooling entries that must never be pre-bundled for the browser.
const NODE_ONLY_ENTRIES = new Set(['front-component-build', 'vite']);

export const getTwentySharedOptimizeDepsInclude = (
  twentySharedExports: Record<string, unknown>,
): string[] =>
  Object.keys(twentySharedExports)
    .filter((subpath) => subpath !== '.')
    .map((subpath) => subpath.slice(2))
    .filter((entry) => !NODE_ONLY_ENTRIES.has(entry))
    .map((entry) => `twenty-shared/${entry}`);
