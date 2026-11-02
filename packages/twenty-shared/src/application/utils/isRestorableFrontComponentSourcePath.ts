export const isRestorableFrontComponentSourcePath = (path: string): boolean =>
  /\.tsx?$/.test(path) &&
  !path.endsWith('.d.ts') &&
  !path.includes('\\') &&
  !path.startsWith('/') &&
  !path
    .split('/')
    .some((part) =>
      ['..', '.', '', 'node_modules', 'dist', '.twenty'].includes(part),
    );
