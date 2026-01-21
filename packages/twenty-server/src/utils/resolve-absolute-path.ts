import path from 'path';

export const resolveAbsolutePath = (filePath: string): string => {
  if (typeof filePath !== 'string') {
    throw new Error(
      `Invalid path type: expected string, got ${typeof filePath}`,
    );
  }

  if (!filePath.trim()) {
    throw new Error('Path cannot be empty');
  }

  // If path is already absolute, normalize and return it
  // This allows user-configured absolute paths (e.g., /var/lib/storage)
  if (path.isAbsolute(filePath)) {
    return path.normalize(filePath);
  }

  // For relative paths, resolve against cwd and check for path traversal
  const cwd = path.resolve(process.cwd());
  const resolved = path.resolve(cwd, filePath);

  // Security: Ensure relative paths don't escape cwd using .. traversal
  // Use path.relative() instead of startsWith() to prevent prefix matching issues
  // (e.g., /app2 would incorrectly pass for cwd /app)
  const relative = path.relative(cwd, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(
      `Path traversal detected: ${filePath} resolves outside working directory`,
    );
  }

  return resolved;
};
