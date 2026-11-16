export const isRestorableFrontComponentSourcePath = (path: string): boolean => {
  const hasTypeScriptExtension = path.endsWith('.ts') || path.endsWith('.tsx');

  if (!hasTypeScriptExtension || path.endsWith('.d.ts')) {
    return false;
  }

  const isAbsolutePath = path.startsWith('/') || /^[a-z]:/i.test(path);

  if (isAbsolutePath || path.includes('\\')) {
    return false;
  }

  const forbiddenSegments = ['..', '.', '', 'node_modules', 'dist', '.twenty'];

  return path
    .split('/')
    .every((segment) => !forbiddenSegments.includes(segment));
};
