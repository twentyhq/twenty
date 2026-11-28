/* @license Enterprise */

import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow, capitalize } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { revokeObjectRecordsPermissions } from 'test/integration/metadata/suites/object-permission/utils/revoke-object-records-permissions.util';
import { setRecordPrivate } from 'test/integration/metadata/suites/private-record/utils/set-record-private.util';
import { createRelatedRecordPath } from 'test/integration/metadata/suites/related-record-path/utils/create-related-record-path.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { buildPermissionTestTimelineValue } from 'test/integration/permissions/utils/build-permission-test-timeline-value.util';
import { createPermissionTestApiKeyToken } from 'test/integration/permissions/utils/create-permission-test-api-key-token.util';
import { createPermissionTestRole } from 'test/integration/permissions/utils/create-permission-test-role.util';
import { createPermissionTestVisibilityTierRole } from 'test/integration/permissions/utils/create-permission-test-visibility-tier-role.util';
import {
  type PermissionTestTimelineFixture,
  type PermissionTestTimelineRecordName,
  type PermissionTestTimelineRole,
} from 'test/integration/permissions/utils/permission-test-timeline-fixture.type';
import {
  type PermissionTestRoleGrant,
  type PermissionTestWorkspace,
} from 'test/integration/permissions/utils/permission-test-workspace.type';
import { setRecordShareOperationFactory } from 'test/integration/permissions/utils/set-record-share-operation-factory.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';

const ITEM_OBJECT_NAME_SINGULAR = 'accessRecordItem';

type ObjectFields = { id: string; fieldIdsByName: Map<string, string> };

type TimelineRecord = {
  record: PermissionTestTimelineRecordName;
  objectNameSingular: string;
  recordId: string;
};

const findObjectFieldsOrThrow = async ({
  objectNameSingular,
  adminAccessToken,
}: {
  objectNameSingular: string;
  adminAccessToken: string;
}): Promise<ObjectFields> => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: {}, paging: { first: 1000 } },
    gqlFields: 'id nameSingular fieldsList { id name }',
    expectToFail: false,
    token: adminAccessToken,
  });
  const object = objects.find(
    (candidate) => candidate.nameSingular === objectNameSingular,
  );

  assertIsDefinedOrThrow(object);

  return {
    id: object.id,
    fieldIdsByName: new Map(
      (object.fieldsList ?? []).map((field) => [field.name, field.id]),
    ),
  };
};

const findFieldIdOrThrow = ({
  objectFields,
  fieldName,
}: {
  objectFields: ObjectFields;
  fieldName: string;
}): string => {
  const fieldId = objectFields.fieldIdsByName.get(fieldName);

  assertIsDefinedOrThrow(fieldId);

  return fieldId;
};

