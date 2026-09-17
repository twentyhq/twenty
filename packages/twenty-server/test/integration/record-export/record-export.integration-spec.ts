import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type RecordExportStreamWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-stream.workspace-service';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { createClient } from 'graphql-sse';
import { setTimeout } from 'node:timers/promises';
import { Readable } from 'node:stream';
import request from 'supertest';
import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { upsertContainsRlsPredicate } from 'test/integration/graphql/utils/upsert-contains-rls-predicate.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  FeatureFlagKey,
  FileFolder,
  OrderByDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type CreateRecordExportInput } from 'src/engine/core-modules/record-export/dtos/create-record-export.input';
import { type RecordExportDTO } from 'src/engine/core-modules/record-export/dtos/record-export.dto';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { type RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { type RecordExportQueryWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export-query.workspace-service';
import { type RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import {
  type RecordExport,
  type RecordExportDownload,
} from 'src/engine/core-modules/record-export/types/record-export.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);
const companies = Array.from({ length: 1005 }, (_, index) => ({
  id: v4(),
  name: `Export ${String(index).padStart(4, '0')} ${v4()}`,
}));

const waitUntil = async (condition: () => Promise<boolean>) => {
  const deadline = Date.now() + 10_000;
  while (!(await condition())) {
    if (Date.now() > deadline) {
      throw new Error('Export did not settle');
    }
    await setTimeout(25);
  }
};

describe('record export lifecycle (integration)', () => {
  let input: CreateRecordExportInput;
  let exports: RecordExportWorkspaceService;
  let cache: RecordExportCacheService;
  let storage: FileStorageService;
  let query: RecordExportQueryWorkspaceService;
  let originalRoleId: string;
  let roleId: string;
  let wasAsyncCsvExportEnabled: boolean;
  const connections: ReturnType<typeof createClient>[] = [];
  const exportIds = new Set<string>();

  const subscribe = (
    parameters = input,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) => {
    const connection = createClient({
      url: `http://localhost:${APP_PORT}/metadata`,
      headers: { Authorization: `Bearer ${token}` },
      retryAttempts: 0,
    });
    connections.push(connection);
    const events = connection.iterate<{ exportRecords: RecordExportDTO }>({
      query: `subscription ExportRecords($input: CreateRecordExportInput!) {
        exportRecords(input: $input) {
          id filename status processedRecordCount totalRecordCount downloadUrl errorMessage
        }
      }`,
      variables: { input: parameters },
    });
    return { connection, events };
  };

  const nextExport = async (events: ReturnType<typeof subscribe>['events']) => {
    const event = await events.next();
    if (event.done || !isDefined(event.value.data?.exportRecords)) {
      throw new Error(JSON.stringify(event.value?.errors ?? 'Export ended'));
    }
    const recordExport = event.value.data.exportRecords;
    exportIds.add(recordExport.id);
    return recordExport;
  };

  const exportToCompletion = async (
    parameters = input,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) => {
    const { connection, events } = subscribe(parameters, token);
    try {
      while (true) {
        const recordExport = await nextExport(events);
        if (recordExport.status === RecordExportStatus.FAILED) {
          throw new Error(recordExport.errorMessage ?? 'Export failed');
        }
        if (recordExport.status === RecordExportStatus.COMPLETED) {
          expect(recordExport.downloadUrl).toBeDefined();
          return recordExport;
        }
      }
    } finally {
      connection.dispose();
    }
  };

  const download = (recordExport: RecordExportDTO) => {
    const url = new URL(recordExport.downloadUrl!);
    return client.get(url.pathname + url.search);
  };
  const getExport = (id: string) =>
    exports.findOrThrow({ workspaceId: SEED_APPLE_WORKSPACE_ID, id });
  const fileExists = (recordExport: RecordExportDownload) =>
    storage.checkFileExists(
      exports.getFileResource({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        resourcePath: `${recordExport.id}/${recordExport.fileId}.csv`,
      }),
    );
  const changeRole = async (updatePayload: {
    canAccessAllTools?: boolean;
    canReadAllObjectRecords?: boolean;
  }) => {
    const result = await updateOneRole({
      input: { idToUpdate: roleId, updatePayload },
      expectToFail: false,
    });
    expect(result.errors).toBeUndefined();
  };

  beforeAll(async () => {
    const featureFlagService =
      getAppProviderByClassName<FeatureFlagService>('FeatureFlagService');
    wasAsyncCsvExportEnabled = await featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
      SEED_APPLE_WORKSPACE_ID,
    );
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
      value: true,
      expectToFail: false,
    });
    exports = getAppProviderByClassName('RecordExportWorkspaceService');
    cache = getAppProviderByClassName('RecordExportCacheService');
    storage = getAppProviderByClassName('FileStorageService');
    query = getAppProviderByClassName('RecordExportQueryWorkspaceService');
    const { objects } = await findManyObjectMetadata({
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular fieldsList { id name }',
      expectToFail: false,
    });
    const company = objects.find(
      (object) => object.nameSingular === 'company',
    )!;
    input = {
      objectMetadataId: company.id,
      fieldMetadataIds: ['name', 'id'].map(
        (name) => company.fieldsList!.find((field) => field.name === name)!.id,
      ),
      filter: { id: { in: companies.map(({ id }) => id) } },
      orderBy: [{ name: OrderByDirection.AscNullsLast }],
    };
    for (let offset = 0; offset < companies.length; offset += 100) {
      const result = await createManyOperation({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        data: companies.slice(offset, offset + 100),
      });
      expect(result.errors).toBeUndefined();
    }
    originalRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    const result = await createOneRole({
      input: {
        label: `Export test ${v4()}`,
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canBeAssignedToUsers: true,
      },
      expectToFail: false,
    });
    expect(result.errors).toBeUndefined();
    roleId = result.data.createOneRole.id;
    await updateWorkspaceMemberRole({
      input: { roleId, workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
    });
  }, 60_000);

  afterEach(async () => {
    for (const connection of connections.splice(0)) connection.dispose();
    jest.restoreAllMocks();
    for (const id of exportIds)
      await exports.cancel({ workspaceId: SEED_APPLE_WORKSPACE_ID, id });
    exportIds.clear();
    if (isDefined(roleId)) {
      await changeRole({
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
      });
    }
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
      value: wasAsyncCsvExportEnabled,
      expectToFail: false,
    });
    if (isDefined(originalRoleId)) {
      await updateWorkspaceMemberRole({
        input: {
          roleId: originalRoleId,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        },
      });
    }
    if (isDefined(roleId)) {
      await deleteOneRole({ input: { idToDelete: roleId } });
    }
    for (let offset = 0; offset < companies.length; offset += 100) {
      await makeGraphqlAPIRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id',
          filter: {
            id: {
              in: companies.slice(offset, offset + 100).map(({ id }) => id),
            },
          },
        }),
      );
    }
  }, 60_000);

  it('rejects new async exports when disabled and still downloads an already prepared file', async () => {
    const ready = await exportToCompletion();
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
      value: false,
      expectToFail: false,
    });
    try {
      const { events } = subscribe();
      await expect(nextExport(events)).rejects.toThrow(
        'Asynchronous CSV export is not enabled for this workspace',
      );
      await download(ready).expect(200);
    } finally {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
        value: true,
        expectToFail: false,
      });
    }
  });

  it('exports every selected page in column and record order, then deletes the download', async () => {
    const recordExport = await exportToCompletion({
      ...input,
      filter: {
        and: [input.filter!, { not: { id: { eq: companies[0].id } } }],
      },
    });
    expect(recordExport.processedRecordCount).toBe(1004);
    expect(recordExport.totalRecordCount).toBe(1004);
    const stored = await getExport(recordExport.id);
    expect(await fileExists(stored)).toBe(true);
    const [file] = await globalThis.testDataSource.query(
      'SELECT id, status, size, "mimeType" FROM core.file WHERE "workspaceId" = $1 AND path = $2',
      [
        SEED_APPLE_WORKSPACE_ID,
        `${FileFolder.RecordExport}/${stored.id}/${stored.fileId}.csv`,
      ],
    );
    expect(file).toMatchObject({ status: 'UPLOADED', mimeType: 'text/csv' });
    const response = await download(recordExport).expect(200);
    expect(Number(file.size)).toBe(Buffer.byteLength(response.text));
    await waitUntil(async () => {
      const rows = await globalThis.testDataSource.query(
        'SELECT id FROM core.file WHERE id = $1',
        [file.id],
      );
      return rows.length === 0;
    });
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="company.csv"',
    );
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.text.replace(/^\uFEFF/, '')).toBe(
      'Id,Name\n' +
        companies
          .slice(1)
          .map(({ id, name }) => `${id},${name}\n`)
          .join(''),
    );
    await waitUntil(async () => !(await fileExists(stored)));
    expect(
      await cache.findDownload({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        id: recordExport.id,
      }),
    ).toBeUndefined();
    await download(recordExport).expect(404);
  });

  it('exports headers when the selection is empty', async () => {
    const recordExport = await exportToCompletion({
      ...input,
      filter: { id: { eq: v4() } },
    });
    expect(recordExport.totalRecordCount).toBe(0);
    expect(recordExport.processedRecordCount).toBe(0);
    const response = await download(recordExport).expect(200);
    expect(response.text.replace(/^\uFEFF/, '')).toBe('Id,Name\n');
  });

  it('cancels on a lost SSE connection and allows the next export', async () => {
    const { connection, events } = subscribe();
    const recordExport = await nextExport(events);
    expect(recordExport.status).not.toBe(RecordExportStatus.COMPLETED);
    connection.dispose();
    await waitUntil(
      async () =>
        !(await cache.isConnected({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          id: recordExport.id,
        })),
    );
    const next = await exportToCompletion();
    await download(next).expect(200);
  });

  it('reports progress between pages and rejects a second active export', async () => {
    const readPage = query.readPage.bind(query);
    let releasePage = () => {};
    const pageGate = new Promise<void>((resolve) => {
      releasePage = resolve;
    });
    jest.spyOn(query, 'readPage').mockImplementation(async (...args) => {
      if (isDefined(args[0].after)) {
        await pageGate;
      }
      return readPage(...args);
    });
    const first = subscribe();
    try {
      let progress = await nextExport(first.events);
      while (progress.processedRecordCount < 1000) {
        progress = await nextExport(first.events);
      }
      expect(progress.status).toBe(RecordExportStatus.PROCESSING);
      expect(progress.totalRecordCount).toBe(companies.length);
      const second = subscribe();
      await expect(nextExport(second.events)).rejects.toThrow();
    } finally {
      first.connection.dispose();
      releasePage();
    }
  });

  it('releases the workspace slot when the export queue cannot accept a job', async () => {
    const completed = await exportToCompletion();
    const stored = await getExport(completed.id);
    const requester = await query.resolveRequester(stored);
    const queue = global.app.get<MessageQueueService>(
      getQueueToken(MessageQueue.recordExportQueue),
    );
    const create = exports.create.bind(exports);
    let failed: RecordExport | undefined;
    jest.spyOn(exports, 'create').mockImplementation(async (parameters) => {
      const recordExport = await create(parameters);
      exportIds.add(recordExport.id);
      failed = recordExport;
      return recordExport;
    });
    jest
      .spyOn(queue, 'add')
      .mockRejectedValueOnce(new Error('Queue unavailable'));
    await expect(
      exports.enqueue(
        await exports.create({ parameters: input, authContext: requester }),
      ),
    ).rejects.toThrow('Queue unavailable');
    expect(await cache.isConnected(failed!)).toBe(false);
    expect(await cache.findDownload(failed!)).toBeUndefined();
    const next = await exportToCompletion();
    await download(next).expect(200);
  });

  it('renews the lease during queue handoff and paused event consumption', async () => {
    const ready = await exportToCompletion();
    const requester = await query.resolveRequester(await getExport(ready.id));
    const streams =
      getAppProviderByClassName<RecordExportStreamWorkspaceService>(
        'RecordExportStreamWorkspaceService',
      );
    const storageCache = global.app.get<CacheStorageService>(
      CacheStorageNamespace.EngineRecordExport,
    );
    const enqueue = exports.enqueue.bind(exports);
    let releaseEnqueue = () => {};
    let notifyEnqueue = (recordExport: RecordExport) => {
      void recordExport;
    };
    const enqueueGate = new Promise<void>((resolve) => {
      releaseEnqueue = resolve;
    });
    const enqueueStarted = new Promise<RecordExport>((resolve) => {
      notifyEnqueue = resolve;
    });
    jest.spyOn(exports, 'enqueue').mockImplementation(async (recordExport) => {
      exportIds.add(recordExport.id);
      notifyEnqueue(recordExport);
      await enqueueGate;
      return enqueue(recordExport);
    });
    const readPage = query.readPage.bind(query);
    let releasePage = () => {};
    const pageGate = new Promise<void>((resolve) => {
      releasePage = resolve;
    });
    jest.spyOn(query, 'readPage').mockImplementation(async (args) => {
      await pageGate;
      return readPage(args);
    });
    const subscription = streams.stream({
      parameters: input,
      authContext: requester,
    });
    try {
      const recordExport = await enqueueStarted;
      const assertLeaseSurvives = async () => {
        await storageCache.runScript({
          script: {
            name: 'shorten-export-test-lease',
            source: "return redis.call('PEXPIRE', KEYS[1], 2000)",
          },
          keys: [`{${SEED_APPLE_WORKSPACE_ID}}:active`],
          args: [],
        });
        await setTimeout(2500);
        expect(await cache.isConnected(recordExport)).toBe(true);
      };
      await assertLeaseSurvives();
      releaseEnqueue();
      const events = await subscription;
      expect((await events.next()).done).toBe(false);
      await assertLeaseSurvives();
      await events.return?.();
      expect(await cache.isConnected(recordExport)).toBe(false);
    } finally {
      releaseEnqueue();
      releasePage();
      const events = await subscription;
      await events.return?.();
    }
  });

  it('retrieves completed worker output when the SSE consumer missed all progress', async () => {
    const ready = await exportToCompletion();
    const requester = await query.resolveRequester(await getExport(ready.id));
    const streams =
      getAppProviderByClassName<RecordExportStreamWorkspaceService>(
        'RecordExportStreamWorkspaceService',
      );
    const enqueue = exports.enqueue.bind(exports);
    let recordExport: RecordExport;
    let jobId: string;
    jest.spyOn(exports, 'enqueue').mockImplementation(async (created) => {
      recordExport = created;
      exportIds.add(created.id);
      jobId = await enqueue(created);
      return jobId;
    });
    const events = await streams.stream({
      parameters: input,
      authContext: requester,
    });
    try {
      await waitUntil(
        async () =>
          (await exports.getProgress(recordExport, jobId)).status ===
          RecordExportStatus.COMPLETED,
      );
      expect(await cache.findDownload(recordExport!)).toBeUndefined();
      const completed = await events.next();
      expect(completed.value).toMatchObject({
        status: RecordExportStatus.COMPLETED,
        processedRecordCount: companies.length,
      });
      await download(completed.value).expect(200);
    } finally {
      await events.return?.();
    }
  });

  it('allows only one download while the file is being opened', async () => {
    const recordExport = await exportToCompletion();
    const stored = await getExport(recordExport.id);
    const readFile = storage.readFile.bind(storage);
    let releaseRead = () => {};
    let notifyRead = () => {};
    const readGate = new Promise<void>((resolve) => {
      releaseRead = resolve;
    });
    const readStarted = new Promise<void>((resolve) => {
      notifyRead = resolve;
    });
    jest.spyOn(storage, 'readFile').mockImplementationOnce(async (resource) => {
      notifyRead();
      await readGate;
      return readFile(resource);
    });
    const first = download(recordExport)
      .expect(200)
      .then((response) => response);
    try {
      await readStarted;
      await download(recordExport).expect(409);
      expect(await fileExists(stored)).toBe(true);
    } finally {
      releaseRead();
      expect((await first).text).toContain(companies[0].name);
    }
    await waitUntil(async () => !(await fileExists(stored)));
  });

  it('cleans up when storage cannot open the download', async () => {
    const recordExport = await exportToCompletion();
    const stored = await getExport(recordExport.id);
    jest
      .spyOn(storage, 'readFile')
      .mockRejectedValueOnce(new Error('Storage unavailable'));
    await download(recordExport).expect(500);
    expect(await cache.findDownload(stored)).toBeUndefined();
    expect(await fileExists(stored)).toBe(false);
  });

  it('rejects a download token used for another export and an invalid signature', async () => {
    const recordExport = await exportToCompletion();
    const url = new URL(recordExport.downloadUrl!);
    await client
      .get(`/record-exports/${v4()}/download${url.search}`)
      .expect(403);
    await client.get(`${url.pathname}?token=invalid`).expect(403);
    await download(recordExport).expect(200);
  });

  it('rejects an export without export permission', async () => {
    await changeRole({ canAccessAllTools: false });
    const { events } = subscribe(input, APPLE_JONY_MEMBER_ACCESS_TOKEN);
    await expect(nextExport(events)).rejects.toThrow(/permission/i);
  });

  it('rechecks export permission before serving a completed file', async () => {
    const recordExport = await exportToCompletion(
      input,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    await changeRole({ canAccessAllTools: false });
    await download(recordExport).expect(403);
  });

  it('rechecks object read permission before serving a completed file', async () => {
    const recordExport = await exportToCompletion(
      input,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    try {
      const result = await upsertObjectPermissions({
        input: {
          roleId,
          objectPermissions: [
            {
              objectMetadataId: input.objectMetadataId,
              canReadObjectRecords: false,
            },
          ],
        },
        expectToFail: false,
      });
      expect(result.errors).toBeUndefined();
      await download(recordExport).expect(403);
    } finally {
      await upsertObjectPermissions({
        input: {
          roleId,
          objectPermissions: [
            {
              objectMetadataId: input.objectMetadataId,
              canReadObjectRecords: true,
            },
          ],
        },
      });
    }
  });

  it('stops generation when export permission is revoked between pages', async () => {
    const readPage = query.readPage.bind(query);
    let releasePage = () => {};
    let notifyPage = () => {};
    const pageGate = new Promise<void>((resolve) => {
      releasePage = resolve;
    });
    const pageStarted = new Promise<void>((resolve) => {
      notifyPage = resolve;
    });
    jest.spyOn(query, 'readPage').mockImplementation(async (...args) => {
      if (!isDefined(args[0].after) && !isDefined(args[0].first)) {
        notifyPage();
        await pageGate;
      }
      return readPage(...args);
    });
    const { events } = subscribe(input, APPLE_JONY_MEMBER_ACCESS_TOKEN);
    try {
      let recordExport = await nextExport(events);
      await pageStarted;
      await changeRole({ canAccessAllTools: false });
      releasePage();
      while (recordExport.status !== RecordExportStatus.FAILED) {
        recordExport = await nextExport(events);
      }
      expect(recordExport.downloadUrl).toBeNull();
      expect(recordExport.processedRecordCount).toBeLessThan(companies.length);
    } finally {
      releasePage();
    }
  });

  it('applies row permissions to both the count and the exported records', async () => {
    await upsertContainsRlsPredicate({
      roleId,
      objectNameSingular: 'company',
      fieldName: 'name',
      value: companies[0].name,
    });
    const recordExport = await exportToCompletion(
      input,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    expect(recordExport.totalRecordCount).toBe(1);
    expect(recordExport.processedRecordCount).toBe(1);
    const response = await download(recordExport).expect(200);
    expect(response.text.replace(/^\uFEFF/, '')).toBe(
      `Id,Name\n${companies[0].id},${companies[0].name}\n`,
    );
  });

  it('removes a partial file when generation fails', async () => {
    let partialFilePath: string | undefined;
    let pendingFile: { id: string; status: string } | undefined;
    const writeFileStream = storage.writeFileStream.bind(storage);
    jest
      .spyOn(storage, 'writeFileStream')
      .mockImplementation(async (resource) => {
        partialFilePath = resource.resourcePath;
        [pendingFile] = await globalThis.testDataSource.query(
          'SELECT id, status FROM core.file WHERE "workspaceId" = $1 AND path = $2',
          [
            SEED_APPLE_WORKSPACE_ID,
            `${FileFolder.RecordExport}/${partialFilePath}`,
          ],
        );
        return writeFileStream(resource);
      });
    const readPage = query.readPage.bind(query);
    jest.spyOn(query, 'readPage').mockImplementation(async (...args) => {
      if (isDefined(args[0].after)) {
        throw new Error('Interrupted database read');
      }
      return readPage(...args);
    });
    const { events } = subscribe();
    let recordExport = await nextExport(events);
    while (recordExport.status !== RecordExportStatus.FAILED) {
      recordExport = await nextExport(events);
    }
    expect(recordExport.downloadUrl).toBeNull();
    expect(partialFilePath).toBeDefined();
    expect(pendingFile).toMatchObject({ status: 'PENDING' });
    expect(
      await globalThis.testDataSource.query(
        'SELECT id FROM core.file WHERE id = $1',
        [pendingFile!.id],
      ),
    ).toEqual([]);
    expect(
      await storage.checkFileExists(
        exports.getFileResource({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          resourcePath: partialFilePath!,
        }),
      ),
    ).toBe(false);
  });

  it('cleans up a download when the storage stream fails', async () => {
    const recordExport = await exportToCompletion();
    const stored = await getExport(recordExport.id);
    jest.spyOn(storage, 'readFile').mockResolvedValue(
      Readable.from(
        (async function* () {
          yield 'Id,Name\n';
          throw new Error('Interrupted storage read');
        })(),
      ),
    );
    await expect(download(recordExport)).rejects.toThrow();
    await waitUntil(async () => !(await fileExists(stored)));
    expect(
      await cache.findDownload({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        id: stored.id,
      }),
    ).toBeUndefined();
  });
});
