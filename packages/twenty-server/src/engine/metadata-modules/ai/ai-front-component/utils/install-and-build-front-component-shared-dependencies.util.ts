import { mkdtemp, rm, writeFile } from 'fs/promises';
import { z } from 'zod';
import { tmpdir } from 'os';
import { join } from 'path';
import { installYarnDependencies } from 'src/engine/core-modules/application/application-package/constants/yarn-engine/install-yarn-dependencies.cjs';

import { buildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-shared-dependencies.util';

const INSTALL_TIMEOUT_MS = 240_000;

export const installAndBuildFrontComponentSharedDependencies = async ({
  packageJson,
  yarnLock,
  yarnEngineDirectory,
}: {
  packageJson: string;
  yarnLock: string;
  yarnEngineDirectory: string;
}) => {
  const directory = await mkdtemp(join(tmpdir(), 'front-component-vendor-'));

  try {
    await Promise.all([
      writeFile(join(directory, 'package.json'), packageJson),
      writeFile(join(directory, 'yarn.lock'), yarnLock),
    ]);
    await installYarnDependencies({
      directory,
      yarnEngineDirectory,
      args: ['install', '--immutable'],
      env: {
        YARN_ENABLE_SCRIPTS: 'false',
        YARN_ENABLE_GLOBAL_CACHE: 'false',
        YARN_GLOBAL_FOLDER: join(directory, '.yarn/global'),
      },
      timeout: INSTALL_TIMEOUT_MS,
    });

    return await buildFrontComponentSharedDependencies({
      resolveDirectory: directory,
      dependencies: z
        .object({
          frontComponentSharedDependencies: z.array(z.string()).optional(),
        })
        .parse(JSON.parse(packageJson)).frontComponentSharedDependencies,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};
