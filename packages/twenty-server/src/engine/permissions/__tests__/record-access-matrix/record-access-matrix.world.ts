import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  FieldMetadataType,
  type ObjectRecordsPermissions,
  RecordShareAccessLevel,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  type MatrixActor,
  type MatrixRow,
  OTHER_WORKSPACE_MEMBER_ID,
  type RoleGrant,
  WORKSPACE_MEMBER_ID,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.model';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const WORKSPACE_ID = 'workspace-id';
export const OBJECT_ID = 'object-id';
const STATUS_FIELD_ID = 'status-field-id';
const CATEGORY_FIELD_ID = 'category-field-id';
const CREATED_BY_FIELD_ID = 'created-by-field-id';
export const USER_ID = 'user-id';
export const USER_WORKSPACE_ID = 'user-workspace-id';
export const API_KEY_ID = 'api-key-id';
export const AGENT_ID = 'agent-id';
export const APPLICATION_ID = 'application-id';
export const OAUTH_APPLICATION_ID = 'oauth-application-id';
export const MAIN_APPLICATION_ID = 'main-application-id';
const MATCHING_STATUS = 'active';
const MATCHING_CATEGORY = 'core';

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

export const FLAT_OBJECT_METADATA: FlatObjectMetadata = {
  ...getFlatObjectMetadataMock({
    id: OBJECT_ID,
    universalIdentifier: OBJECT_ID,
    nameSingular: 'thing',
    namePlural: 'things',
    fieldIds: [STATUS_FIELD_ID, CATEGORY_FIELD_ID, CREATED_BY_FIELD_ID],
  }),
  ...FLAT_ENTITY_DEFAULTS,
  isSystem: false,
  disabledObjectPermissionActions: [],
};

const FLAT_FIELD_METADATA_MAPS = buildMaps([
  getFlatFieldMetadataMock({
    id: STATUS_FIELD_ID,
    universalIdentifier: STATUS_FIELD_ID,
    name: 'status',
    type: FieldMetadataType.TEXT,
    objectMetadataId: OBJECT_ID,
  }),
  getFlatFieldMetadataMock({
    id: CATEGORY_FIELD_ID,
    universalIdentifier: CATEGORY_FIELD_ID,
    name: 'category',
    type: FieldMetadataType.TEXT,
    objectMetadataId: OBJECT_ID,
  }),
  getFlatFieldMetadataMock({
    id: CREATED_BY_FIELD_ID,
    universalIdentifier: CREATED_BY_FIELD_ID,
    name: 'createdBy',
    type: FieldMetadataType.ACTOR,
    objectMetadataId: OBJECT_ID,
  }),
]);

