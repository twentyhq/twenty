import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type RecordExportDownloadTokenJwtPayload } from 'src/engine/core-modules/record-export/types/record-export-download-token-jwt-payload.type';
import { type PendingFileCleanupCronJob } from 'src/engine/core-modules/file/file-upload/crons/jobs/pending-file-cleanup.cron.job';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';
import { isUserSessionToken } from 'src/engine/core-modules/user-session/utils/is-user-session-token.util';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { createClient } from 'graphql-sse';
import { setTimeout } from 'node:timers/promises';
import { Readable } from 'node:stream';
import request from 'supertest';
import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
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
import { type RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';
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
  let cache: CacheStorageService;
  let storage: FileStorageService;
  let query: RecordExportWorkspaceService;
  let originalRoleId: string;
  let roleId: string;
  let wasAsyncCsvExportEnabled: boolean;
  const connections: ReturnType<typeof createClient>[] = [];
  const exportIds = new Set<string>();
  const downloadTokens = new Map<string, string>();
  const sessionTokens = new Set<string>();
  const authenticationHeaders = (token: string): Record<string, string> =>
    isUserSessionToken(token)
      ? {
          Cookie: `${USER_SESSION_COOKIE_NAME}=${token}`,
          Origin: `http://localhost:${APP_PORT}`,
        }
      : { Authorization: `Bearer ${token}` };

  const subscribe = (
    parameters = input,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) => {
    const connection = createClient({
      url: `http://localhost:${APP_PORT}/metadata`,
      headers: authenticationHeaders(token),
      retryAttempts: 0,
    });
    connections.push(connection);
    const events = connection.iterate<{ exportRecords: RecordExportDTO }>({
      query: `subscription ExportRecords($input: CreateRecordExportInput!) {
        exportRecords(input: $input) {
          id filename progress downloadPath errorMessage
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
        if (isDefined(recordExport.errorMessage)) {
          throw new Error(recordExport.errorMessage ?? 'Export failed');
        }
        if (isDefined(recordExport.downloadPath)) {
          expect(recordExport.downloadPath).toMatch(
            new RegExp(`^/file/record-export/${recordExport.id}\\?token=.+$`),
          );
          downloadTokens.set(recordExport.id, token);
          return recordExport;
        }
      }
    } finally {
      connection.dispose();
    }
  };

  const download = (
    recordExport: RecordExportDTO,
    token = downloadTokens.get(recordExport.id) ??
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) => {
    return client
      .get(recordExport.downloadPath!)
      .set(authenticationHeaders(token));
  };
  const getExport = (id: string) =>
    exports.findOrThrow({ workspaceId: SEED_APPLE_WORKSPACE_ID, id });
  const fileResource = (resourcePath: string) => ({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    fileFolder: FileFolder.RecordExport,
    resourcePath,
  });
  const fileExists = (file: { id: string }) =>
    storage.checkFileExists(fileResource(`${file.id}.csv`));
  const fileRowExists = async (file: { id: string }): Promise<boolean> => {
    const rows = await globalThis.testDataSource.query(
      'SELECT id FROM core.file WHERE id = $1',
      [file.id],
    );

    return rows.length > 0;
  };
  const authorization = (
    recordExport: RecordExportDTO,
  ): Promise<RecordExportDownloadTokenJwtPayload> =>
    getAppProviderByClassName<JwtWrapperService>(
      'JwtWrapperService',
    ).verifyJwtToken(
      new URL(
        recordExport.downloadPath!,
        `http://localhost:${APP_PORT}`,
      ).searchParams.get('token')!,
    );
  const isConnected = async ({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }) => (await cache.get<string>(`{${workspaceId}}:active`)) === id;

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
    cache = global.app.get<CacheStorageService>(
      CacheStorageNamespace.EngineRecordExport,
    );
    storage = getAppProviderByClassName('FileStorageService');
    query = getAppProviderByClassName('RecordExportWorkspaceService');
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
    downloadTokens.clear();
    const sessions =
      getAppProviderByClassName<UserSessionService>('UserSessionService');
    for (const token of sessionTokens) {
      await sessions.revokeSessionByToken(
        token,
        UserSessionRevokedReason.UserSignOut,
      );
    }
    sessionTokens.clear();
    if (isDefined(roleId)) {
      await upsertRowLevelPermissionPredicates({
        input: {
          roleId,
          objectMetadataId: input.objectMetadataId,
          predicates: [],
          predicateGroups: [],
        },
      });
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
      await makeGraphqlApiRequest(
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
    expect(recordExport.progress).toBe(100);
    const stored = await getExport(recordExport.id);
    expect(await fileExists(stored)).toBe(true);
    const [file] = await globalThis.testDataSource.query(
      'SELECT id, status, size, "mimeType" FROM core.file WHERE "workspaceId" = $1 AND path = $2',
      [SEED_APPLE_WORKSPACE_ID, `${FileFolder.RecordExport}/${stored.id}.csv`],
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
    await expect(getExport(recordExport.id)).rejects.toThrow(
      'Export not found',
    );
    await download(recordExport).expect(404);
  });

  it('exports headers when the selection is empty', async () => {
    const recordExport = await exportToCompletion({
      ...input,
      filter: { id: { eq: v4() } },
    });
    expect(recordExport.progress).toBe(100);
    const response = await download(recordExport).expect(200);
    expect(response.text.replace(/^\uFEFF/, '')).toBe('Id,Name\n');
  });

  it('cancels on a lost SSE connection and allows the next export', async () => {
    const { connection, events } = subscribe();
    const recordExport = await nextExport(events);
    expect(recordExport.downloadPath).toBeNull();
    connection.dispose();
    await waitUntil(
      async () =>
        !(await isConnected({
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
      while (progress.progress < 99) {
        progress = await nextExport(first.events);
      }
      expect(progress.progress).toBe(99);
      expect(progress.downloadPath).toBeNull();
      const second = subscribe();
      await expect(nextExport(second.events)).rejects.toThrow();
    } finally {
      first.connection.dispose();
      releasePage();
    }
  });

  it('releases the workspace slot when the export queue cannot accept a job', async () => {
    const completed = await exportToCompletion();
    const requester = await query.resolveRequester(
      await authorization(completed),
    );
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
      exports.stream({
        parameters: input,
        authContext: requester,
        requestTokenHash: hashUserSessionToken(APPLE_JANE_ADMIN_ACCESS_TOKEN),
      }),
    ).rejects.toThrow('Queue unavailable');
    expect(await isConnected(failed!)).toBe(false);
    await expect(getExport(failed!.id)).rejects.toThrow('Export not found');
    const next = await exportToCompletion();
    await download(next).expect(200);
  });

  it('renews the lease during queue handoff and paused event consumption', async () => {
    const ready = await exportToCompletion();
    const requester = await query.resolveRequester(await authorization(ready));
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
    const subscription = exports.stream({
      parameters: input,
      authContext: requester,
      requestTokenHash: hashUserSessionToken(APPLE_JANE_ADMIN_ACCESS_TOKEN),
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
        expect(await isConnected(recordExport)).toBe(true);
      };
      await assertLeaseSurvives();
      releaseEnqueue();
      const events = await subscription;
      expect((await events.next()).done).toBe(false);
      await assertLeaseSurvives();
      await events.return?.();
      expect(await isConnected(recordExport)).toBe(false);
    } finally {
      releaseEnqueue();
      releasePage();
      const events = await subscription;
      await events.return?.();
    }
  });

  it('retrieves completed worker output when the SSE consumer missed all progress', async () => {
    const ready = await exportToCompletion();
    const requester = await query.resolveRequester(await authorization(ready));
    const enqueue = exports.enqueue.bind(exports);
    let recordExport: RecordExport;
    let jobId: string;
    jest.spyOn(exports, 'enqueue').mockImplementation(async (created) => {
      recordExport = created;
      exportIds.add(created.id);
      jobId = await enqueue(created);
      return jobId;
    });
    const events = await exports.stream({
      parameters: input,
      authContext: requester,
      requestTokenHash: hashUserSessionToken(APPLE_JANE_ADMIN_ACCESS_TOKEN),
    });
    try {
      const queue = global.app.get<MessageQueueService>(
        getQueueToken(MessageQueue.recordExportQueue),
      );
      await waitUntil(
        async () =>
          (await queue.getJobs([jobId]))[jobId]?.state === 'completed',
      );
      expect(await fileExists(await getExport(recordExport!.id))).toBe(true);
      const completed = await events.next();
      expect(completed.value).toMatchObject({
        progress: 100,
      });
      await download(completed.value).expect(200);
    } finally {
      await events.return?.();
    }
  });

  it.each([
    {
      progress: {
        processedRecordCount: companies.length,
        totalRecordCount: companies.length,
      },
      expectedProgress: 99,
    },
    {
      progress: {
        processedRecordCount: 'invalid',
        totalRecordCount: companies.length,
        errorMessage: 42,
      },
      expectedProgress: 0,
    },
    { progress: undefined, expectedProgress: 0 },
  ])(
    'does not offer an uploaded file when its worker failed with progress $progress',
    async ({ progress, expectedProgress }) => {
      const ready = await exportToCompletion();
      const queue = global.app.get<MessageQueueService>(
        getQueueToken(MessageQueue.recordExportQueue),
      );
      const claims = await authorization(ready);
      const recordExport: RecordExport = {
        ...claims,
        id: ready.id,
        parameters: input,
        createdAt: Date.now(),
      };
      jest.spyOn(queue, 'getJobs').mockResolvedValue({
        job: {
          id: 'job',
          data: recordExport,
          state: 'failed',
          attemptsMade: 1,
          timestamp: Date.now(),
          progress,
        },
      });
      const update = await exports.getProgress(recordExport, 'job');
      expect(await fileExists(await getExport(ready.id))).toBe(true);
      expect(update.downloadPath).toBeUndefined();
      expect(update.errorMessage).toContain('interrupted');
      expect(update.progress).toBe(expectedProgress);
    },
  );

  it('allows concurrent cleanup of the same completed export', async () => {
    const ready = await exportToCompletion();
    const identity = { workspaceId: SEED_APPLE_WORKSPACE_ID, id: ready.id };
    await Promise.all([exports.cancel(identity), exports.cancel(identity)]);
    expect(await fileExists(ready)).toBe(false);
    await expect(getExport(ready.id)).rejects.toThrow('Export not found');
    await expect(exports.cancel(identity)).resolves.toBeUndefined();
  });

  it('does not let cancellation of an older export release a newer connection', async () => {
    const ready = await exportToCompletion();
    const requester = await query.resolveRequester(await authorization(ready));
    const current = await exports.create({
      parameters: input,
      authContext: requester,
      requestTokenHash: hashUserSessionToken(APPLE_JANE_ADMIN_ACCESS_TOKEN),
    });
    exportIds.add(current.id);
    await exports.cancel({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      id: ready.id,
    });
    expect(await isConnected(current)).toBe(true);
    await exports.cancel(current);
    expect(await isConnected(current)).toBe(false);
  });

  it('closes the subscription when its connection lease expires', async () => {
    const ready = await exportToCompletion();
    const requester = await query.resolveRequester(await authorization(ready));
    const create = exports.create.bind(exports);
    let created: RecordExport;
    jest.spyOn(exports, 'create').mockImplementation(async (args) => {
      created = await create(args);
      exportIds.add(created.id);
      return created;
    });
    jest.spyOn(exports, 'enqueue').mockResolvedValue('not-started');
    const events = await exports.stream({
      parameters: input,
      authContext: requester,
      requestTokenHash: hashUserSessionToken(APPLE_JANE_ADMIN_ACCESS_TOKEN),
    });
    try {
      await cache.runScript({
        script: {
          name: 'expire-export-test-lease',
          source: "return redis.call('PEXPIRE', KEYS[1], 1)",
        },
        keys: [`{${SEED_APPLE_WORKSPACE_ID}}:active`],
        args: [],
      });
      await setTimeout(1500);
      expect(await isConnected(created!)).toBe(false);
      await expect(events.next()).rejects.toThrow('export was interrupted');
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
    await expect(getExport(stored.id)).rejects.toThrow('Export not found');
    expect(await fileExists(stored)).toBe(false);
  });

  it('rejects a download token used for another export and an invalid signature', async () => {
    const recordExport = await exportToCompletion();
    const url = new URL(
      recordExport.downloadPath!,
      `http://localhost:${APP_PORT}`,
    );
    await client
      .get(`/file/record-export/${v4()}${url.search}`)
      .set(authenticationHeaders(APPLE_JANE_ADMIN_ACCESS_TOKEN))
      .expect(403);
    await client
      .get(`${url.pathname}?token=invalid`)
      .set(authenticationHeaders(APPLE_JANE_ADMIN_ACCESS_TOKEN))
      .expect(403);
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

  it.each(['export', 'row'])(
    'stops generation when %s permission changes between pages',
    async (permission) => {
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
        if (isDefined(args[0].after)) {
          notifyPage();
          await pageGate;
        }
        return readPage(...args);
      });
      const { events } = subscribe(input, APPLE_JONY_MEMBER_ACCESS_TOKEN);
      try {
        let recordExport = await nextExport(events);
        await pageStarted;
        if (permission === 'export') {
          await changeRole({ canAccessAllTools: false });
        } else {
          await upsertContainsRlsPredicate({
            roleId,
            objectNameSingular: 'company',
            fieldName: 'name',
            value: companies[0].name,
          });
        }
        releasePage();
        while (!isDefined(recordExport.errorMessage)) {
          recordExport = await nextExport(events);
        }
        expect(recordExport.downloadPath).toBeNull();
        expect(recordExport.progress).toBeLessThan(100);
      } finally {
        releasePage();
      }
    },
  );

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
    expect(recordExport.progress).toBe(100);
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
    while (!isDefined(recordExport.errorMessage)) {
      recordExport = await nextExport(events);
    }
    expect(recordExport.downloadPath).toBeNull();
    expect(partialFilePath).toBeDefined();
    expect(pendingFile).toMatchObject({ status: 'PENDING' });
    expect(await fileRowExists(pendingFile!)).toBe(false);
    expect(await storage.checkFileExists(fileResource(partialFilePath!))).toBe(
      false,
    );
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
    await waitUntil(async () => !(await fileRowExists(stored)));
    await expect(getExport(stored.id)).rejects.toThrow('Export not found');
  });

  it('requires the exact requesting token without consuming the file on denied requests', async () => {
    const recordExport = await exportToCompletion();
    const stored = await getExport(recordExport.id);
    const url = new URL(
      recordExport.downloadPath!,
      `http://localhost:${APP_PORT}`,
    );
    const requester = await query.resolveRequester(
      await authorization(recordExport),
    );
    const tokens =
      getAppProviderByClassName<AccessTokenService>('AccessTokenService');
    const otherToken = await tokens.generateAccessToken({
      userId: requester.user.id,
      workspaceId: requester.workspace.id,
      authProvider: AuthProviderEnum.Password,
    });

    await client.get(url.pathname + url.search).expect(403);
    await download(recordExport, APPLE_JONY_MEMBER_ACCESS_TOKEN).expect(403);
    await download(recordExport, otherToken.token).expect(403);
    expect(await getExport(recordExport.id)).toEqual(stored);
    expect(await fileExists(stored)).toBe(true);
    await download(recordExport).expect(200);
  });

  it.each([false, true])(
    'requires the originating cookie session, revoked: %s',
    async (isRevoked) => {
      const ready = await exportToCompletion();
      const requester = await query.resolveRequester(
        await authorization(ready),
      );
      const sessions =
        getAppProviderByClassName<UserSessionService>('UserSessionService');
      const createSession = async () => {
        const { sessionToken } = await sessions.createSession({
          userId: requester.user.id,
          workspaceId: requester.workspace.id,
          userWorkspaceId: requester.userWorkspaceId,
          authProvider: AuthProviderEnum.Password,
          origin: 'renewal_bridge',
        });
        sessionTokens.add(sessionToken);
        return sessionToken;
      };
      const sessionToken = await createSession();
      const otherSessionToken = await createSession();
      const recordExport = await exportToCompletion(input, sessionToken);

      await download(recordExport, otherSessionToken).expect(403);
      await download(recordExport, APPLE_JANE_ADMIN_ACCESS_TOKEN).expect(403);
      if (isRevoked) {
        await sessions.revokeSessionByToken(
          sessionToken,
          UserSessionRevokedReason.UserSignOut,
        );
      }
      await download(recordExport).expect(isRevoked ? 403 : 200);
    },
  );

  it.each(['file-token', 'expired-export-token'])(
    'rejects a signed %s',
    async (tokenKind) => {
      const recordExport = await exportToCompletion();
      const stored = await getExport(recordExport.id);
      const jwt =
        getAppProviderByClassName<JwtWrapperService>('JwtWrapperService');
      const payload = {
        type: JwtTokenTypeEnum.FILE as const,
        sub: SEED_APPLE_WORKSPACE_ID,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        fileId: stored.id,
        ...(tokenKind === 'expired-export-token'
          ? {
              purpose: 'record-export',
              userWorkspaceId: (await authorization(recordExport))
                .userWorkspaceId,
            }
          : {}),
      };
      const token = await jwt.signAsyncOrThrow(payload, {
        expiresIn: tokenKind === 'expired-export-token' ? -1 : 60,
      });
      const url = new URL(
        recordExport.downloadPath!,
        `http://localhost:${APP_PORT}`,
      );
      await client
        .get(`${url.pathname}?token=${token}`)
        .set(authenticationHeaders(APPLE_JANE_ADMIN_ACCESS_TOKEN))
        .expect(403);
      await download(recordExport).expect(200);
    },
  );

  it.each([
    ['before-download', false],
    ['during-storage-open', false],
    ['before-download', true],
    ['during-storage-open', true],
  ] as const)(
    'invalidates the file when row permissions change %s, cleanup fails: %s',
    async (when, cleanupFails) => {
      const recordExport = await exportToCompletion(
        {
          ...input,
          filter: { id: { in: companies.slice(0, 2).map(({ id }) => id) } },
        },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      const stored = await getExport(recordExport.id);
      expect(recordExport.progress).toBe(100);
      const restrictRows = () =>
        upsertContainsRlsPredicate({
          roleId,
          objectNameSingular: 'company',
          fieldName: 'name',
          value: companies[0].name,
        });
      if (when === 'during-storage-open') {
        const readFile = storage.readFile.bind(storage);
        jest
          .spyOn(storage, 'readFile')
          .mockImplementationOnce(async (resource) => {
            await restrictRows();
            return readFile(resource);
          });
      } else {
        await restrictRows();
      }
      if (cleanupFails) {
        jest
          .spyOn(storage, 'deleteFile')
          .mockRejectedValueOnce(new Error('Storage deletion unavailable'));
      }
      const response = await download(recordExport).expect(403);
      expect(response.text).not.toContain(companies[1].id);
      if (cleanupFails) {
        expect(await fileExists(stored)).toBe(true);
        await globalThis.testDataSource.query(
          'UPDATE core.file SET "createdAt" = $3 WHERE "workspaceId" = $1 AND path = $2',
          [
            stored.workspaceId,
            `${FileFolder.RecordExport}/${stored.id}.csv`,
            new Date(Date.now() - 61 * 60_000),
          ],
        );
        const cleanup = getAppProviderByClassName<PendingFileCleanupCronJob>(
          'PendingFileCleanupCronJob',
        );
        await cleanup.handle();
      }
      expect(await fileExists(stored)).toBe(false);
    },
  );

  it.each(['access-check', 'token-signing'])(
    'rejects download path issuance when row permissions change during %s',
    async (when) => {
      const ready = await exportToCompletion(
        input,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      const stored = await getExport(ready.id);
      const claims = await authorization(ready);
      const restrictRows = () =>
        upsertContainsRlsPredicate({
          roleId,
          objectNameSingular: 'company',
          fieldName: 'name',
          value: companies[0].name,
        });
      if (when === 'access-check') {
        const resolveRequester = query.resolveRequester.bind(query);
        jest
          .spyOn(query, 'resolveRequester')
          .mockImplementationOnce(async (args) => {
            const result = await resolveRequester(args);
            await restrictRows();
            return result;
          });
      } else {
        const jwt =
          getAppProviderByClassName<JwtWrapperService>('JwtWrapperService');
        const sign = jwt.signAsyncOrThrow.bind(jwt);
        jest
          .spyOn(jwt, 'signAsyncOrThrow')
          .mockImplementationOnce(async (...args) => {
            const result = await sign(...args);
            await restrictRows();
            return result;
          });
      }
      await expect(
        exports.getDownloadPath({ ...claims, id: stored.id }),
      ).rejects.toThrow('Access permissions have changed');
      await download(ready).expect(403);
      await expect(getExport(stored.id)).rejects.toThrow('Export not found');
      expect(await fileExists(stored)).toBe(false);
    },
  );
});
