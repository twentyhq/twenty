// Next's vendored path-to-regexp ships untyped; this is the minimal surface
// the rewrite-pattern tests use (matching exactly what next.config consumes).
declare module 'next/dist/compiled/path-to-regexp' {
  export function pathToRegexp(
    source: string,
    keys?: { name: string | number }[],
  ): RegExp;
}
