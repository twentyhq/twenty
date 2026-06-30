import crypto from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

import * as tar from 'tar';

export const createTestTarball = async (
  files: Record<string, string>,
): Promise<Buffer> => {
  const tempId = crypto.randomUUID();
  const sourceDir = join(tmpdir(), `test-tarball-src-${tempId}`);
  const tarballPath = join(tmpdir(), `test-tarball-${tempId}.tar.gz`);

  await fs.mkdir(sourceDir, { recursive: true });

  for (const [name, content] of Object.entries(files)) {
    const filePath = join(sourceDir, name);
    const dir = dirname(filePath);

    if (dir !== sourceDir) {
      await fs.mkdir(dir, { recursive: true });
    }
    await fs.writeFile(filePath, content);
  }

  await tar.create(
    {
      file: tarballPath,
      gzip: true,
      cwd: sourceDir,
    },
    Object.keys(files),
  );

  const buffer = await fs.readFile(tarballPath);

  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(tarballPath, { force: true });

  return buffer;
};
