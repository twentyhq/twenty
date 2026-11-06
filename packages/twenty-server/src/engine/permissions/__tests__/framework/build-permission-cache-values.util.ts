import {
  FeatureFlagKey,
  FieldMetadataType,
  type ObjectRecordsPermissions,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import {
  type RecordAccessWorld,
  type RestrictedFieldsByRoleId,
  type RoleGrant,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  API_KEY_ID,
  APPLICATION_ID,
  APPLICATION_ROLE_ID,
  CATEGORY_FIELD_ID,
  LIMITING_AGENT_ID,
  LIMITING_ROLE_ID,
  MAIN_AGENT_ID,
  MAIN_APPLICATION_ID,
  MAIN_ROLE_ID,
  MEMBER_ID,
  OAUTH_APPLICATION_ID,
  OBJECT_ID,
  REGION_FIELD_ID,
  STATUS_FIELD_ID,
  USER_ID,
  USER_WORKSPACE_ID,
  WEBHOOK_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const CREATED_BY_FIELD_ID = 'created-by-field-id';

const FLAT_ENTITY_DEFAULTS = {
  applicationId: 'object-owner-application-id',
  applicationUniversalIdentifier: 'object-owner-application-id',
  workspaceId: WORKSPACE_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const buildMaps = <TFlatEntity extends SyncableFlatEntity>(
  entities: TFlatEntity[],
) =>
  entities.reduce<FlatEntityMaps<TFlatEntity>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const FLAT_OBJECT_METADATA: FlatObjectMetadata = {
  ...getFlatObjectMetadataMock({
    id: OBJECT_ID,
    universalIdentifier: OBJECT_ID,
    nameSingular: 'thing',
    namePlural: 'things',
    fieldIds: [
      STATUS_FIELD_ID,
      CATEGORY_FIELD_ID,
      REGION_FIELD_ID,
      CREATED_BY_FIELD_ID,
    ],
  }),
  ...FLAT_ENTITY_DEFAULTS,
  isSystem: false,
  disabledObjectPermissionActions: [],
};

const buildFieldMock = ({
  id,
  name,
  type = FieldMetadataType.TEXT,
}: {
  id: string;
  name: string;
  type?: FieldMetadataType;
}) =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: id,
    name,
    type,
    objectMetadataId: OBJECT_ID,
  });

const FLAT_FIELD_METADATA_MAPS = buildMaps([
  buildFieldMock({ id: STATUS_FIELD_ID, name: 'status' }),
  buildFieldMock({ id: CATEGORY_FIELD_ID, name: 'category' }),
  buildFieldMock({ id: REGION_FIELD_ID, name: 'region' }),
  buildFieldMock({
    id: CREATED_BY_FIELD_ID,
    name: 'createdBy',
    type: FieldMetadataType.ACTOR,
  }),
]);

const ROW_LEVEL_FILTER_BY_ROLE_ID: Record<
  string,
  { fieldMetadataId: string; value: string }
> = {
  [MAIN_ROLE_ID]: { fieldMetadataId: STATUS_FIELD_ID, value: 'active' },
  [LIMITING_ROLE_ID]: { fieldMetadataId: CATEGORY_FIELD_ID, value: 'core' },
  [APPLICATION_ROLE_ID]: { fieldMetadataId: REGION_FIELD_ID, value: 'europe' },
};

const buildObjectPermissions = ({
  grant,
  restrictedFields = {},
}: {
  grant: RoleGrant;
  restrictedFields?: ObjectRecordsPermissions['restrictedFields'];
}): ObjectRecordsPermissions => ({
  canReadAllRecords: grant === 'allRecords',
  canUpdateAllRecords: grant === 'allRecords',
  canSoftDeleteAllRecords: grant === 'allRecords',
  canDestroyAllRecords: grant === 'allRecords',
  restrictedFields,
  ...(grant === 'rowLevel' && {
    rowLevelRecordsPermissions: {
      canReadRecords: true,
      canUpdateRecords: true,
      canSoftDeleteRecords: true,
      canDestroyRecords: true,
      predicates: [],
      predicateGroups: [],
    },
  }),
});

const buildRoleRecordsPermissions = ({
  grant,
  restrictedFields,
}: {
  grant: RoleGrant;
  restrictedFields?: ObjectRecordsPermissions['restrictedFields'];
}): RoleRecordsPermissions => ({
  ...NO_ROLE_RECORDS_PERMISSIONS,
  objects: { [OBJECT_ID]: buildObjectPermissions({ grant, restrictedFields }) },
});

const buildRowLevelFixtures = (roleIds: string[]) => ({
  predicateGroups: roleIds.map(
    (roleId) =>
      ({
        ...FLAT_ENTITY_DEFAULTS,
        id: `group-${roleId}`,
        universalIdentifier: `group-${roleId}`,
        roleId,
        roleUniversalIdentifier: roleId,
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_ID,
        logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
        parentRowLevelPermissionPredicateGroupId: null,
        parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
        positionInRowLevelPermissionPredicateGroup: null,
        deletedAt: null,
      }) as FlatRowLevelPermissionPredicateGroup,
  ),
  predicates: roleIds.map(
    (roleId) =>
      ({
        ...FLAT_ENTITY_DEFAULTS,
        id: `predicate-${roleId}`,
        universalIdentifier: `predicate-${roleId}`,
        roleId,
        roleUniversalIdentifier: roleId,
        objectMetadataId: OBJECT_ID,
        objectMetadataUniversalIdentifier: OBJECT_ID,
        fieldMetadataId: ROW_LEVEL_FILTER_BY_ROLE_ID[roleId].fieldMetadataId,
        fieldMetadataUniversalIdentifier:
          ROW_LEVEL_FILTER_BY_ROLE_ID[roleId].fieldMetadataId,
        relationFieldMetadataId: null,
        relationFieldMetadataUniversalIdentifier: null,
        workspaceMemberFieldMetadataId: null,
        workspaceMemberFieldMetadataUniversalIdentifier: null,
        workspaceMemberSubFieldName: null,
        subFieldName: null,
        operand: RowLevelPermissionPredicateOperand.IS,
        value: ROW_LEVEL_FILTER_BY_ROLE_ID[roleId].value,
        rowLevelPermissionPredicateGroupId: `group-${roleId}`,
        rowLevelPermissionPredicateGroupUniversalIdentifier: `group-${roleId}`,
        positionInRowLevelPermissionPredicateGroup: 0,
        deletedAt: null,
      }) as FlatRowLevelPermissionPredicate,
  ),
});

export type PermissionCacheValues = Omit<
  PermissionsMetadataMaps,
  'flatFieldMetadataMaps' | 'flatWorkspaceMemberMaps' | 'flatApplicationMaps'
> & {
  flatFieldMetadataMapsOrm: PermissionsMetadataMaps['flatFieldMetadataMaps'];
  flatApplicationMaps: {
    byId: Record<string, object>;
    idByUniversalIdentifier: Record<string, string>;
  };
  userWorkspaceRoleMap: Record<string, string>;
  apiKeyRoleMap: Record<string, string>;
  flatRoleTargetByAgentIdMaps: Record<string, { roleId: string }>;
  flatRoleTargetMaps: object;
  flatWorkspaceMemberMaps: object;
};

export const buildPermissionCacheValues = ({
  grantByRoleId = {},
  isSharingEnabled = false,
  flatObjectMetadata = FLAT_OBJECT_METADATA,
  restrictedFieldsByRoleId = {},
}: {
  grantByRoleId?: Record<string, RoleGrant>;
  isSharingEnabled?: boolean;
  flatObjectMetadata?: FlatObjectMetadata;
  restrictedFieldsByRoleId?: RestrictedFieldsByRoleId;
}): PermissionCacheValues => {
  const roleIds = [MAIN_ROLE_ID, LIMITING_ROLE_ID, APPLICATION_ROLE_ID];
  const { predicates, predicateGroups } = buildRowLevelFixtures(
    roleIds.filter((roleId) => grantByRoleId[roleId] === 'rowLevel'),
  );
  const applicationDefaults = {
    deletedAt: null,
    sourceType: ApplicationRegistrationSourceType.LOCAL,
  };

  return {
    flatObjectMetadataMaps: buildMaps([flatObjectMetadata]),
    flatFieldMetadataMapsOrm: FLAT_FIELD_METADATA_MAPS,
    featureFlagsMap: {
      [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: isSharingEnabled,
    },
    rolesPermissions: Object.fromEntries(
      roleIds.map((roleId) => [
        roleId,
        buildRoleRecordsPermissions({
          grant: grantByRoleId[roleId] ?? 'none',
          restrictedFields: restrictedFieldsByRoleId[roleId],
        }),
      ]),
    ),
    flatApplicationMaps: {
      byId: {
        [APPLICATION_ID]: {
          ...applicationDefaults,
          id: APPLICATION_ID,
          defaultRoleId: APPLICATION_ROLE_ID,
        },
        [MAIN_APPLICATION_ID]: {
          ...applicationDefaults,
          id: MAIN_APPLICATION_ID,
          defaultRoleId: MAIN_ROLE_ID,
        },
        [OAUTH_APPLICATION_ID]: {
          id: OAUTH_APPLICATION_ID,
          defaultRoleId: null,
          deletedAt: null,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
      },
      idByUniversalIdentifier: {},
    },
    flatRowLevelPermissionPredicateMaps: buildMaps(predicates),
    flatRowLevelPermissionPredicateGroupMaps: buildMaps(predicateGroups),
    userWorkspaceRoleMap: { [USER_WORKSPACE_ID]: MAIN_ROLE_ID },
    apiKeyRoleMap: { [API_KEY_ID]: MAIN_ROLE_ID },
    flatRoleTargetByAgentIdMaps: {
      [MAIN_AGENT_ID]: { roleId: MAIN_ROLE_ID },
      [LIMITING_AGENT_ID]: { roleId: LIMITING_ROLE_ID },
    },
    flatRoleTargetMaps: {
      byUniversalIdentifier: {
        'webhook-role-target': { webhookId: WEBHOOK_ID, roleId: MAIN_ROLE_ID },
      },
    },
    flatWorkspaceMemberMaps: {
      byId: { [MEMBER_ID]: { userId: USER_ID, deletedAt: null } },
      idByUserId: { [USER_ID]: MEMBER_ID },
      userWorkspaceIdByUserId: { [USER_ID]: USER_WORKSPACE_ID },
    },
  };
};

export const buildWorldCacheValues = (
  world: RecordAccessWorld,
): {
  cacheValues: PermissionCacheValues;
  flatObjectMetadata: FlatObjectMetadata;
} => {
  const { mainPrincipal, limitingPrincipal, applicationPrincipal } = world;
  const flatObjectMetadata: FlatObjectMetadata = {
    ...FLAT_OBJECT_METADATA,
    disabledObjectPermissionActions:
      world.disabledObjectPermissionActions ?? [],
    ...(world.isObjectOwnedByMainApplication && {
      applicationId: MAIN_APPLICATION_ID,
    }),
  };

  return {
    flatObjectMetadata,
    cacheValues: buildPermissionCacheValues({
      grantByRoleId: {
        [MAIN_ROLE_ID]: mainPrincipal.role,
        ...(limitingPrincipal.type === 'agent' && {
          [LIMITING_ROLE_ID]: limitingPrincipal.role,
        }),
        ...(applicationPrincipal.type === 'application' && {
          [APPLICATION_ROLE_ID]: applicationPrincipal.role,
        }),
      },
      isSharingEnabled: world.isSharingEnabled,
      flatObjectMetadata,
      restrictedFieldsByRoleId: world.restrictedFieldsByRoleId,
    }),
  };
};

export const buildAiRunScope = (grant: 'none' | 'allRecords') => ({
  recordsPermissions: buildRoleRecordsPermissions({ grant }),
  permissionFlags: {},
});
