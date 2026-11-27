/* @license Enterprise */

import {
  FeatureFlagKey,
  FieldMetadataType,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
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
import { createPermissionTestApiKeyToken } from 'test/integration/permissions/utils/create-permission-test-api-key-token.util';
import { createPermissionTestRole } from 'test/integration/permissions/utils/create-permission-test-role.util';
import { createPermissionTestVisibilityTierRole } from 'test/integration/permissions/utils/create-permission-test-visibility-tier-role.util';
import {
  type PermissionTestRoleGrant,
  type PermissionTestWorkspace,
} from 'test/integration/permissions/utils/permission-test-workspace.type';
import { buildPermissionTestTimelineValue } from 'test/integration/permissions/utils/build-permission-test-timeline-value.util';
import {
  type PermissionTestTimelineFixture,
  type PermissionTestTimelineRecordName,
  type PermissionTestTimelineRole,
} from 'test/integration/permissions/utils/permission-test-timeline-fixture.type';
import { setRecordShareOperationFactory } from 'test/integration/permissions/utils/set-record-share-operation-factory.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { type DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';

const ITEM_OBJECT_NAME_SINGULAR = 'accessRecordItem';

type ObjectFields = { id: string; fieldIdsByName: Record<string, string> };

const findObjectFieldsByNameSingular = async (
  adminAccessToken: string,
): Promise<Record<string, ObjectFields>> => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: {}, paging: { first: 1000 } },
    gqlFields: 'id nameSingular fieldsList { id name }',
    expectToFail: false,
    token: adminAccessToken,
  });

  return Object.fromEntries(
    objects.map(({ id, nameSingular, fieldsList }) => [
      nameSingular,
      {
        id,
        fieldIdsByName: Object.fromEntries(
          (fieldsList ?? []).map((field) => [field.name, field.id]),
        ),
      },
    ]),
  );
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

const createItemObjectWithItemsField = async (
  workspace: PermissionTestWorkspace,
) => {
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
    token: workspace.adminAccessToken,
  });
  const itemsField = await createRelationBetweenObjects({
    objectMetadataId: workspace.objectMetadataId,
    targetObjectMetadataId: data.createOneObject.id,
    type: FieldMetadataType.RELATION,
    relationType: RelationType.ONE_TO_MANY,
    name: 'items',
    label: 'Items',
    targetFieldLabel: 'Access record',
    targetFieldIcon: 'IconBox',
    token: workspace.adminAccessToken,
  });

  return {
    itemsFieldId: itemsField.id,
    accessRecordColumnNameOnItem: `${itemsField.relation.targetFieldMetadata.name}Id`,
  };
};

const createSummaryField = (
  workspace: PermissionTestWorkspace,
  objectMetadataId: string,
) =>
  createOneFieldMetadata({
    input: {
      name: 'summary',
      label: 'summary',
      type: FieldMetadataType.TEXT,
      objectMetadataId,
    },
    gqlFields: 'id',
    expectToFail: false,
    token: workspace.adminAccessToken,
  });

const createPrivateRecord = async (workspace: PermissionTestWorkspace) => {
  await updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED,
    value: true,
    workspaceId: workspace.workspaceId,
    expectToFail: false,
  });

  const recordId = await createRecordOrThrow({
    objectNameSingular: workspace.objectNameSingular,
    data: { status: 'active', category: 'core', region: 'europe' },
    adminAccessToken: workspace.adminAccessToken,
  });
  const response = await setRecordPrivate({
    objectMetadataId: workspace.objectMetadataId,
    recordId,
    isPrivate: true,
    accessToken: workspace.adminAccessToken,
  });

  expect(response.body.errors).toBeUndefined();

  return recordId;
};

const denyFieldRead = ({
  workspace,
  roleId,
  objectMetadataId,
  fieldMetadataId,
}: {
  workspace: PermissionTestWorkspace;
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
    token: workspace.adminAccessToken,
  });

