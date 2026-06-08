// jest stub for the `server-only` package. `server-only` is a Next.js build
// guard (errors if a server module is pulled into a client bundle); it has no
// behaviour at runtime and no resolution under the jest node environment, so we
// map it to this empty module. The real guard still runs during `next build`.
export {};
