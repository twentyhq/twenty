import { build } from 'esbuild';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { PageLayoutType } from 'twenty-shared/types';

import { handler } from 'src/engine/metadata-modules/ai/ai-front-component/front-component-builder.handler';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { frontComponentVendorResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-vendor-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { invokeFrontComponentBuilderLocally } from 'src/engine/metadata-modules/ai/ai-front-component/utils/invoke-front-component-builder-locally.util';

import { createLinguiPlugin } from '../../../../../../../scripts/utils/create-lingui-plugin';

const charMap: Record<string, string> = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\0': '\\0',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

const escapeUnsafeChars = (str: string): string =>
  str.replace(/[<>\/\\\b\f\n\r\t\0\u2028\u2029]/g, (char) => charMap[char]);

jest.useRealTimers();

const PACKAGE_JSON = '{"name":"local-build-fixture","private":true}\n';
const YARN_LOCK = '# exact app-owned lock bytes\n';
const INPUT = {
  componentId: 'local-component',
  name: 'Local component',
  source: 'export const Component = () => <div>Built locally</div>;',
  query: { objectName: 'company', select: ['name'], limit: 20 },
  pageLayoutType: PageLayoutType.DASHBOARD as const,
};

describe('invokeFrontComponentBuilderLocally', () => {
  let directory: string;
  let buildAssetsDirectory: string;
  let yarnEngineDirectory: string;

  const invoke = (input: FrontComponentBuilderRequest) =>
    invokeFrontComponentBuilderLocally({
      input,
      buildAssetsDirectory,
      yarnEngineDirectory,
      timeoutMs: 30_000,
    });

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), 'local-builder-test-'));
    buildAssetsDirectory = join(directory, 'assets');
    yarnEngineDirectory = join(directory, 'yarn-engine');
    await mkdir(join(yarnEngineDirectory, '.yarn/releases'), {
      recursive: true,
    });
    await build({
      entryPoints: [
        resolve(__dirname, '../../front-component-builder.local.ts'),
      ],
      outfile: join(buildAssetsDirectory, 'local.js'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      tsconfig: resolve(__dirname, '../../../../../../../tsconfig.json'),
      plugins: [
        createLinguiPlugin({
          swcConfigPath: resolve(__dirname, '../../../../../../../.swcrc'),
        }),
        {
          name: 'installed-esbuild',
          setup(pluginBuild) {
            pluginBuild.onResolve({ filter: /^esbuild$/ }, () => ({
              path: require.resolve('esbuild'),
              external: true,
            }));
          },
        },
      ],
    });
    await writeFile(
      join(yarnEngineDirectory, '.yarn/releases/yarn-4.9.2.cjs'),
      `const fs = require('node:fs');
const assert = require('node:assert/strict');
fs.writeFileSync(${JSON.stringify(join(directory, 'install-directory'))}, process.cwd());
assert.equal(fs.readFileSync('package.json', 'utf8'), ${JSON.stringify(PACKAGE_JSON)});
assert.equal(fs.readFileSync('yarn.lock', 'utf8'), ${JSON.stringify(YARN_LOCK)});
assert.ok(process.argv.includes('--immutable'));
fs.symlinkSync(${JSON.stringify(dirname(dirname(require.resolve('react/package.json'))))}, 'node_modules', 'junction');`,
    );
  }, 30_000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('builds the stored dependency pair and matches the Lambda component output', async () => {
    const vendor = frontComponentVendorResultSchema.parse(
      await invoke({
        action: 'buildDependencies',
        packageJson: PACKAGE_JSON,
        yarnLock: YARN_LOCK,
      }),
    );

    if (!vendor.success) {
      throw new Error(vendor.error);
    }
    const request: FrontComponentBuilderRequest = {
      action: 'buildComponent',
      input: INPUT,
      manifest: { checksum: vendor.checksum, exports: vendor.exports },
    };
    const result = frontComponentBuildResultSchema.parse(await invoke(request));

    expect(result).toEqual(await handler(request));
    expect(result).toMatchObject({
      success: true,
      sharedDependenciesChecksum: vendor.checksum,
      compiledSource: expect.stringContaining('Built locally'),
    });
    const installDirectory = await readFile(
      join(directory, 'install-directory'),
      'utf8',
    );

    await expect(access(installDirectory)).rejects.toThrow();
    await expect(access(dirname(installDirectory))).rejects.toThrow();
  }, 30_000);

  it('returns the same invalid-input diagnostics as Lambda', async () => {
    const request: FrontComponentBuilderRequest = {
      action: 'buildComponent',
      input: { ...INPUT, source: 'export default () => <div />;' },
      manifest: { checksum: 'a'.repeat(64), exports: {} },
    };
    const result = await invoke(request);

    expect(result).toEqual(await handler(request));
    expect(result).toMatchObject({
      success: false,
      code: 'INVALID_INPUT',
      userFriendlyMessage: {
        id: expect.any(String),
        message: 'Invalid front component source.',
      },
    });
  });

  it('delivers responses larger than an IPC pipe buffer and removes the working directory', async () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_OPTIONS: '--require=/missing-server-loader.cjs',
    });
    const assets = join(directory, 'large-response');

    await mkdir(assets);
    await writeFile(
      join(assets, 'local.js'),
      `process.once('message', () => {
  process.send({ cwd: process.cwd(), source: 'x'.repeat(2 * 1024 * 1024) }, () => process.exit(0));
});`,
    );
    const result = (await invokeFrontComponentBuilderLocally({
      input: { action: 'buildDependencies', packageJson: '', yarnLock: '' },
      buildAssetsDirectory: assets,
      yarnEngineDirectory,
      timeoutMs: 5000,
    })) as { cwd: string; source: string };

    expect(result.source).toHaveLength(2 * 1024 * 1024);
    await expect(access(result.cwd)).rejects.toThrow();
  });

  it('surfaces builder failures instead of waiting for the timeout', async () => {
    await expect(
      invoke({ action: 'buildDependencies', packageJson: '{}', yarnLock: '' }),
    ).rejects.toThrow('ERR_ASSERTION');
    const installDirectory = await readFile(
      join(directory, 'install-directory'),
      'utf8',
    );

    await expect(access(installDirectory)).rejects.toThrow();
    await expect(access(dirname(installDirectory))).rejects.toThrow();
  });

  it('stops a timed-out build and removes its temporary directory', async () => {
    const assets = join(directory, 'timeout');
    const workingDirectoryFile = join(directory, 'timeout-directory');
    const heartbeatFile = join(directory, 'descendant-heartbeat');
    const descendantSource = `setInterval(() => require('node:fs').appendFileSync(${escapeUnsafeChars(JSON.stringify(heartbeatFile))}, 'x'), 20);`;

    await mkdir(assets);
    await writeFile(
      join(assets, 'local.js'),
      `require('node:fs').writeFileSync(${JSON.stringify(workingDirectoryFile)}, process.cwd());
if (process.platform !== 'win32') require('node:child_process').spawn(process.execPath, ['-e', ${JSON.stringify(descendantSource)}]);
setInterval(() => {}, 1000);`,
    );
    await expect(
      invokeFrontComponentBuilderLocally({
        input: { action: 'buildDependencies', packageJson: '', yarnLock: '' },
        buildAssetsDirectory: assets,
        yarnEngineDirectory,
        timeoutMs: 1000,
      }),
    ).rejects.toThrow('timed out');
    const workingDirectory = await readFile(workingDirectoryFile, 'utf8');

    await expect(access(workingDirectory)).rejects.toThrow();
    if (process.platform !== 'win32') {
      const heartbeat = await readFile(heartbeatFile, 'utf8');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(await readFile(heartbeatFile, 'utf8')).toBe(heartbeat);
    }
  });
});
