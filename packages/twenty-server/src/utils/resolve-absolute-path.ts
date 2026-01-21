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

  // Use path.resolve for proper path handling and normalization
  const resolved = path.resolve(process.cwd(), filePath);

  // Security: Ensure resolved path is within cwd to prevent path traversal
  const cwd = path.resolve(process.cwd());

  if (!resolved.startsWith(cwd)) {
    throw new Error(
      `Path traversal detected: ${filePath} resolves outside working directory`,
    );
  }

  return resolved;
};
