import { Readable } from 'stream';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';

import {
  type FileStorageService,
  type ResourceIdentifier,
} from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { PENDING_FILE_MAX_AGE_MS } from 'src/engine/core-modules/file/file-upload/crons/constants/pending-file-cleanup.constants';
import { type PendingFileCleanupService } from 'src/engine/core-modules/file/file-upload/services/pending-file-cleanup.service';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const LIVE_CONTENT = 'export const version = 1;';
const ABANDONED_CONTENT = 'export const version = 2;';
const NEXT_DEPLOY_CONTENT = 'export const version = 3;';

describe('PendingFileCleanupService', () => {
  let storage: FileStorageService;
  let cleanup: PendingFileCleanupService;
  let location: ResourceIdentifier;
  const stagedFileIds = new Set<string>();

  const quarantineOf = (fileId: string): ResourceIdentifier => ({
    ...location,
    resourcePath: buildPendingUploadResourcePath({
      fileId,
      resourcePath: location.resourcePath,
    }),
  });

  const stage = async (content: string) => {
    const file = await storage.createPendingFile({
      ...location,
      fileId: v4(),
      size: Buffer.byteLength(content),
      mimeType: 'application/octet-stream',
      settings: { isTemporaryFile: false, toDelete: false },
    });

    stagedFileIds.add(file.id);

    await storage.writeFileStream({
      ...quarantineOf(file.id),
      stream: Readable.from([content]),
      mimeType: 'application/octet-stream',
    });

    return file;
  };

  const deploy = async (content: string) => {
    const file = await stage(content);

    await storage.promotePendingFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      file,
      from: quarantineOf(file.id),
      to: location,
      size: Buffer.byteLength(content),
      mimeType: 'text/javascript',
    });

    return file;
  };

  const ageBeyondMaxPendingAge = (fileId: string) =>
    globalThis.testDataSource.query(
      `UPDATE core.file
       SET "createdAt" = "createdAt" - $2 * interval '1 millisecond',
           "updatedAt" = "updatedAt" - $2 * interval '1 millisecond'
       WHERE id = $1`,
      [fileId, PENDING_FILE_MAX_AGE_MS + 60 * 60_000],
    );

  const findRow = async (fileId: string) => {
    const [row] = await globalThis.testDataSource.query(
      'SELECT status, size::int AS size, "mimeType" FROM core.file WHERE id = $1',
      [fileId],
    );

    return row;
  };

  const readContent = async (resource: ResourceIdentifier) =>
    (await streamToBuffer(await storage.readFile(resource))).toString();

  const readLiveContent = () => readContent(location);

  beforeAll(() => {
    storage = getAppProviderByClassName('FileStorageService');
    cleanup = getAppProviderByClassName('PendingFileCleanupService');
  });

  beforeEach(() => {
    location = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: `${v4()}/index.mjs`,
    };
  });

  afterEach(async () => {
    jest.restoreAllMocks();

    for (const fileId of stagedFileIds) {
      await storage.deleteFileObject(quarantineOf(fileId));
    }

    stagedFileIds.clear();
    await storage.deleteFile(location);
  });

  it('restores a re-staged row whose deploy was abandoned and keeps its live object', async () => {
    const { id } = await deploy(LIVE_CONTENT);
    const uploadedRow = await findRow(id);

    expect((await stage(ABANDONED_CONTENT)).id).toBe(id);
    await ageBeyondMaxPendingAge(id);

    await cleanup.cleanupStaleFiles();

    expect(await findRow(id)).toEqual(uploadedRow);
    expect(await readLiveContent()).toBe(LIVE_CONTENT);
    expect(await storage.checkFileExists(quarantineOf(id))).toBe(false);
  });

  it('leaves an old row alone while a deploy is re-staging it', async () => {
    const { id } = await deploy(LIVE_CONTENT);

    await ageBeyondMaxPendingAge(id);
    await stage(ABANDONED_CONTENT);

    await cleanup.cleanupStaleFiles();

    expect((await findRow(id)).status).toBe(FILE_STATUS.PENDING);
    expect(await readLiveContent()).toBe(LIVE_CONTENT);
    expect(await storage.checkFileExists(quarantineOf(id))).toBe(true);
  });

  it('leaves a row alone when a deploy re-stages it after the cron loaded it', async () => {
    const { id } = await deploy(LIVE_CONTENT);

    await stage(ABANDONED_CONTENT);
    await ageBeyondMaxPendingAge(id);

    const restoreRestagedFile = storage.restoreRestagedFile.bind(storage);

    jest
      .spyOn(storage, 'restoreRestagedFile')
      .mockImplementation(async (args) => {
        if (args.file.id === id) {
          await stage(NEXT_DEPLOY_CONTENT);
        }

        return restoreRestagedFile(args);
      });

    await cleanup.cleanupStaleFiles();

    expect((await findRow(id)).status).toBe(FILE_STATUS.PENDING);
    expect(await readLiveContent()).toBe(LIVE_CONTENT);
    expect(await readContent(quarantineOf(id))).toBe(NEXT_DEPLOY_CONTENT);
  });

  it('deletes an abandoned new row with both of its objects', async () => {
    const { id } = await stage(LIVE_CONTENT);

    await storage.writeFileStream({
      ...location,
      stream: Readable.from([LIVE_CONTENT]),
      mimeType: 'text/javascript',
    });
    await ageBeyondMaxPendingAge(id);

    await cleanup.cleanupStaleFiles();

    expect(await findRow(id)).toBeUndefined();
    expect(await storage.checkFileExists(quarantineOf(id))).toBe(false);
    expect(await storage.checkFileExists(location)).toBe(false);
  });
});
