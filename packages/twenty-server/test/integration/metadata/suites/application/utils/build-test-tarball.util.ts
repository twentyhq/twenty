import * as fs from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

import { create } from 'tar';
import { v4 } from 'uuid';
import { type Manifest } from 'twenty-shared/application';

export const buildTestTarball = async ({
  manifest,
  rawManifestContent,
  packageJson,
}: {
  manifest?: Manifest;
  rawManifestContent?: string;
  packageJson: Record<string, unknown>;
}): Promise<Buffer> => {
  const tempDir = join(tmpdir(), `test-tarball-${v4()}`);

  try {
    await fs.mkdir(tempDir, { recursive: true });

    const fileNames: string[] = [];

    const manifestContent = rawManifestContent
      ?? (manifest ? JSON.stringify(manifest, null, 2) : undefined);

    if (manifestContent) {
      await fs.writeFile(join(tempDir, 'manifest.json'), manifestContent);
      fileNames.push('manifest.json');
    }

    await fs.writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
    );
    fileNames.push('package.json');

    const tarballPath = join(tempDir, 'app.tar.gz');

    await create(
      {
        gzip: true,
        file: tarballPath,
        cwd: tempDir,
      },
      fileNames,
    );

    return await fs.readFile(tarballPath);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};
