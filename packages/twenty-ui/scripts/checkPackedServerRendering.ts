import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import packageJson from '../package.json';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const consumerDirectory = mkdtempSync(
  join(tmpdir(), 'twenty-ui-server-consumer-'),
);
const consumerPath = join(consumerDirectory, 'consumer.mjs');

const run = ({
  command,
  arguments: commandArguments,
  cwd = consumerDirectory,
}: {
  command: string;
  arguments: string[];
  cwd?: string;
}) => {
  const result = spawnSync(command, commandArguments, {
    cwd,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} failed with exit code ${result.status ?? 1}: ${result.error?.message ?? ''}`,
    );
  }
};

try {
  run({
    command: 'npm',
    arguments: [
      'pack',
      '--ignore-scripts',
      '--pack-destination',
      consumerDirectory,
    ],
    cwd: packageRoot,
  });
  const archiveName = `${packageJson.name}-${packageJson.version}.tgz`;
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
  run({
    command: 'npm',
    arguments: [
      'install',
      '--ignore-scripts',
      '--omit=optional',
      '--no-audit',
      '--no-fund',
    ],
  });
  for (const moduleFormat of ['esm', 'commonjs']) {
    run({
      command: process.execPath,
      arguments: [consumerPath, moduleFormat, '--without-optional-peers'],
    });
  }
  run({
    command: 'npm',
    arguments: [
      'install',
      '--ignore-scripts',
      '--include=optional',
      '--no-audit',
      '--no-fund',
      `@monaco-editor/react@${packageJson.peerDependencies['@monaco-editor/react']}`,
      `monaco-editor@${packageJson.devDependencies['monaco-editor']}`,
    ],
  });
  for (const moduleFormat of ['esm', 'commonjs']) {
    run({
      command: process.execPath,
      arguments: [consumerPath, moduleFormat, '--editor'],
    });
  }
} finally {
  rmSync(consumerDirectory, { recursive: true, force: true });
}
