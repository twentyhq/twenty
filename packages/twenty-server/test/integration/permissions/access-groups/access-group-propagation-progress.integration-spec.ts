import gql from 'graphql-tag';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FeatureFlagKey,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type AccessGroupPropagationProgress } from 'src/engine/permissions/internal/access-group/types/access-group-propagation-progress.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const SCHEMA = `"${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"`;
const PERSON_TABLE = `${SCHEMA}."person"`;

const readProgress = async (
  token?: string,
): Promise<{
  progress: AccessGroupPropagationProgress | undefined;
  errors: { extensions: { code: string } }[] | undefined;
}> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query AccessGroupPropagationProgress {
          accessGroupPropagationProgress {
            totalRecordCount
            remainingRecordCount
            isInProgress
          }
        }
      `,
    },
    token,
  );

  return {
    progress: response.body.data?.accessGroupPropagationProgress,
    errors: response.body.errors,
  };
};

describe('access group propagation progress (integration)', () => {
  let recordAccessGroupComputationService: RecordAccessGroupComputationService;
  let objectMetadataId: string;
  let jobTitleFieldMetadataId: string;
  let roleId: string;

  beforeAll(async () => {
    recordAccessGroupComputationService =
      getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      );

    [{ id: objectMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    [{ id: jobTitleFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'jobTitle'`,
      [objectMetadataId],
    );

    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Access group propagation progress',
        description: 'Access group propagation progress',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
      },
    });

    roleId = data.createOneRole.id;
    await revokeObjectRecordsPermissions({ roleId, objectMetadataId });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await waitForAllJobsToFinish();
    await global.app
      .get<CacheStorageService>(CacheStorageNamespace.EnginePermissions)
      .mdel(
        [
          'pending-recomputes',
          'total-record-count',
          'recomputed-record-count',
        ].map(
          (key) => `access-group-propagation:${SEED_APPLE_WORKSPACE_ID}:${key}`,
        ),
      );
    // The plan reads the planner statistics, which a freshly seeded table may not have yet
    await global.testDataSource.query(`ANALYZE ${PERSON_TABLE}`);
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
      value: false,
      expectToFail: false,
    });
    await deleteOneRole({ expectToFail: false, input: { idToDelete: roleId } });
    await waitForAllJobsToFinish();
    await global.testDataSource.query(
      `UPDATE ${PERSON_TABLE} SET "_accessGroupIds" = NULL`,
    );
    await global.testDataSource.query(`DELETE FROM ${SCHEMA}."accessGroup"`);
  });

  it('should report nothing while no propagation runs', async () => {
    expect((await readProgress()).progress).toEqual({
      totalRecordCount: 0,
      remainingRecordCount: 0,
      isInProgress: false,
    });
  });

  it('should refuse members who cannot manage roles', async () => {
    const { progress, errors } = await readProgress(
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(progress).toBeUndefined();
    expect(errors?.[0].extensions.code).toBe('FORBIDDEN');
  });

  it('should plan the records of a rule change and report them until they are recomputed', async () => {
    const [{ count }] = await global.testDataSource.query(
      `SELECT COUNT(*) AS "count" FROM ${PERSON_TABLE}`,
    );
    const personCount = Number(count);
    const recomputeRecords =
      recordAccessGroupComputationService.recomputeRecordAccessGroupIdsOfRecords.bind(
        recordAccessGroupComputationService,
      );
    let signalFirstBatchReached = () => {};
    let resumeRecompute = () => {};
    const firstBatchReached = new Promise<void>((resolve) => {
      signalFirstBatchReached = resolve;
    });
    const recomputeResumed = new Promise<void>((resolve) => {
      resumeRecompute = resolve;
    });

    jest
      .spyOn(
        recordAccessGroupComputationService,
        'recomputeRecordAccessGroupIdsOfRecords',
      )
      .mockImplementation(async (args) => {
        signalFirstBatchReached();
        await recomputeResumed;

        return recomputeRecords(args);
      });

    const predicateGroupId = v4();

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId,
        objectMetadataId,
        canReadRecords: true,
        predicateGroups: [
          {
            id: predicateGroupId,
            objectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
        predicates: [
          {
            id: v4(),
            fieldMetadataId: jobTitleFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Paris',
            rowLevelPermissionPredicateGroupId: predicateGroupId,
          },
        ],
      },
    });

    try {
      await firstBatchReached;

      const { progress } = await readProgress();

      expect(progress?.totalRecordCount).toBeGreaterThanOrEqual(personCount);
      expect(progress?.remainingRecordCount).toBe(progress?.totalRecordCount);
      expect(progress?.isInProgress).toBe(true);
    } finally {
      resumeRecompute();
    }

    await waitForAllJobsToFinish();

    expect((await readProgress()).progress).toEqual({
      totalRecordCount: 0,
      remainingRecordCount: 0,
      isInProgress: false,
    });
  });
});
