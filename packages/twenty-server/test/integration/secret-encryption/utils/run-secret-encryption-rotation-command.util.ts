import { spawn } from 'child_process';
import path from 'path';

const TWENTY_SERVER_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const COMMAND_JS_PATH = path.join(
  TWENTY_SERVER_ROOT,
  'dist',
  'command',
  'command.js',
);

type RotateArguments = {
  site?: string;
  batchSize?: number;
  dryRun?: boolean;
};

const buildArgs = ({ site, batchSize, dryRun }: RotateArguments): string[] => {
  const args = ['secret-encryption:rotate'];

  if (site !== undefined) {
    args.push('--site', site);
  }
  if (batchSize !== undefined) {
    args.push('--batch-size', String(batchSize));
  }
  if (dryRun === true) {
    args.push('--dry-run');
  }

  return args;
};

export const runSecretEncryptionRotationCommand = async (
  args: RotateArguments = {},
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const child = spawn('node', [COMMAND_JS_PATH, ...buildArgs(args)], {
      cwd: TWENTY_SERVER_ROOT,
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(
        new Error(
          `Failed to spawn secret-encryption:rotate: ${error.message}\nstdout:\n${stdout}\nstderr:\n${stderr}`,
        ),
      );
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `secret-encryption:rotate exited with code ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}`,
        ),
      );
    });
  });
};
