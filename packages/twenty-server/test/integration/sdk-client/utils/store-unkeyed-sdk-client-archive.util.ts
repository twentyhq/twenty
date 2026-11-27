import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FileFolder } from 'twenty-shared/types';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';

// Archives stored before the generation key existed were named without it, and
// nothing in the API can write one any more.
export const storeUnkeyedSdkClientArchive = async ({
  workspaceId,
  applicationUniversalIdentifier,
  coreModuleSource,
}: {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  coreModuleSource: string;
}) => {
  const directory = await mkdtemp(join(tmpdir(), 'unkeyed-sdk-client-'));

  try {
    const packageDirectory = join(directory, 'package');

    await mkdir(join(packageDirectory, 'dist'), { recursive: true });
    await writeFile(
      join(packageDirectory, 'dist', 'core.mjs'),
      coreModuleSource,
    );

    const archivePath = join(directory, 'twenty-client-sdk.zip');

    await createZipFile(packageDirectory, archivePath);

    await getAppProviderByClassName<FileStorageService>(
      'FileStorageService',
    ).writeFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.GeneratedSdkClient,
      resourcePath: 'twenty-client-sdk.zip',
      sourceFile: await readFile(archivePath),
      settings: { isTemporaryFile: false, toDelete: false },
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};
