export const isRestorableFrontComponentSourcePath = (path: string): boolean =>
  /\.tsx?$/.test(path) &&
  !path.endsWith('.d.ts') &&
  !path.includes('\\') &&
  !path.startsWith('/') &&
  !/^[a-z]:/i.test(path) &&
  !path
    .split('/')
    .some((part) =>
      ['..', '.', '', 'node_modules', 'dist', '.twenty'].includes(part),
    );