const createRecordOrThrow = async ({
  objectNameSingular,
  data,
  adminAccessToken,
}: {
  objectNameSingular: string;
  data: object;
  adminAccessToken: string;
}): Promise<string> => {
  const response = await makeGraphqlApiRequest(
    createOneOperationFactory({
      objectMetadataSingularName: objectNameSingular,
      gqlFields: 'id',
      data,
    }),
    adminAccessToken,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data[`create${capitalize(objectNameSingular)}`].id;
};

const createItemObjectWithItemsField = async ({
  objectMetadataId,
  adminAccessToken,
}: Pick<PermissionTestWorkspace, 'objectMetadataId' | 'adminAccessToken'>) => {
  const { data } = await createOneObjectMetadata({
    input: {
      nameSingular: ITEM_OBJECT_NAME_SINGULAR,
      namePlural: `${ITEM_OBJECT_NAME_SINGULAR}s`,
      labelSingular: ITEM_OBJECT_NAME_SINGULAR,
      labelPlural: `${ITEM_OBJECT_NAME_SINGULAR}s`,
      icon: 'IconBox',
    },
    gqlFields: 'id',
    expectToFail: false,
    token: adminAccessToken,
  });
  const itemsField = await createRelationBetweenObjects({
    objectMetadataId,
    targetObjectMetadataId: data.createOneObject.id,
    type: FieldMetadataType.RELATION,
    relationType: RelationType.ONE_TO_MANY,
    name: 'items',
    label: 'Items',
    targetFieldLabel: 'Access record',
    targetFieldIcon: 'IconBox',
    token: adminAccessToken,
  });

  return {
    itemObjectMetadataId: data.createOneObject.id,
    itemsFieldId: itemsField.id,
    accessRecordColumnNameOnItem: `${itemsField.relation.targetFieldMetadata.name}Id`,
  };
};

const createSummaryField = ({
  objectMetadataId,
  adminAccessToken,
}: Pick<PermissionTestWorkspace, 'adminAccessToken'> & {
  objectMetadataId: string;
}) =>
  createOneFieldMetadata({
    input: {
      name: 'summary',
      label: 'summary',
      type: FieldMetadataType.TEXT,
      objectMetadataId,
    },
    gqlFields: 'id',
    expectToFail: false,
    token: adminAccessToken,
  });

const createPrivateRecord = async ({
  workspaceId,
  objectMetadataId,
  objectNameSingular,
  adminAccessToken,
}: Pick<
  PermissionTestWorkspace,
  'workspaceId' | 'objectMetadataId' | 'objectNameSingular' | 'adminAccessToken'
>): Promise<string> => {
  await updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED,
    value: true,
    workspaceId,
    expectToFail: false,
  });

  const recordId = await createRecordOrThrow({
    objectNameSingular,
    data: { status: 'active', category: 'core', region: 'europe' },
    adminAccessToken,
  });
  const response = await setRecordPrivate({
    objectMetadataId,
    recordId,
    isPrivate: true,
    accessToken: adminAccessToken,
  });

  expect(response.body.errors).toBeUndefined();

  return recordId;
};

const denyFieldRead = ({
  roleId,
  objectMetadataId,
  fieldMetadataId,
  adminAccessToken,
}: Pick<PermissionTestWorkspace, 'adminAccessToken'> & {
  roleId: string;
  objectMetadataId: string;
  fieldMetadataId: string;
}) =>
  upsertFieldPermissions({
    input: {
      roleId,
      fieldPermissions: [
        {
          objectMetadataId,
          fieldMetadataId,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
        },
      ],
    },
    expectToFail: false,
    token: adminAccessToken,
  });

