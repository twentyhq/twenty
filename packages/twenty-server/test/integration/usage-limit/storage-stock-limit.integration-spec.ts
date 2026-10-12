import { createFileUploadMutation } from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { createClient } from 'redis';
import { FileFolder } from 'twenty-shared/types';
import { type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const FILE_FOLDER = FileFolder.Workflow;

describe('Storage stock limit', () => {
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let redis: Awaited<ReturnType<typeof createClient>>;
  let fileStorageService: FileStorageService;
  let applicationUniversalIdentifier: string;
  const writtenResourcePaths = new Set<string>();

  const refreshUsageLimitsCache = () =>
    getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['usageLimits']);

  const dropWorkspaceCounters = async () => {
    const keys = await redis.keys(`*{${SEED_APPLE_WORKSPACE_ID}}*`);

    if (keys.length > 0) {
      await redis.del(keys);
    }
  };

  const deleteStorageStockLimits = async () => {
    await usageLimitRepository.delete({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
    });
    await refreshUsageLimitsCache();
  };

  const saveStorageStockLimit = async ({
    unit,
    limitValue,
  }: {
    unit: UsageUnit;
    limitValue: number;
  }) => {
    await usageLimitRepository.save({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      resourceType: UsageResourceType.STORAGE,
      operationType: UsageOperationType.STORAGE_FILE,
      spenderType: 'workspace',
      spenderId: '',
      limitKind: 'stock',
      periodCount: 1,
      periodUnit: 'lifetime',
      unit,
      limitValue,
      burstValue: null,
      isInstanceOverride: true,
    });
    await refreshUsageLimitsCache();
  };

  const writeFile = ({
    resourcePath,
    content,
  }: {
    resourcePath: string;
    content: string;
  }) => {
    writtenResourcePaths.add(resourcePath);

    return fileStorageService.writeFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      fileFolder: FILE_FOLDER,
      resourcePath,
      sourceFile: content,
      settings: { isTemporaryFile: false, toDelete: false },
    });
  };

  const deleteFile = (resourcePath: string) =>
    fileStorageService.deleteFile({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      fileFolder: FILE_FOLDER,
      resourcePath,
    });

  const createFileUpload = (size: number) =>
    makeMetadataApiRequest({
      query: createFileUploadMutation,
      variables: { filename: 'stock-limit.txt', size, fileFolder: 'Workflow' },
    });

  const expectRefused = (response: { body: { errors?: unknown[] } }) => {
    expect(
      (response.body.errors?.[0] as { extensions?: { subCode?: string } })
        ?.extensions?.subCode,
    ).toBe('STOCK_EXHAUSTED');
  };

  beforeAll(async () => {
    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);
    redis = await createClient({ url: process.env.REDIS_URL }).connect();
    fileStorageService =
      getAppProviderByClassName<FileStorageService>('FileStorageService');

    const [workspaceCustomApplication]: { universalIdentifier: string }[] =
      await global.testDataSource.query(
        `SELECT application."universalIdentifier"
         FROM core."workspace" workspace
         JOIN core."application" application
           ON application.id = workspace."workspaceCustomApplicationId"
         WHERE workspace.id = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    applicationUniversalIdentifier =
      workspaceCustomApplication.universalIdentifier;

    await deleteStorageStockLimits();
  });

  beforeEach(async () => {
    await dropWorkspaceCounters();
  });

  afterEach(async () => {
    await deleteStorageStockLimits();

    for (const resourcePath of writtenResourcePaths) {
      await deleteFile(resourcePath);
    }

    writtenResourcePaths.clear();

    await dropWorkspaceCounters();
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('admits an overwrite that grows a file while over the file cap', async () => {
    const resourcePath = `stock-limit/${v4()}.txt`;

    await writeFile({ resourcePath, content: 'a' });
    await writeFile({
      resourcePath: `stock-limit/${v4()}.txt`,
      content: 'a',
    });
    await saveStorageStockLimit({ unit: UsageUnit.FILE, limitValue: 1 });

    expectRefused(await createFileUpload(1));

    await expect(
      writeFile({ resourcePath, content: 'a longer content' }),
    ).resolves.toBeDefined();
  });

  it('never lets a release drive the held bytes below zero', async () => {
    const resourcePath = `stock-limit/${v4()}.txt`;

    const file = await writeFile({ resourcePath, content: 'a' });

    await saveStorageStockLimit({ unit: UsageUnit.BYTE, limitValue: 100 });

    expectRefused(await createFileUpload(1_000));

    await global.testDataSource.query(
      `UPDATE core."file" SET size = $1 WHERE id = $2`,
      [1_000_000_000_000, file.id],
    );
    await deleteFile(resourcePath);
    writtenResourcePaths.delete(resourcePath);

    expectRefused(await createFileUpload(150));
  });
});
