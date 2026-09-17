import { Readable } from 'node:stream';
import request from 'supertest';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import {
  type FileStorageService,
  type ResourceIdentifier,
} from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type PendingFileCleanupCronJob } from 'src/engine/core-modules/file/file-upload/crons/jobs/pending-file-cleanup.cron.job';
import {
  FILE_STATUS,
  type FileStatus,
} from 'src/engine/core-modules/file/types/file-status.types';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('export file cleanup (integration)', () => {
  let storage: FileStorageService;
  let cleanup: PendingFileCleanupCronJob;
  const files: { id: string; resource: ResourceIdentifier }[] = [];

  const createFile = async ({
    ageMinutes,
    status = FILE_STATUS.UPLOADED,
    fileFolder = FileFolder.RecordExport,
  }: {
    ageMinutes: number;
    status?: FileStatus;
    fileFolder?: FileFolder;
  }) => {
    const id = v4();
    const resource = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder,
      resourcePath: `${v4()}/${id}.csv`,
    };
    await storage.createPendingFile({
      ...resource,
      fileId: id,
      size: 0,
      mimeType: 'application/octet-stream',
      settings: { isTemporaryFile: true, toDelete: false },
    });
    const file = { id, resource };
    files.push(file);
    await storage.writeFileStream({
      ...resource,
      stream: Readable.from(['Id\n']),
      mimeType: 'text/csv',
    });
    await globalThis.testDataSource.query(
      'UPDATE core.file SET "createdAt" = $2, status = $3 WHERE id = $1',
      [id, new Date(Date.now() - ageMinutes * 60_000), status],
    );
    return file;
  };

  const expectFileExists = async (
    file: (typeof files)[number],
    exists: boolean,
  ) => {
    expect(await storage.checkFileExists(file.resource)).toBe(exists);
    const rows = await globalThis.testDataSource.query(
      'SELECT id FROM core.file WHERE id = $1',
      [file.id],
    );
    expect(rows).toHaveLength(exists ? 1 : 0);
  };

  beforeAll(() => {
    storage = getAppProviderByClassName('FileStorageService');
    cleanup = getAppProviderByClassName('PendingFileCleanupCronJob');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    for (const file of files.splice(0)) {
      await storage.deleteFile(file.resource);
    }
  });

  it('uses one hour only for the export folder and keeps the existing pending upload policy', async () => {
    const pendingExport = await createFile({
      ageMinutes: 61,
      status: FILE_STATUS.PENDING,
    });
    const completedExport = await createFile({ ageMinutes: 61 });
    const recentExport = await createFile({ ageMinutes: 59 });
    const recentPendingExport = await createFile({
      ageMinutes: 59,
      status: FILE_STATUS.PENDING,
    });
    const pendingUpload = await createFile({
      ageMinutes: 61,
      status: FILE_STATUS.PENDING,
      fileFolder: FileFolder.FilesField,
    });
    const stalePendingUpload = await createFile({
      ageMinutes: 25 * 60,
      status: FILE_STATUS.PENDING,
      fileFolder: FileFolder.FilesField,
    });
    const completedUpload = await createFile({
      ageMinutes: 25 * 60,
      fileFolder: FileFolder.FilesField,
    });

    await cleanup.handle();

    for (const file of [pendingExport, completedExport, stalePendingUpload]) {
      await expectFileExists(file, false);
    }
    for (const file of [
      recentExport,
      recentPendingExport,
      pendingUpload,
      completedUpload,
    ]) {
      await expectFileExists(file, true);
    }
  });

  it('keeps the export row after storage deletion fails and retries on the next run', async () => {
    const file = await createFile({ ageMinutes: 61 });
    const factory = getAppProviderByClassName<FileStorageDriverFactory>(
      'FileStorageDriverFactory',
    );
    jest
      .spyOn(factory.getCurrentDriver(), 'delete')
      .mockRejectedValueOnce(new Error('Storage unavailable'));

    await cleanup.handle();
    await expectFileExists(file, true);

    await cleanup.handle();
    await expectFileExists(file, false);
  });

  it('does not expose registered exports through the standard file download route', async () => {
    const file = await createFile({ ageMinutes: 0 });
    const jwt =
      getAppProviderByClassName<JwtWrapperService>('JwtWrapperService');
    const token = await jwt.signAsyncOrThrow(
      {
        type: JwtTokenTypeEnum.FILE,
        sub: SEED_APPLE_WORKSPACE_ID,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        fileId: file.id,
      },
      { expiresIn: 60 },
    );

    await request(`http://localhost:${APP_PORT}`)
      .get(`/file/${FileFolder.RecordExport}/${file.id}`)
      .query({ token })
      .expect(403);
    await expectFileExists(file, true);
  });

  it('retains a pending row if cancellation races a writer that later crashes', async () => {
    const file = await createFile({
      ageMinutes: 0,
      status: FILE_STATUS.PENDING,
    });
    const exports = getAppProviderByClassName<RecordExportWorkspaceService>(
      'RecordExportWorkspaceService',
    );
    await exports.cancel({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      id: file.resource.resourcePath.split('/')[0],
    });
    expect(await storage.checkFileExists(file.resource)).toBe(false);
    expect(
      await globalThis.testDataSource.query(
        'SELECT id FROM core.file WHERE id = $1',
        [file.id],
      ),
    ).toHaveLength(1);

    await storage.writeFileStream({
      ...file.resource,
      stream: Readable.from(['Id\n']),
      mimeType: 'text/csv',
    });
    await globalThis.testDataSource.query(
      'UPDATE core.file SET "createdAt" = $2 WHERE id = $1',
      [file.id, new Date(Date.now() - 61 * 60_000)],
    );

    await cleanup.handle();
    await expectFileExists(file, false);
  });
});
