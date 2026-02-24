import * as fs from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

import { create } from 'tar';
import { v4 } from 'uuid';
import { type Manifest } from 'twenty-shared/application';

export const buildTestTarball = async ({
  manifest,
  packageJson,
}: {
  manifest: Manifest;
  packageJson: Record<string, unknown>;
}): Promise<Buffer> => {
  const tempDir = join(tmpdir(), `test-tarball-${v4()}`);

  try {
    await fs.mkdir(tempDir, { recursive: true });

    await fs.writeFile(
      join(tempDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
    );

    await fs.writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
    );

    const tarballPath = join(tempDir, 'app.tar.gz');

    await create(
      {
        gzip: true,
        file: tarballPath,
        cwd: tempDir,
      },
      ['manifest.json', 'package.json'],
    );

    return await fs.readFile(tarballPath);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};