const createTokens = async ({
  workspace,
  accessRecordFields,
  itemObjectMetadataId,
  itemsFieldId,
}: {
  workspace: Pick<
    PermissionTestWorkspace,
    | 'objectMetadataId'
    | 'visibilityTierFieldMetadataId'
    | 'adminAccessToken'
    | 'roleIds'
    | 'apiKeyIds'
    | 'recordIds'
  >;
  accessRecordFields: ObjectFields;
  itemObjectMetadataId: string;
  itemsFieldId: string;
}): Promise<Record<PermissionTestTimelineRole, string>> => {
  const { adminAccessToken, objectMetadataId } = workspace;
  const createRole = ({
    label,
    grant,
  }: {
    label: string;
    grant: PermissionTestRoleGrant;
  }) =>
    createPermissionTestRole({
      label,
      grant,
      rowLevelFilter: {
        fieldMetadataId: findFieldIdOrThrow({
          objectFields: accessRecordFields,
          fieldName: 'status',
        }),
        value: 'active',
      },
      objectMetadataId,
      accessToken: adminAccessToken,
    });
  const createToken = (roleId: string) =>
    createPermissionTestApiKeyToken({ roleId, adminAccessToken });
  const generateToken = async (apiKeyId: string): Promise<string> =>
    (
      await generateApiKeyToken({
        apiKeyId,
        accessToken: adminAccessToken,
        expiresAt: '2099-01-01T00:00:00Z',
      })
    ).body.data.generateApiKeyToken.token;

  const objectDeniedRoleId = await createRole({
    label: 'Timeline object denied',
    grant: 'allRecords',
  });

  await revokeObjectRecordsPermissions({
    roleId: objectDeniedRoleId,
    objectMetadataId,
    token: adminAccessToken,
  });

  const summaryDeniedRoleId = await createRole({
    label: 'Timeline summary denied',
    grant: 'allRecords',
  });

  await denyFieldRead({
    roleId: summaryDeniedRoleId,
    objectMetadataId,
    fieldMetadataId: findFieldIdOrThrow({
      objectFields: accessRecordFields,
      fieldName: 'summary',
    }),
    adminAccessToken,
  });

  const timelineRelationDeniedRoleId = await createRole({
    label: 'Timeline relation denied',
    grant: 'allRecords',
  });

  await denyFieldRead({
    roleId: timelineRelationDeniedRoleId,
    objectMetadataId,
    fieldMetadataId: findFieldIdOrThrow({
      objectFields: accessRecordFields,
      fieldName: 'timelineActivities',
    }),
    adminAccessToken,
  });

  const sharedRecordRoleId = await createRole({
    label: 'Timeline shared record',
    grant: 'rowLevel',
  });
  const shareResponse = await makeMetadataApiRequest(
    setRecordShareOperationFactory({
      objectMetadataId,
      recordId: workspace.recordIds.outsideStatusFilter,
      principal: { roleId: sharedRecordRoleId },
      accessLevel: RecordShareAccessLevel.READ,
    }),
    adminAccessToken,
  );

  expect(shareResponse.body.errors).toBeUndefined();

  const lowVisibilityTierRoleId = await createPermissionTestVisibilityTierRole({
    workspace,
    label: 'Timeline low visibility tier',
    ruleId: v4(),
    visibilityTiers: ['LOW'],
  });

  await revokeObjectRecordsPermissions({
    roleId: workspace.roleIds.rowLevel,
    objectMetadataId: itemObjectMetadataId,
    token: adminAccessToken,
  });

  const pathResponse = await createRelatedRecordPath({
    objectMetadataId,
    firstFieldMetadataId: itemsFieldId,
    accessToken: adminAccessToken,
  });

  expect(pathResponse.body.errors).toBeUndefined();

  return {
    allRecords: await generateToken(workspace.apiKeyIds.allRecords),
    rowLevel: await generateToken(workspace.apiKeyIds.rowLevel),
    objectDenied: await createToken(objectDeniedRoleId),
    summaryDenied: await createToken(summaryDeniedRoleId),
    timelineRelationDenied: await createToken(timelineRelationDeniedRoleId),
    sharedRecord: await createToken(sharedRecordRoleId),
    lowVisibilityTier: await createToken(lowVisibilityTierRoleId),
  };
};

const recomputeAccessGroups = async ({
  workspaceId,
  objectMetadataIds,
}: {
  workspaceId: string;
  objectMetadataIds: string[];
}) => {
  await getAppProviderByClassName<AccessGroupSyncService>(
    'AccessGroupSyncService',
  ).syncAccessGroups({ workspaceId });
  await getAppProviderByClassName<DeferredWorkspaceOperationRunnerService>(
    'DeferredWorkspaceOperationRunnerService',
  ).runPendingOperations(workspaceId);

  for (const objectMetadataId of objectMetadataIds) {
    await getAppProviderByClassName<RecordAccessGroupComputationService>(
      'RecordAccessGroupComputationService',
    ).recomputeRecordAccessGroupIdsOfAllObjectRecords({
      workspaceId,
      objectMetadataId,
    });
  }
};

const updateRecordWithTimelineValues = async ({
  timelineRecord: { record, objectNameSingular, recordId },
  adminAccessToken,
}: {
  timelineRecord: TimelineRecord;
  adminAccessToken: string;
}) => {
  const response = await makeGraphqlApiRequest(
    updateOneOperationFactory({
      objectMetadataSingularName: objectNameSingular,
      gqlFields: 'id',
      recordId,
      data: {
        name: buildPermissionTestTimelineValue({ record, fieldName: 'name' }),
        summary: buildPermissionTestTimelineValue({
          record,
          fieldName: 'summary',
        }),
      },
    }),
    adminAccessToken,
  );

  expect(response.body.errors).toBeUndefined();
};

