import { fork } from 'child_process';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';

export const invokeFrontComponentBuilderLocally = async ({
  input,
  buildAssetsDirectory,
  yarnEngineDirectory,
  timeoutMs,
}: {
  input: FrontComponentBuilderRequest;
  buildAssetsDirectory: string;
  yarnEngineDirectory: string;
  timeoutMs: number;
}): Promise<unknown> => {
  const directory = await mkdtemp(join(tmpdir(), 'front-component-builder-'));

  try {
    const { NODE_OPTIONS: _nodeOptions, ...environment } = process.env;
    const child = fork(join(buildAssetsDirectory, 'local.js'), [], {
      cwd: directory,
      env: {
        ...environment,
        TMPDIR: directory,
        TMP: directory,
        TEMP: directory,
      },
      execArgv: [],
      silent: true,
      detached: process.platform !== 'win32',
    });
    const closed = new Promise<void>((resolve) =>
      child.once('close', () => resolve()),
    );
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let stderr = '';

    child.stdout?.resume();
    child.stderr?.on('data', (data: Buffer) => {
      stderr = (stderr + data.toString()).slice(-8192);
    });

    try {
      return await new Promise<unknown>((resolve, reject) => {
        child.once('message', resolve);
        child.once('error', reject);
        child.once('exit', (code, signal) =>
          reject(
            new Error(
              `Local frontend component builder exited (${signal ?? code}): ${stderr}`,
            ),
          ),
        );
        timeout = setTimeout(
          () => reject(new Error('Local frontend component build timed out.')),
          timeoutMs,
        );
        child.send({ input, yarnEngineDirectory }, (error) => {
          if (error) {
            reject(error);
          }
        });
      });
    } finally {
      clearTimeout(timeout);
      if (child.pid) {
        try {
          // Yarn and esbuild must exit before their temporary files are removed.
          if (process.platform === 'win32') {
            child.kill('SIGKILL');
          } else {
            process.kill(-child.pid, 'SIGKILL');
          }
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code;

          if (code === 'EPERM') {
            // macOS can reject a group signal while its leader is exiting.
            child.kill('SIGKILL');
          } else if (code !== 'ESRCH') {
            throw error;
          }
        }
      }
      await closed;
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};
