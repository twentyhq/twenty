import { execFile, type ExecFileOptions } from 'child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

import { buildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-shared-dependencies.util';
import { installAndBuildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/install-and-build-front-component-shared-dependencies.util';

jest.mock('child_process', () => {
  const { promisify } = jest.requireActual<typeof import('util')>('util');

  return {
    ...jest.requireActual('child_process'),
    execFile: Object.assign(jest.fn(), { [promisify.custom]: jest.fn() }),
  };
});
jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-shared-dependencies.util',
);

const install = jest.mocked<
  (
    executable: string,
    args: string[],
    options: ExecFileOptions,
  ) => Promise<{ stdout: string; stderr: string }>
>(promisify(execFile));
const build = jest.mocked(buildFrontComponentSharedDependencies);
const packageJson = '{"private":true,"devDependencies":{"twenty-ui":"2.50.0"}}';
const yarnLock = '# exact stored lock bytes\n';
const vendor: Awaited<
  ReturnType<typeof buildFrontComponentSharedDependencies>
> = {
  source: 'vendor',
  checksum: 'checksum',
  exportNamesBySpecifier: new Map(),
};

describe('installAndBuildFrontComponentSharedDependencies', () => {
  let yarnEngineDirectory: string;

  beforeEach(async () => {
    jest.useRealTimers();
    install.mockReset().mockResolvedValue({ stdout: '', stderr: '' });
    build.mockReset().mockResolvedValue(vendor);
    yarnEngineDirectory = await mkdtemp(join(tmpdir(), 'vendor-yarn-test-'));
    await mkdir(join(yarnEngineDirectory, '.yarn/releases'), {
      recursive: true,
    });
    await writeFile(
      join(yarnEngineDirectory, '.yarnrc.yml'),
      'enableScripts: false',
    );
    await writeFile(
      join(yarnEngineDirectory, '.yarn/releases/yarn-4.9.2.cjs'),
      'engine',
    );
  });

  afterEach(async () => {
    await rm(yarnEngineDirectory, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('installs the exact stored pair immutably, builds from the isolated directory, then removes it', async () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_OPTIONS: '--require=/runtime/instrumentation.js',
    });
    build.mockImplementationOnce(async ({ resolveDirectory }) => {
      expect(install).toHaveBeenCalledTimes(1);
      expect(
        await readFile(join(resolveDirectory, 'package.json'), 'utf8'),
      ).toBe(packageJson);
      expect(await readFile(join(resolveDirectory, 'yarn.lock'), 'utf8')).toBe(
        yarnLock,
      );
      expect(
        await readFile(
          join(resolveDirectory, '.yarn/releases/yarn-4.9.2.cjs'),
          'utf8',
        ),
      ).toBe('engine');
      return vendor;
    });
    await expect(
      installAndBuildFrontComponentSharedDependencies({
        packageJson,
        yarnLock,
        yarnEngineDirectory,
      }),
    ).resolves.toEqual(vendor);
    const directory = build.mock.calls[0][0].resolveDirectory;
    expect(install).toHaveBeenCalledWith(
      process.execPath,
      [
        join(directory, '.yarn/releases/yarn-4.9.2.cjs'),
        'install',
        '--immutable',
      ],
      expect.objectContaining({
        cwd: directory,
        timeout: 240_000,
        env: expect.objectContaining({
          YARN_ENABLE_SCRIPTS: 'false',
          YARN_ENABLE_GLOBAL_CACHE: 'false',
          YARN_GLOBAL_FOLDER: join(directory, '.yarn/global'),
        }),
      }),
    );
    expect(install.mock.calls[0][2].env).not.toHaveProperty('NODE_OPTIONS');
    await expect(access(directory)).rejects.toThrow();
  });

  it.each(['install', 'build'])(
    'removes the temporary install after %s fails',
    async (stage) => {
      const error = new Error(`${stage} failed`);
      if (stage === 'install') {
        install.mockRejectedValueOnce(error);
      } else {
        build.mockRejectedValueOnce(error);
      }
      await expect(
        installAndBuildFrontComponentSharedDependencies({
          packageJson,
          yarnLock,
          yarnEngineDirectory,
        }),
      ).rejects.toThrow(error);
      const directory = String(install.mock.calls[0][2].cwd);
      await expect(access(directory)).rejects.toThrow();
      if (stage === 'install') {
        expect(build).not.toHaveBeenCalled();
      }
    },
  );
});
