/* @license Enterprise */

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  FeatureFlagKey,
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DocumentNode } from 'graphql';
import { v4 } from 'uuid';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreOneOperationFactory } from 'test/integration/graphql/utils/restore-one-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { setRecordPrivate } from 'test/integration/metadata/suites/private-record/utils/set-record-private.util';
import { createRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/create-related-record-path.util';
import { deleteRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/delete-related-record-path.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordEventPermissionsReadService } from 'src/engine/permissions/record-event-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const PROJECT_NAME = 'pathAccessProject';
const TASK_NAME = 'pathAccessTask';
const workspaceId = SEED_APPLE_WORKSPACE_ID;
const SCHEMA = `"${getWorkspaceSchemaName(workspaceId)}"`;
const PATH_FEATURE_FLAGS = [
  FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
];

describe('Record access through related record paths', () => {
  let projectObjectMetadataId: string;
  let taskObjectMetadataId: string;
  let projectTasksFieldMetadataId: string;
  let projectRuleRoleId: string;
  let isProjectRuleRoleDeleted = false;
  let pathId: string;
  let projectId: string;
  let projectFieldNameOnTask: string;
  let projectRuleCompactId: number;
  let taskOfProjectId: string;
  let taskWithoutProjectId: string;

  const createObject = async (nameSingular: string): Promise<string> => {
    const { data } = await createOneObjectMetadata({
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

    return data.createOneObject.id;
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

  const createRecord = async ({
    objectMetadataSingularName,
    data,
  }: {
    objectMetadataSingularName: string;
    data: object;
  }): Promise<string> => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName,
        gqlFields: 'id',
        data,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return Object.values<{ id: string }>(response.body.data)[0].id;
  };

  const findJonyAuthContext = () =>
    resolveWorkspaceMemberAuthContext({
      workspaceId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

  const canJonyReadTask = async (recordId: string) =>
    getAppProviderByClassName<RecordPermissionsReadService>(
      'RecordPermissionsReadService',
    ).canAccessRecords({
      principals:
        await getAppProviderByClassName<PrincipalPermissionsReadService>(
          'PrincipalPermissionsReadService',
        ).resolvePermissionsPrincipals({
          authContext: await findJonyAuthContext(),
        }),
      objectMetadataId: taskObjectMetadataId,
      operationType: 'read',
      recordIds: [recordId],
    });

  const listTasksAsJony = () =>
    makeGraphqlApiRequestWithMemberRole(
      findManyOperationFactory({
        objectMetadataSingularName: TASK_NAME,
        objectMetadataPluralName: `${TASK_NAME}s`,
        gqlFields: 'id',
      }),
    );

  const findTaskIdsListedByJony = async (): Promise<string[]> => {
    const response = await listTasksAsJony();

    expect(response.body.errors).toBeUndefined();

    return response.body.data[`${TASK_NAME}s`].edges
      .map(({ node }: { node: { id: string } }) => node.id)
      .sort();
  };

  const findEventRecordIdsReadableByJony = async ({
    objectMetadataId,
    eventName,
    snapshotKey,
    recordIds,
  }: {
    objectMetadataId: string;
    eventName: string;
    snapshotKey: 'before' | 'after';
    recordIds: string[];
  }) => {
    const { flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(workspaceId, ['flatObjectMetadataMaps']);
    const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      throw new Error('Object metadata is missing');
    }

    const readableEvents =
      await getAppProviderByClassName<RecordEventPermissionsReadService>(
        'RecordEventPermissionsReadService',
      ).filterReadableEvents({
        authContext: await findJonyAuthContext(),
        eventBatch: {
          name: eventName,
          workspaceId,
          objectMetadata,
          events: recordIds.map((recordId) => ({
            recordId,
            properties: { [snapshotKey]: { id: recordId } },
          })) as ObjectRecordEvent[],
        },
      });

    return readableEvents.map(({ recordId }) => recordId);
  };

  const findTaskEventRecordIdsReadableByJony = () =>
    findEventRecordIdsReadableByJony({
      objectMetadataId: taskObjectMetadataId,
      eventName: `${TASK_NAME}.updated`,
      snapshotKey: 'after',
      recordIds: [taskOfProjectId, taskWithoutProjectId],
    });

  const createProjectTasksPath = async () => {
    const response = await createRelatedRecordPath({
      objectMetadataId: projectObjectMetadataId,
      firstFieldMetadataId: projectTasksFieldMetadataId,
    });

    expect(response.body.errors).toBeUndefined();
    pathId = response.body.data.createRelatedRecordPath.id;
  };

  const createRoleWithProjectRule = async () => {
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Path access project rule',
        description: 'Path access project rule',
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });
    const [{ id: nameFieldMetadataId }] = await global.testDataSource.query(
      `SELECT "id" FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND "name" = 'name'`,
      [projectObjectMetadataId],
    );
    const predicateGroupId = v4();

    projectRuleRoleId = data.createOneRole.id;

    await revokeObjectRecordsPermissions({
      roleId: projectRuleRoleId,
      objectMetadataId: projectObjectMetadataId,
    });
    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: projectRuleRoleId,
        objectMetadataId: projectObjectMetadataId,
        canReadRecords: true,
        predicateGroups: [
          {
            id: predicateGroupId,
            objectMetadataId: projectObjectMetadataId,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          },
        ],
        predicates: [
          {
            id: v4(),
            fieldMetadataId: nameFieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Readable',
            rowLevelPermissionPredicateGroupId: predicateGroupId,
          },
        ],
      },
    });
  };

  const deleteRoleWithProjectRule = async () => {
    if (isProjectRuleRoleDeleted) {
      return;
    }

    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: projectRuleRoleId },
    });
    isProjectRuleRoleDeleted = true;
  };

  const runAndWaitForJobs = async (operation: {
    query: DocumentNode;
    variables: Record<string, unknown>;
  }) => {
    const response = await makeGraphqlApiRequest(operation);

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();
  };

  const findTaskAccessGroupIds = async (recordId: string) => {
    const [{ accessGroupIds }]: { accessGroupIds: number[] | null }[] =
      await global.testDataSource.query(
        `SELECT "_accessGroupIds" AS "accessGroupIds" FROM ${SCHEMA}."_${TASK_NAME}" WHERE "id" = $1`,
        [recordId],
      );

    return accessGroupIds ?? [];
  };

  beforeAll(async () => {
    for (const featureFlag of PATH_FEATURE_FLAGS) {
      await updateFeatureFlag({
        featureFlag,
        value: true,
        expectToFail: false,
      });
    }

    projectObjectMetadataId = await createObject(PROJECT_NAME);
    taskObjectMetadataId = await createObject(TASK_NAME);

    const projectTasksField = await createRelationBetweenObjects({
      objectMetadataId: projectObjectMetadataId,
      targetObjectMetadataId: taskObjectMetadataId,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.ONE_TO_MANY,
      name: 'tasks',
      label: 'Tasks',
      targetFieldLabel: 'Project',
      targetFieldIcon: 'IconBox',
    });

    await createRoleWithProjectRule();
    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: (await findOneRoleByLabel({ label: 'Member' })).id,
        objectPermissions: [
          {
            objectMetadataId: taskObjectMetadataId,
            canReadObjectRecords: false,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });

    projectFieldNameOnTask = `${projectTasksField.relation.targetFieldMetadata.name}Id`;
    projectId = await createRecord({
      objectMetadataSingularName: PROJECT_NAME,
      data: { name: 'Readable project' },
    });

    taskOfProjectId = await createRecord({
      objectMetadataSingularName: TASK_NAME,
      data: {
        name: 'Task of the project',
        [projectFieldNameOnTask]: projectId,
      },
    });
    taskWithoutProjectId = await createRecord({
      objectMetadataSingularName: TASK_NAME,
      data: { name: 'Task without project' },
    });

    projectTasksFieldMetadataId = projectTasksField.id;

    await createProjectTasksPath();
  });

  afterAll(async () => {
    try {
      await deleteRoleWithProjectRule();
      await deleteObject(projectObjectMetadataId);
      await deleteObject(taskObjectMetadataId);
    } finally {
      for (const featureFlag of PATH_FEATURE_FLAGS) {
        await updateFeatureFlag({
          featureFlag,
          value: false,
          expectToFail: false,
        });
      }

      await global.testDataSource.query(`DELETE FROM ${SCHEMA}."accessGroup"`);
    }
  });

  it('should grant a known record related to a readable source record', async () => {
    expect(await canJonyReadTask(taskOfProjectId)).toBe(true);
    expect(await canJonyReadTask(taskWithoutProjectId)).toBe(false);
  });

  it('should deliver the events of records related to a readable source record only', async () => {
    expect(await findTaskEventRecordIdsReadableByJony()).toEqual([
      taskOfProjectId,
    ]);
  });

  it('should deliver the event of a destroyed record from its last snapshot', async () => {
    const destroyedProjectId = v4();

    expect(
      await findEventRecordIdsReadableByJony({
        objectMetadataId: projectObjectMetadataId,
        eventName: `${PROJECT_NAME}.destroyed`,
        snapshotKey: 'before',
        recordIds: [destroyedProjectId],
      }),
    ).toEqual([destroyedProjectId]);
  });

  it('should store the groups of the source record on the records related to it', async () => {
    await getAppProviderByClassName<AccessGroupSyncService>(
      'AccessGroupSyncService',
    ).syncAccessGroups(workspaceId);

    for (const objectMetadataId of [
      projectObjectMetadataId,
      taskObjectMetadataId,
    ]) {
      await getAppProviderByClassName<RecordAccessGroupComputationService>(
        'RecordAccessGroupComputationService',
      ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
        workspaceId,
        objectMetadataId,
      });
    }

    [{ compactId: projectRuleCompactId }] = await global.testDataSource.query(
      `SELECT "compactId" FROM ${SCHEMA}."accessGroup" WHERE "roleId" = $1 AND "objectMetadataId" = $2 AND "rowLevelPermissionPredicateGroupId" IS NOT NULL`,
      [projectRuleRoleId, projectObjectMetadataId],
    );

    expect(await findTaskAccessGroupIds(taskOfProjectId)).toContain(
      projectRuleCompactId,
    );
    expect(await findTaskAccessGroupIds(taskWithoutProjectId)).not.toContain(
      projectRuleCompactId,
    );
  });

  it('should list only the records related to a readable source record', async () => {
    expect(await findTaskIdsListedByJony()).toEqual([taskOfProjectId]);
  });

  it('should count only the records related to a readable source record', async () => {
    const response = await makeGraphqlApiRequestWithMemberRole(
      groupByOperationFactory({
        objectMetadataSingularName: TASK_NAME,
        objectMetadataPluralName: `${TASK_NAME}s`,
        groupBy: [{ name: true }],
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data[`${TASK_NAME}sGroupBy`].map(
        ({ totalCount }: { totalCount: number }) => totalCount,
      ),
    ).toEqual([1]);
  });

  it('should update the related records when the source record enters or leaves the rule', async () => {
    await runAndWaitForJobs(
      updateOneOperationFactory({
        objectMetadataSingularName: PROJECT_NAME,
        gqlFields: 'id',
        recordId: projectId,
        data: { name: 'Hidden project' },
      }),
    );

    expect(await findTaskAccessGroupIds(taskOfProjectId)).not.toContain(
      projectRuleCompactId,
    );

    await runAndWaitForJobs(
      updateOneOperationFactory({
        objectMetadataSingularName: PROJECT_NAME,
        gqlFields: 'id',
        recordId: projectId,
        data: { name: 'Readable project' },
      }),
    );

    expect(await findTaskAccessGroupIds(taskOfProjectId)).toContain(
      projectRuleCompactId,
    );
  });

  it('should update a record when it is linked to or unlinked from a source record', async () => {
    const setProjectOfTaskWithoutProject = (linkedProjectId: string | null) =>
      runAndWaitForJobs(
        updateOneOperationFactory({
          objectMetadataSingularName: TASK_NAME,
          gqlFields: 'id',
          recordId: taskWithoutProjectId,
          data: { [projectFieldNameOnTask]: linkedProjectId },
        }),
      );

    await setProjectOfTaskWithoutProject(projectId);

    expect(await findTaskAccessGroupIds(taskWithoutProjectId)).toContain(
      projectRuleCompactId,
    );
    expect(await findTaskIdsListedByJony()).toEqual(
      [taskOfProjectId, taskWithoutProjectId].sort(),
    );

    await setProjectOfTaskWithoutProject(null);

    expect(await findTaskIdsListedByJony()).toEqual([taskOfProjectId]);

    expect(await findTaskAccessGroupIds(taskWithoutProjectId)).not.toContain(
      projectRuleCompactId,
    );
  });

  it('should update the related records when the source record is deleted or restored', async () => {
    await runAndWaitForJobs(
      deleteOneOperationFactory({
        objectMetadataSingularName: PROJECT_NAME,
        gqlFields: 'id',
        recordId: projectId,
      }),
    );

    expect(await findTaskAccessGroupIds(taskOfProjectId)).not.toContain(
      projectRuleCompactId,
    );

    await runAndWaitForJobs(
      restoreOneOperationFactory({
        objectMetadataSingularName: PROJECT_NAME,
        gqlFields: 'id',
        recordId: projectId,
      }),
    );

    expect(await findTaskAccessGroupIds(taskOfProjectId)).toContain(
      projectRuleCompactId,
    );
  });

  it('should stop listing the related records while the source record is private', async () => {
    const setProjectPrivate = async (isPrivate: boolean) => {
      const response = await setRecordPrivate({
        objectMetadataId: projectObjectMetadataId,
        recordId: projectId,
        isPrivate,
      });

      expect(response.body.errors).toBeUndefined();
      await waitForAllJobsToFinish();
    };

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED,
      value: true,
      expectToFail: false,
    });

    try {
      await setProjectPrivate(true);

      expect(await findTaskIdsListedByJony()).toEqual([]);

      await setProjectPrivate(false);

      expect(await findTaskIdsListedByJony()).toEqual([taskOfProjectId]);
    } finally {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED,
        value: false,
        expectToFail: false,
      });
    }
  });

  it('should list the records related to a private source record its creator reads', async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED,
      value: true,
      expectToFail: false,
    });

    const createdProject = await makeGraphqlApiRequestWithMemberRole(
      createOneOperationFactory({
        objectMetadataSingularName: PROJECT_NAME,
        gqlFields: 'id',
        data: { name: 'Readable project of Jony' },
      }),
    );

    expect(createdProject.body.errors).toBeUndefined();

    const projectOfJonyId = Object.values<{ id: string }>(
      createdProject.body.data,
    )[0].id;
    const taskOfProjectOfJonyId = await createRecord({
      objectMetadataSingularName: TASK_NAME,
      data: {
        name: 'Task of the project of Jony',
        [projectFieldNameOnTask]: projectOfJonyId,
      },
    });

    try {
      const response = await setRecordPrivate({
        objectMetadataId: projectObjectMetadataId,
        recordId: projectOfJonyId,
        isPrivate: true,
        accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      expect(response.body.errors).toBeUndefined();
      await waitForAllJobsToFinish();

      expect(await findTaskIdsListedByJony()).toEqual(
        [taskOfProjectId, taskOfProjectOfJonyId].sort(),
      );
    } finally {
      await runAndWaitForJobs(
        deleteOneOperationFactory({
          objectMetadataSingularName: TASK_NAME,
          gqlFields: 'id',
          recordId: taskOfProjectOfJonyId,
        }),
      );
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED,
        value: false,
        expectToFail: false,
      });
    }
  });

  it('should let a record be updated through the source record it is related to', async () => {
    const updateTaskAsJony = (recordId: string) =>
      makeGraphqlApiRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: TASK_NAME,
          gqlFields: 'id',
          recordId,
          data: { name: 'Renamed by Jony' },
        }),
      );

    expect(
      (await updateTaskAsJony(taskOfProjectId)).body.errors,
    ).toBeUndefined();
    expect(
      (await updateTaskAsJony(taskWithoutProjectId)).body.errors,
    ).toBeDefined();
  });

  it('should stop granting once the path is deleted and grant again once it is back', async () => {
    await deleteRelatedRecordPath(pathId);

    expect(await canJonyReadTask(taskOfProjectId)).toBe(false);
    expect(await findTaskEventRecordIdsReadableByJony()).toEqual([]);
    expect((await listTasksAsJony()).body.errors).toBeDefined();

    await createProjectTasksPath();
    await waitForAllJobsToFinish();

    expect(await canJonyReadTask(taskOfProjectId)).toBe(true);
    expect(await findTaskIdsListedByJony()).toEqual([taskOfProjectId]);
  });

  it('should not follow the path once no RLS rule restricts its source object', async () => {
    await deleteRoleWithProjectRule();

    expect(await canJonyReadTask(taskOfProjectId)).toBe(false);
    expect((await listTasksAsJony()).body.errors).toBeDefined();
  });
});
