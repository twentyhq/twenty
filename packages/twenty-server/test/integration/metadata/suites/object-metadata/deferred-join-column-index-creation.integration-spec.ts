import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLE_WORKSPACE_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';
const SYSTEM_RELATION_TABLE_NAMES = [
  'attachment',
  'noteTarget',
  'taskTarget',
  'timelineActivity',
];

type JoinColumnIndexRow = {
  tablename: string;
  indisvalid: boolean;
};

const findJoinColumnIndexes = async (
  joinColumnName: string,
): Promise<JoinColumnIndexRow[]> =>
  global.testDataSource.query(
    `SELECT indexes.tablename, pg_index.indisvalid
     FROM pg_indexes indexes
     JOIN pg_class ON pg_class.relname = indexes.indexname
     JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
       AND pg_namespace.nspname = indexes.schemaname
     JOIN pg_index ON pg_index.indexrelid = pg_class.oid
     WHERE indexes.schemaname = $1
       AND indexes.indexdef LIKE $2
     ORDER BY indexes.tablename`,
    [APPLE_WORKSPACE_SCHEMA_NAME, `%("${joinColumnName}")%`],
  );

const findPendingOperationTableNames = async (
  objectMetadataNameSingular: string,
): Promise<string[]> => {
  const rows: { nameSingular: string }[] = await global.testDataSource.query(
    `SELECT "objectMetadata"."nameSingular"
     FROM core."deferredSchemaOperation" "deferredSchemaOperation"
     JOIN core."indexMetadata" "indexMetadata"
       ON "indexMetadata".id = "deferredSchemaOperation"."indexMetadataId"
     JOIN core."indexFieldMetadata" "indexFieldMetadata"
       ON "indexFieldMetadata"."indexMetadataId" = "indexMetadata".id
     JOIN core."fieldMetadata" "fieldMetadata"
       ON "fieldMetadata".id = "indexFieldMetadata"."fieldMetadataId"
     JOIN core."objectMetadata" "objectMetadata"
       ON "objectMetadata".id = "indexMetadata"."objectMetadataId"
     WHERE "deferredSchemaOperation"."workspaceId" = $1
       AND "deferredSchemaOperation".status = 'PENDING'
       AND "fieldMetadata"."relationTargetObjectMetadataId" = (
         SELECT id FROM core."objectMetadata"
         WHERE "workspaceId" = $1 AND "nameSingular" = $2
       )
     ORDER BY "objectMetadata"."nameSingular"`,
    [SEED_APPLE_WORKSPACE_ID, objectMetadataNameSingular],
  );

  return rows.map((row) => row.nameSingular);
};

const createObject = async (nameSingular: string): Promise<string> => {
  const {
    data: {
      createOneObject: { id },
    },
  } = await createOneObjectMetadata({
    expectToFail: false,
    input: {
      nameSingular,
      namePlural: `${nameSingular}s`,
      labelSingular: nameSingular,
      labelPlural: `${nameSingular}s`,
      icon: 'IconBox',
      isLabelSyncedWithName: false,
    },
  });

  return id;
};

const deleteObject = async (objectMetadataId: string) => {
  await updateOneObjectMetadata({
    expectToFail: false,
    input: {
      idToUpdate: objectMetadataId,
      updatePayload: { isActive: false },
    },
  });
  await deleteOneObjectMetadata({
    expectToFail: false,
    input: { idToDelete: objectMetadataId },
  });
};

describe('Deferred join column index creation', () => {
  let redisConnection: IORedis;
  let workspaceQueue: Queue;
  const createdObjectMetadataIds: string[] = [];

  beforeAll(async () => {
    redisConnection = new IORedis(
      process.env.REDIS_QUEUE_URL ??
        process.env.REDIS_URL ??
        'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );
    workspaceQueue = new Queue(MessageQueue.workspaceQueue, {
      connection: redisConnection,
    });
  });

  afterEach(async () => {
    await workspaceQueue.resume();
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_DEFERRED_SCHEMA_OPERATIONS_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await waitForAllJobsToFinish();

    for (const objectMetadataId of createdObjectMetadataIds) {
      await deleteObject(objectMetadataId);
    }

    await workspaceQueue.close();
    await redisConnection.quit();
  });

  it('should build join column indexes inline when the feature flag is disabled', async () => {
    createdObjectMetadataIds.push(await createObject('inlineIndexedGadget'));

    expect(await findPendingOperationTableNames('inlineIndexedGadget')).toEqual(
      [],
    );
    expect(await findJoinColumnIndexes('targetInlineIndexedGadgetId')).toEqual(
      SYSTEM_RELATION_TABLE_NAMES.map((tablename) => ({
        tablename,
        indisvalid: true,
      })),
    );
  });

  it('should defer join column indexes to the worker when the feature flag is enabled', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_DEFERRED_SCHEMA_OPERATIONS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await workspaceQueue.pause();

    createdObjectMetadataIds.push(await createObject('deferredIndexedGadget'));

    expect(
      await findPendingOperationTableNames('deferredIndexedGadget'),
    ).toEqual(SYSTEM_RELATION_TABLE_NAMES);
    expect(
      await findJoinColumnIndexes('targetDeferredIndexedGadgetId'),
    ).toEqual([]);

    await workspaceQueue.resume();
    await waitForAllJobsToFinish();

    expect(
      await findPendingOperationTableNames('deferredIndexedGadget'),
    ).toEqual([]);
    expect(
      await findJoinColumnIndexes('targetDeferredIndexedGadgetId'),
    ).toEqual(
      SYSTEM_RELATION_TABLE_NAMES.map((tablename) => ({
        tablename,
        indisvalid: true,
      })),
    );
  });
});
