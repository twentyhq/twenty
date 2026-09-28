import { isString } from '@sniptt/guards';
import { spawnSync, type StdioOptions } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import packageJson from '../package.json';
import { runServerRenderingConsumer } from './server-rendering/runServerRenderingConsumer';

type PackedArchive = { filename: string };

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const consumerDirectory = mkdtempSync(
  join(tmpdir(), 'twenty-ui-server-consumer-'),
);
const consumerPath = join(consumerDirectory, 'consumer.mjs');

const runNpm = ({
  arguments: npmArguments,
  cwd = consumerDirectory,
  stdio = 'inherit',
}: {
  arguments: string[];
  cwd?: string;
  stdio?: StdioOptions;
}) => {
  const result = spawnSync('npm', npmArguments, {
    cwd,
    encoding: 'utf8',
    stdio,
  });
  if (result.status !== 0) {
    throw new Error(
      `npm ${npmArguments[0]} failed (${result.signal ?? `exit code ${result.status}`}): ${result.error?.message ?? ''}`,
    );
  }
  return result.stdout;
};

const packArchive = () => {
  const packedArchives: PackedArchive[] = JSON.parse(
    runNpm({
      arguments: [
        'pack',
        '--ignore-scripts',
        '--json',
        '--pack-destination',
        consumerDirectory,
      ],
      cwd: packageRoot,
      stdio: ['ignore', 'pipe', 'inherit'],
    }),
  );
  const archiveName = packedArchives[0]?.filename;
  if (!isString(archiveName)) {
    throw new Error('npm pack did not report an archive');
  }
  return archiveName;
};

try {
  const archiveName = packArchive();
  writeFileSync(
    join(consumerDirectory, 'package.json'),
    JSON.stringify(
      {
        name: 'twenty-ui-server-consumer',
        private: true,
        type: 'module',
        dependencies: {
          'twenty-ui': `file:./${archiveName}`,
          react: packageJson.peerDependencies.react,
          'react-dom': packageJson.peerDependencies['react-dom'],
        },
      },
      null,
      2,
    ),
  );
  copyFileSync(
    join(packageRoot, 'scripts/server-rendering/consumer.mjs'),
    consumerPath,
  );
  runNpm({
    arguments: [
      'install',
      '--ignore-scripts',
      '--omit=optional',
      '--no-audit',
      '--no-fund',
    ],
  });
  runServerRenderingConsumer({
    consumerPath,
    flags: ['--without-optional-peers'],
  });
  runNpm({
    arguments: [
      'install',
      '--ignore-scripts',
      '--include=optional',
      '--no-audit',
      '--no-fund',
      `@monaco-editor/react@${packageJson.peerDependencies['@monaco-editor/react']}`,
      `monaco-editor@${packageJson.peerDependencies['monaco-editor']}`,
    ],
  });
  runServerRenderingConsumer({ consumerPath, flags: ['--editor'] });
} finally {
  rmSync(consumerDirectory, { recursive: true, force: true });
}
