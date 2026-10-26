import { spawn } from 'child_process';
import path from 'path';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TWENTY_SERVER_ROOT = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  '..',
);
const COMMAND_JS_PATH = path.join(
  TWENTY_SERVER_ROOT,
  'dist',
  'command',
  'command.js',
);

export type TransferCommandResult = {
  exitCode: number | null;
  output: string;
};

// Runs the built command, as an operator would, against the test database
export const runTransferApplicationToWorkspaceCustomApplicationCommand = ({
  applicationUniversalIdentifier,
  isDryRun = false,
}: {
  applicationUniversalIdentifier: string;
  isDryRun?: boolean;
}): Promise<TransferCommandResult> =>
  new Promise((resolve, reject) => {
    const child = spawn(
      'node',
      [
        COMMAND_JS_PATH,
        'application:transfer-to-workspace-custom-application',
        '--workspace-id',
        SEED_APPLE_WORKSPACE_ID,
        '--application-universal-identifier',
        applicationUniversalIdentifier,
        ...(isDryRun ? ['--dry-run'] : []),
      ],
      {
        cwd: TWENTY_SERVER_ROOT,
        env: { ...process.env, NODE_ENV: 'test' },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let output = '';

    child.stdout?.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (exitCode) => resolve({ exitCode, output }));
  });
