import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Vite re-optimizes only when its config hash changes: putting this hash in the
// optimizer config makes the pre-bundled twenty-shared follow the build it came from
export const getTwentySharedBuildHash = (
  twentySharedDistPath: string,
): string => {
  const hash = createHash('sha256');

  if (existsSync(twentySharedDistPath)) {
    readdirSync(twentySharedDistPath, { recursive: true, encoding: 'utf8' })
      .filter((filePath) => filePath.endsWith('.mjs'))
      .sort()
      .forEach((filePath) => {
        hash.update(filePath);
        hash.update(readFileSync(path.join(twentySharedDistPath, filePath)));
      });
  }

  return hash.digest('hex').slice(0, 16);
};
