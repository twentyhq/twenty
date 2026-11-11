/* @license Enterprise */

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/create-related-record-path.util';
import { deleteRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/delete-related-record-path.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { resolveWorkspaceMemberAuthContext } from 'test/integration/utils/resolve-workspace-member-auth-context.util';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type RecordEventPermissionsReadService } from 'src/engine/permissions/record-event-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const PROJECT_NAME = 'pathAccessProject';
const TASK_NAME = 'pathAccessTask';
const workspaceId = SEED_APPLE_WORKSPACE_ID;

describe('Record access through related record paths', () => {
  let projectObjectMetadataId: string;
  let taskObjectMetadataId: string;
  let pathId: string;
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

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
      value: true,
      expectToFail: false,
    });

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

    const projectId = await createRecord({
      objectMetadataSingularName: PROJECT_NAME,
      data: { name: 'Readable project' },
    });

    taskOfProjectId = await createRecord({
      objectMetadataSingularName: TASK_NAME,
      data: {
        name: 'Task of the project',
        [`${projectTasksField.relation.targetFieldMetadata.name}Id`]: projectId,
      },
    });
    taskWithoutProjectId = await createRecord({
      objectMetadataSingularName: TASK_NAME,
      data: { name: 'Task without project' },
    });

    const response = await createRelatedRecordPath({
      objectMetadataId: projectObjectMetadataId,
      firstFieldMetadataId: projectTasksField.id,
    });

    expect(response.body.errors).toBeUndefined();
    pathId = response.body.data.createRelatedRecordPath.id;
  });

  afterAll(async () => {
    try {
      await deleteObject(projectObjectMetadataId);
      await deleteObject(taskObjectMetadataId);
    } finally {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
        value: false,
        expectToFail: false,
      });
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

  it('should stop granting once the path is deleted', async () => {
    await deleteRelatedRecordPath(pathId);

    expect(await canJonyReadTask(taskOfProjectId)).toBe(false);
    expect(await findTaskEventRecordIdsReadableByJony()).toEqual([]);
  });
});
