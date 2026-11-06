import { FeatureFlagKey } from 'twenty-shared/types';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  buildFlatEntityMaps,
  FLAT_FIELD_METADATA_MAPS,
  FLAT_OBJECT_METADATA,
} from 'src/engine/permissions/__tests__/framework/object-metadata-fixtures.util';
import {
  APPLICATION_ID,
  APPLICATION_ROLE_ID,
  LIMITING_ROLE_ID,
  MAIN_APPLICATION_ID,
  MAIN_ROLE_ID,
  MEMBER_ID,
  OAUTH_APPLICATION_ID,
  USER_ID,
  USER_WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import {
  type RecordAccessScenario,
  type RestrictedFieldsByRoleId,
  type RoleGrant,
} from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';
import { ROLE_FILTERS } from 'src/engine/permissions/__tests__/framework/role-filters.constant';
import {
  buildRoleRecordsPermissions,
  buildRowLevelFixtures,
} from 'src/engine/permissions/__tests__/framework/role-fixtures.util';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';

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
  const { predicates, predicateGroups } = buildRowLevelFixtures(
    ROLE_FILTERS.filter(({ roleId }) => grantByRoleId[roleId] === 'rowLevel'),
  );
  const applicationDefaults = {
    deletedAt: null,
    sourceType: ApplicationRegistrationSourceType.LOCAL,
  };

  return {
    flatObjectMetadataMaps: buildFlatEntityMaps([flatObjectMetadata]),
    flatFieldMetadataMapsOrm: FLAT_FIELD_METADATA_MAPS,
    featureFlagsMap: {
      [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: isSharingEnabled,
    },
    rolesPermissions: Object.fromEntries(
      ROLE_FILTERS.map(({ roleId }) => [
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
    flatRowLevelPermissionPredicateMaps: buildFlatEntityMaps(predicates),
    flatRowLevelPermissionPredicateGroupMaps:
      buildFlatEntityMaps(predicateGroups),
    userWorkspaceRoleMap: { [USER_WORKSPACE_ID]: MAIN_ROLE_ID },
    flatWorkspaceMemberMaps: {
      byId: { [MEMBER_ID]: { userId: USER_ID, deletedAt: null } },
      idByUserId: { [USER_ID]: MEMBER_ID },
      userWorkspaceIdByUserId: { [USER_ID]: USER_WORKSPACE_ID },
    },
  };
};

export const buildScenarioCacheValues = (
  scenario: RecordAccessScenario,
): {
  cacheValues: PermissionCacheValues;
  flatObjectMetadata: FlatObjectMetadata;
} => {
  const { mainPrincipal, limitingPrincipal, applicationPrincipal } = scenario;
  const flatObjectMetadata: FlatObjectMetadata = {
    ...FLAT_OBJECT_METADATA,
    disabledObjectPermissionActions:
      scenario.disabledObjectPermissionActions ?? [],
    ...(scenario.isObjectOwnedByMainApplication && {
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
      isSharingEnabled: scenario.isSharingEnabled,
      flatObjectMetadata,
      restrictedFieldsByRoleId: scenario.restrictedFieldsByRoleId,
    }),
  };
};