const findTimelineActivityIds = async ({
  targetColumnName,
  recordId,
  adminAccessToken,
}: {
  targetColumnName: string;
  recordId: string;
  adminAccessToken: string;
}): Promise<string[]> => {
  const response = await makeGraphqlApiRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: 'id',
      filter: { [targetColumnName]: { eq: recordId } },
    }),
    adminAccessToken,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.timelineActivities.edges.map(
    ({ node }: { node: { id: string } }) => node.id,
  );
};

export const createPermissionTestTimelineFixture = async (
  workspace: PermissionTestWorkspace,
): Promise<PermissionTestTimelineFixture> => {
  const { adminAccessToken, objectNameSingular, recordIds } = workspace;
  const { itemObjectMetadataId, itemsFieldId, accessRecordColumnNameOnItem } =
    await createItemObjectWithItemsField(workspace);

  for (const objectMetadataId of [
    workspace.objectMetadataId,
    itemObjectMetadataId,
  ]) {
    await createSummaryField({ objectMetadataId, adminAccessToken });
  }

  const accessRecordFields = await findObjectFieldsOrThrow({
    objectNameSingular,
    adminAccessToken,
  });
  const accessRecord = ({
    record,
    recordId,
  }: {
    record: PermissionTestTimelineRecordName;
    recordId: string;
  }): TimelineRecord => ({ record, objectNameSingular, recordId });
  const item = async ({
    record,
    accessRecordId,
  }: {
    record: PermissionTestTimelineRecordName;
    accessRecordId: string;
  }): Promise<TimelineRecord> => ({
    record,
    objectNameSingular: ITEM_OBJECT_NAME_SINGULAR,
    recordId: await createRecordOrThrow({
      objectNameSingular: ITEM_OBJECT_NAME_SINGULAR,
      data: { [accessRecordColumnNameOnItem]: accessRecordId },
      adminAccessToken,
    }),
  });
  const timelineRecords: TimelineRecord[] = [
    accessRecord({
      record: 'insideEveryFilter',
      recordId: recordIds.insideEveryFilter,
    }),
    accessRecord({
      record: 'outsideStatusFilter',
      recordId: recordIds.outsideStatusFilter,
    }),
    accessRecord({
      record: 'lowVisibilityTier',
      recordId: recordIds.lowVisibilityTier,
    }),
    accessRecord({
      record: 'fullVisibilityTier',
      recordId: recordIds.fullVisibilityTier,
    }),
    accessRecord({
      record: 'privateRecord',
      recordId: await createPrivateRecord(workspace),
    }),
    await item({
      record: 'itemOfReadableRecord',
      accessRecordId: recordIds.insideEveryFilter,
    }),
    await item({
      record: 'itemOfUnreadableRecord',
      accessRecordId: recordIds.outsideStatusFilter,
    }),
  ];

  const tokens = await createTokens({
    workspace,
    accessRecordFields,
    itemObjectMetadataId,
    itemsFieldId,
  });

  for (const timelineRecord of timelineRecords) {
    await updateRecordWithTimelineValues({ timelineRecord, adminAccessToken });
  }

  await waitForAllJobsToFinish();
  await recomputeAccessGroups({
    workspaceId: workspace.workspaceId,
    objectMetadataIds: [workspace.objectMetadataId, itemObjectMetadataId],
  });

  const timelineActivityIdsByRecord = new Map<
    PermissionTestTimelineRecordName,
    string[]
  >();
  const targetColumnNameByRecord = new Map<
    PermissionTestTimelineRecordName,
    string
  >();

  for (const { record, objectNameSingular, recordId } of timelineRecords) {
    const targetColumnName = `target${capitalize(objectNameSingular)}Id`;

    targetColumnNameByRecord.set(record, targetColumnName);
    timelineActivityIdsByRecord.set(
      record,
      await findTimelineActivityIds({
        targetColumnName,
        recordId,
        adminAccessToken,
      }),
    );
  }

  return { timelineActivityIdsByRecord, targetColumnNameByRecord, tokens };
};
