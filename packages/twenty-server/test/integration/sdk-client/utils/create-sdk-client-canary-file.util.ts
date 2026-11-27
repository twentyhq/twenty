import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export type SdkClientCanaryFile = {
  canaryPath: string;
  marker: string;
  removeCanaryFile: () => Promise<void>;
};

// Short directory and file names keep the payload under the 63-character
// limit of option labels.
export const createSdkClientCanaryFile =
  async (): Promise<SdkClientCanaryFile> => {
    const directory = await mkdtemp(join(tmpdir(), 'c'));
    const canaryPath = join(directory, 'c');
    const marker = `CANARY_${randomUUID().replace(/-/g, '')}`;

    await writeFile(canaryPath, marker);

    return {
      canaryPath,
      marker,
      removeCanaryFile: () => rm(directory, { recursive: true, force: true }),
    };
  };
