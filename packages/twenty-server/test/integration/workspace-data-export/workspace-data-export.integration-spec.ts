import request from 'supertest';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import unzipper from 'unzipper';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createWorkspaceDataExport } from 'test/integration/workspace-data-export/utils/create-workspace-data-export.util';
import { listWorkspaceDataExports } from 'test/integration/workspace-data-export/utils/list-workspace-data-exports.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

/* global APP_PORT */

const client = request(`http://localhost:${APP_PORT}`);

const setWorkspaceActivationStatus = async (
  activationStatus: WorkspaceActivationStatus,
) => {
  await globalThis.testDataSource.query(
    'UPDATE core.workspace SET "activationStatus" = $1 WHERE id = $2',
    [activationStatus, SEED_APPLE_WORKSPACE_ID],
  );
  await getAppProviderByClassName<CoreEntityCacheService>(
    'CoreEntityCacheService',
  ).invalidate('workspaceEntity', SEED_APPLE_WORKSPACE_ID);
};

const toRelativeUrl = (url: string) => {
  const { pathname, search } = new URL(url);

  return `${pathname}${search}`;
};

describe('workspace data export (integration)', () => {
  const exportIds: string[] = [];
  let storage: FileStorageService;

  beforeAll(() => {
    storage =
      getAppProviderByClassName<FileStorageService>('FileStorageService');
  });

  afterAll(async () => {
    await setWorkspaceActivationStatus(WorkspaceActivationStatus.ACTIVE);

    for (const exportId of exportIds) {
      await storage.deleteByFileId({
        fileId: exportId,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        fileFolder: FileFolder.WorkspaceDataExport,
      });
    }
  });

  it('exports every active object as CSV in a zip the admin can download, even once the workspace is suspended', async () => {
    const { dataExport: pendingExport, errors } =
      await createWorkspaceDataExport(SEED_APPLE_WORKSPACE_ID);

    expect(errors).toBeUndefined();

    if (!isDefined(pendingExport)) {
      throw new Error('Export was not created');
    }

    exportIds.push(pendingExport.id);
    expect(pendingExport.status).toBe('PENDING');
    expect(pendingExport.downloadUrl).toBeNull();

    await waitForAllJobsToFinish();

    const completedExport = (
      await listWorkspaceDataExports(SEED_APPLE_WORKSPACE_ID)
    ).find((dataExport) => dataExport.id === pendingExport.id);

    if (!isDefined(completedExport?.downloadUrl)) {
      throw new Error('Export did not complete');
    }

    expect(completedExport).toMatchObject({
      status: 'COMPLETED',
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
    expect(completedExport.sizeInBytes).toBeGreaterThan(0);
    expect(completedExport.downloadUrl).toContain(
      `/file/${FileFolder.WorkspaceDataExport}/${pendingExport.id}?token=`,
    );

    const stream = await storage.readFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      fileFolder: FileFolder.WorkspaceDataExport,
      resourcePath: `${pendingExport.id}.zip`,
    });
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const archive = await unzipper.Open.buffer(Buffer.concat(chunks));
    const entryNames = archive.files.map((entry) => entry.path);

    expect(entryNames).toEqual(
      expect.arrayContaining(['company.csv', 'person.csv', 'manifest.json']),
    );

    const readEntry = async (entryName: string) => {
      const entry = archive.files.find((file) => file.path === entryName);

      if (!isDefined(entry)) {
        throw new Error(`${entryName} missing from archive`);
      }

      return (await entry.buffer()).toString('utf8');
    };

    const [companyHeader, ...companyLines] = (await readEntry('company.csv'))
      .replace(/^﻿/, '')
      .split('\n')
      .filter((line) => line.length > 0);
    const companyColumns = companyHeader.split(',');

    expect(companyColumns).toEqual(
      expect.arrayContaining(['id', 'name', 'createdAt']),
    );
    expect(companyColumns).not.toContain('searchVector');
    expect(companyLines.length).toBeGreaterThan(0);

    const manifest = JSON.parse(await readEntry('manifest.json'));

    expect(manifest.workspaceId).toBe(SEED_APPLE_WORKSPACE_ID);
    expect(
      manifest.objects.find(
        (object: { nameSingular: string }) => object.nameSingular === 'company',
      ),
    ).toMatchObject({ file: 'company.csv', rowCount: companyLines.length });

    await setWorkspaceActivationStatus(WorkspaceActivationStatus.SUSPENDED);

    try {
      const download = await client.get(
        toRelativeUrl(completedExport.downloadUrl),
      );

      expect(download.status).toBe(200);
      expect(download.headers['content-type']).toContain('application/zip');
    } finally {
      await setWorkspaceActivationStatus(WorkspaceActivationStatus.ACTIVE);
    }
  });

  it('refuses a workspace that does not exist', async () => {
    const { errors } = await createWorkspaceDataExport(
      '20202020-0000-4000-8000-000000000000',
    );

    expect(errors?.[0]?.extensions?.subCode).toBe('WORKSPACE_NOT_FOUND');
  });
});