const buildObjectPermissions = (
  grant: RoleGrant,
): ObjectRecordsPermissions => ({
  canReadAllRecords: grant === 'allRecords',
  canUpdateAllRecords: grant === 'allRecords',
  canSoftDeleteAllRecords: grant === 'allRecords',
  canDestroyAllRecords: grant === 'allRecords',
  restrictedFields: {},
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

const buildRoleRecordsPermissions = (
  grant: RoleGrant,
): RoleRecordsPermissions => ({
  ...NO_ROLE_RECORDS_PERMISSIONS,
  objects: { [OBJECT_ID]: buildObjectPermissions(grant) },
});

const ROW_LEVEL_FILTER_BY_ROLE_ID: Record<
  string,
  { fieldMetadataId: string; value: string }
> = {
  [MAIN_ROLE_ID]: { fieldMetadataId: STATUS_FIELD_ID, value: MATCHING_STATUS },
  [LIMITING_ROLE_ID]: {
    fieldMetadataId: CATEGORY_FIELD_ID,
    value: MATCHING_CATEGORY,
  },
};

const buildRowLevelFixtures = (roleIds: string[]) => ({
  predicateGroups: roleIds.map(
    (roleId): FlatRowLevelPermissionPredicateGroup =>
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
    (roleId): FlatRowLevelPermissionPredicate =>
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

type MatrixCacheValues = Omit<
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
  flatWorkspaceMemberMaps: object;
};

export const buildMatrixCacheValues = ({
  mainRoleGrant,
  limitingRoleGrant,
  isSharingEnabled,
}: {
  mainRoleGrant: RoleGrant;
  limitingRoleGrant: RoleGrant;
  isSharingEnabled: boolean;
}): MatrixCacheValues => {
  const rowLevelRoleIds = [
    ...(mainRoleGrant === 'rowLevel' ? [MAIN_ROLE_ID] : []),
    ...(limitingRoleGrant === 'rowLevel' ? [LIMITING_ROLE_ID] : []),
  ];
  const { predicates, predicateGroups } =
    buildRowLevelFixtures(rowLevelRoleIds);
  const applicationDefaults = {
    deletedAt: null,
    sourceType: ApplicationRegistrationSourceType.LOCAL,
  };

  return {
    flatObjectMetadataMaps: buildMaps([FLAT_OBJECT_METADATA]),
    flatFieldMetadataMapsOrm: FLAT_FIELD_METADATA_MAPS,
    featureFlagsMap: {
      [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: isSharingEnabled,
    },
    rolesPermissions: {
      [MAIN_ROLE_ID]: buildRoleRecordsPermissions(mainRoleGrant),
      [LIMITING_ROLE_ID]: buildRoleRecordsPermissions(limitingRoleGrant),
    },
    flatApplicationMaps: {
      byId: {
        [APPLICATION_ID]: {
          ...applicationDefaults,
          id: APPLICATION_ID,
          defaultRoleId: LIMITING_ROLE_ID,
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
    flatRoleTargetByAgentIdMaps: { [AGENT_ID]: { roleId: LIMITING_ROLE_ID } },
    flatWorkspaceMemberMaps: {
      byId: { [WORKSPACE_MEMBER_ID]: { userId: USER_ID, deletedAt: null } },
      idByUserId: { [USER_ID]: WORKSPACE_MEMBER_ID },
      userWorkspaceIdByUserId: { [USER_ID]: USER_WORKSPACE_ID },
    },
  };
};

const UNRESTRICTED_AI_RUN_SCOPE = {
  recordsPermissions: buildRoleRecordsPermissions('allRecords'),
  permissionFlags: {},
};

export const USER_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
  userWorkspaceId: USER_WORKSPACE_ID,
  workspaceMemberId: WORKSPACE_MEMBER_ID,
  user: { id: USER_ID },
  workspaceMember: { id: WORKSPACE_MEMBER_ID },
  userSessionVariant: 'standard',
};

export const API_KEY_AUTH_CONTEXT = {
  type: 'apiKey',
  workspace: { id: WORKSPACE_ID },
  apiKey: { id: API_KEY_ID },
};

const buildActor = ({
  name,
  authContext,
  traits = {},
}: {
  name: string;
  authContext: object;
  traits?: Partial<MatrixActor>;
}): { actor: MatrixActor; authContext: WorkspaceAuthContext } => ({
  actor: {
    name,
    isWorkspaceMember: false,
    hasLimitingRole: false,
    hasAiRunScope: false,
    ...traits,
  },
  authContext: authContext as WorkspaceAuthContext,
});

export const MATRIX_ACTORS = [
  buildActor({
    name: 'member',
    authContext: USER_AUTH_CONTEXT,
    traits: { isWorkspaceMember: true },
  }),
  buildActor({
    name: 'member acting through an agent',
    authContext: { ...USER_AUTH_CONTEXT, agentId: AGENT_ID },
    traits: { isWorkspaceMember: true, hasLimitingRole: true },
  }),
  buildActor({
    name: 'member acting through an application',
    authContext: { ...USER_AUTH_CONTEXT, application: { id: APPLICATION_ID } },
    traits: { isWorkspaceMember: true, hasLimitingRole: true },
  }),
  buildActor({
    name: 'member acting through an OAuth application',
    authContext: {
      ...USER_AUTH_CONTEXT,
      application: { id: OAUTH_APPLICATION_ID },
    },
    traits: { isWorkspaceMember: true },
  }),
  buildActor({
    name: 'member in an AI run',
    authContext: {
      ...USER_AUTH_CONTEXT,
      aiRunScope: UNRESTRICTED_AI_RUN_SCOPE,
    },
    traits: { isWorkspaceMember: true, hasAiRunScope: true },
  }),
  buildActor({ name: 'API key', authContext: API_KEY_AUTH_CONTEXT }),
  buildActor({
    name: 'API key running an agent',
    authContext: { ...API_KEY_AUTH_CONTEXT, agentId: AGENT_ID },
    traits: { hasLimitingRole: true },
  }),
  buildActor({
    name: 'application',
    authContext: {
      type: 'application',
      workspace: { id: WORKSPACE_ID },
      application: { id: MAIN_APPLICATION_ID },
    },
  }),
];

const SHARE_TARGETS = [
  WORKSPACE_MEMBER_ID,
  OTHER_WORKSPACE_MEMBER_ID,
  MAIN_ROLE_ID,
  LIMITING_ROLE_ID,
  EVERYONE_PRINCIPAL_ID,
];

const buildShares = () => [
  { sharePrincipalId: undefined, shareAccessLevel: undefined },
  ...SHARE_TARGETS.flatMap((sharePrincipalId) =>
    Object.values(RecordShareAccessLevel).map((shareAccessLevel) => ({
      sharePrincipalId,
      shareAccessLevel,
    })),
  ),
];

const toRowId = ({
  isPrivate,
  isCreatedByActor,
  matchesMainRoleFilter,
  matchesLimitingRoleFilter,
  sharePrincipalId,
  shareAccessLevel,
}: Omit<MatrixRow, 'id'>) =>
  [
    isPrivate ? 'private' : 'public',
    isCreatedByActor ? 'mine' : 'theirs',
    matchesMainRoleFilter ? 'main-match' : 'main-miss',
    matchesLimitingRoleFilter ? 'limiting-match' : 'limiting-miss',
    sharePrincipalId ?? 'unshared',
    shareAccessLevel ?? 'none',
  ]
    .join('-')
    .toLowerCase();

export const MATRIX_ROWS: MatrixRow[] = [true, false].flatMap((isPrivate) =>
  [true, false].flatMap((isCreatedByActor) =>
    [true, false].flatMap((matchesMainRoleFilter) =>
      [true, false].flatMap((matchesLimitingRoleFilter) =>
        buildShares().map((share) => {
          const row = {
            isPrivate,
            isCreatedByActor,
            matchesMainRoleFilter,
            matchesLimitingRoleFilter,
            ...share,
          };

          return { ...row, id: toRowId(row) };
        }),
      ),
    ),
  ),
);

export const toRecord = (row: MatrixRow) => ({
  id: row.id,
  status: row.matchesMainRoleFilter ? MATCHING_STATUS : 'archived',
  category: row.matchesLimitingRoleFilter ? MATCHING_CATEGORY : 'other',
  deletedAt: null,
});

export const MATRIX_RECORD_SHARES = MATRIX_ROWS.flatMap((row) =>
  isDefined(row.sharePrincipalId) && isDefined(row.shareAccessLevel)
    ? [
        {
          recordId: row.id,
          principalId: row.sharePrincipalId,
          accessLevel: row.shareAccessLevel,
        },
      ]
    : [],
);

export const MATRIX_PRIVATE_RECORD_STATES = new Map(
  MATRIX_ROWS.map((row) => [
    row.id,
    {
      isPrivate: row.isPrivate,
      createdByWorkspaceMemberId: row.isCreatedByActor
        ? WORKSPACE_MEMBER_ID
        : OTHER_WORKSPACE_MEMBER_ID,
    },
  ]),
);
