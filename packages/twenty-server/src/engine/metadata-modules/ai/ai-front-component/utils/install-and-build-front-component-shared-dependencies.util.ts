import { execFile } from 'child_process';
import { cp, mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

import { buildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-shared-dependencies.util';

const execFilePromise = promisify(execFile);
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
    await cp(yarnEngineDirectory, directory, { recursive: true });
    await Promise.all([
      writeFile(join(directory, 'package.json'), packageJson),
      writeFile(join(directory, 'yarn.lock'), yarnLock),
    ]);
    const { NODE_OPTIONS: _nodeOptions, ...environment } = process.env;

    await execFilePromise(
      process.execPath,
      [
        join(directory, '.yarn/releases/yarn-4.9.2.cjs'),
        'install',
        '--immutable',
      ],
      {
        cwd: directory,
        env: {
          ...environment,
          YARN_ENABLE_SCRIPTS: 'false',
          YARN_ENABLE_GLOBAL_CACHE: 'false',
          YARN_GLOBAL_FOLDER: join(directory, '.yarn/global'),
        },
        timeout: INSTALL_TIMEOUT_MS,
      },
    );

    return await buildFrontComponentSharedDependencies({
      resolveDirectory: directory,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};
