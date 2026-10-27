import crypto from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import * as tar from 'tar';
import {
  APPLICATION_PACKAGE_YARN_LOCK_PATH,
  computeDependencyFileChecksum,
  computePackageJsonChecksum,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

const declareDependencyChecksums = (
  files: Record<string, string>,
): Record<string, string> => {
  const manifestContent = files['manifest.json'];
  const packageJsonContent = files['package.json'];

  if (!isDefined(manifestContent) || !isDefined(packageJsonContent)) {
    return files;
  }

  const manifest = JSON.parse(manifestContent) as {
    application?: Record<string, unknown>;
  };

  if (!isDefined(manifest.application)) {
    return files;
  }

  const yarnLockContent =
    files[APPLICATION_PACKAGE_YARN_LOCK_PATH] ?? files['yarn.lock'];

  return {
    ...files,
    'manifest.json': JSON.stringify({
      ...manifest,
      application: {
        ...manifest.application,
        packageJsonChecksum: computePackageJsonChecksum(packageJsonContent),
        yarnLockChecksum: isDefined(yarnLockContent)
          ? computeDependencyFileChecksum(yarnLockContent)
          : null,
      },
    }),
  };
};

export const createAppTarball = async (
  files: Record<string, string>,
): Promise<Buffer> => {
  const tempId = crypto.randomUUID();
  const sourceDir = join(tmpdir(), `test-app-tarball-src-${tempId}`);
  const tarballPath = join(tmpdir(), `test-app-tarball-${tempId}.tar.gz`);
  const tarballFiles = declareDependencyChecksums(files);

  await fs.mkdir(sourceDir, { recursive: true });

  for (const [name, content] of Object.entries(tarballFiles)) {
    const filePath = join(sourceDir, name);
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));

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
    Object.keys(tarballFiles),
  );

  const buffer = await fs.readFile(tarballPath);

  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.rm(tarballPath, { force: true });

  return buffer;
};
