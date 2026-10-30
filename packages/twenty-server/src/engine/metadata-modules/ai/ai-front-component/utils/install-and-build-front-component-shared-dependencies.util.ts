import { mkdtemp, rm, writeFile } from 'fs/promises';
import { z } from 'zod';
import { parseFrontComponentSharedDependencies } from 'twenty-shared/front-component-build';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { tmpdir } from 'os';
import { join } from 'path';
import { installYarnDependencies } from 'src/engine/core-modules/application/application-package/constants/yarn-engine/install-yarn-dependencies.cjs';

import { FRONT_COMPONENT_REQUIRED_SHARED_DEPENDENCIES } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-required-shared-dependencies.constant';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';
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
  const { frontComponentSharedDependencies } = z
    .object({ frontComponentSharedDependencies: z.unknown().optional() })
    .parse(JSON.parse(packageJson));
  const { dependencies, errors } = parseFrontComponentSharedDependencies(
    frontComponentSharedDependencies,
  );

  if (isNonEmptyArray(errors)) {
    throw new FrontComponentBuildException({
      message: errors.join('\n'),
      code: 'INVALID_INPUT',
    });
  }

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
      dependencies: [
        ...FRONT_COMPONENT_REQUIRED_SHARED_DEPENDENCIES,
        ...(dependencies ?? []),
      ],
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};