const createTokens = async ({
  workspace,
  accessRecordFields,
  itemObjectMetadataId,
  itemsFieldId,
}: {
  workspace: PermissionTestWorkspace;
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
        fieldMetadataId: accessRecordFields.fieldIdsByName.status,
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
    workspace,
    roleId: summaryDeniedRoleId,
    objectMetadataId,
    fieldMetadataId: accessRecordFields.fieldIdsByName.summary,
  });

  const timelineRelationDeniedRoleId = await createRole({
    label: 'Timeline relation denied',
    grant: 'allRecords',
  });

  await denyFieldRead({
    workspace,
    roleId: timelineRelationDeniedRoleId,
    objectMetadataId,
    fieldMetadataId: accessRecordFields.fieldIdsByName.timelineActivities,
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
  record,
  objectNameSingular,
  recordId,
  adminAccessToken,
}: {
  record: PermissionTestTimelineRecordName;
  objectNameSingular: string;
  recordId: string;
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
  const { adminAccessToken } = workspace;
  const { itemsFieldId, accessRecordColumnNameOnItem } =
    await createItemObjectWithItemsField(workspace);
  const itemObjectMetadataId = (
    await findObjectFieldsByNameSingular(adminAccessToken)
  )[ITEM_OBJECT_NAME_SINGULAR].id;

  await createSummaryField(workspace, workspace.objectMetadataId);
  await createSummaryField(workspace, itemObjectMetadataId);

  const accessRecordFields = (
    await findObjectFieldsByNameSingular(adminAccessToken)
  )[workspace.objectNameSingular];

  if (!isDefined(accessRecordFields)) {
    throw new Error('Permission test object is missing');
  }

  const createItem = (accessRecordId: string) =>
    createRecordOrThrow({
      objectNameSingular: ITEM_OBJECT_NAME_SINGULAR,
      data: { [accessRecordColumnNameOnItem]: accessRecordId },
      adminAccessToken,
    });
  const accessRecord = (recordId: string) => ({
    objectNameSingular: workspace.objectNameSingular,
    recordId,
  });
  const item = async (accessRecordId: string) => ({
    objectNameSingular: ITEM_OBJECT_NAME_SINGULAR,
    recordId: await createItem(accessRecordId),
  });
  const records: Record<
    PermissionTestTimelineRecordName,
    { objectNameSingular: string; recordId: string }
  > = {
    insideEveryFilter: accessRecord(workspace.recordIds.insideEveryFilter),
    outsideStatusFilter: accessRecord(workspace.recordIds.outsideStatusFilter),
    lowVisibilityTier: accessRecord(workspace.recordIds.lowVisibilityTier),
    fullVisibilityTier: accessRecord(workspace.recordIds.fullVisibilityTier),
    privateRecord: accessRecord(await createPrivateRecord(workspace)),
    itemOfReadableRecord: await item(workspace.recordIds.insideEveryFilter),
    itemOfUnreadableRecord: await item(workspace.recordIds.outsideStatusFilter),
  };

  const tokens = await createTokens({
    workspace,
    accessRecordFields,
    itemObjectMetadataId,
    itemsFieldId,
  });

  const recordEntries = Object.entries(records) as [
    PermissionTestTimelineRecordName,
    { objectNameSingular: string; recordId: string },
  ][];

  for (const [record, { objectNameSingular, recordId }] of recordEntries) {
    await updateRecordWithTimelineValues({
      record,
      objectNameSingular,
      recordId,
      adminAccessToken,
    });
  }

  await waitForAllJobsToFinish();
  await recomputeAccessGroups({
    workspaceId: workspace.workspaceId,
    objectMetadataIds: [workspace.objectMetadataId, itemObjectMetadataId],
  });

  const targetColumnNameByRecord = Object.fromEntries(
    recordEntries.map(([record, { objectNameSingular }]) => [
      record,
      `target${capitalize(objectNameSingular)}Id`,
    ]),
  ) as Record<PermissionTestTimelineRecordName, string>;
  const timelineActivityIdsByRecord = Object.fromEntries(
    await Promise.all(
      recordEntries.map(async ([record, { recordId }]) => [
        record,
        await findTimelineActivityIds({
          targetColumnName: targetColumnNameByRecord[record],
          recordId,
          adminAccessToken,
        }),
      ]),
    ),
  ) as Record<PermissionTestTimelineRecordName, string[]>;

  return { timelineActivityIdsByRecord, targetColumnNameByRecord, tokens };
};
