import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { buildPermissionCacheValues } from 'src/engine/permissions/__tests__/framework/build-permission-cache-values.util';
import { buildPermissionServices } from 'src/engine/permissions/__tests__/framework/build-permission-services.util';
import {
  APPLICATION_ROLE_ID,
  DELETED_APPLICATION_ID,
  LIMITING_ROLE_ID,
  MAIN_ROLE_ID,
  ROLELESS_APPLICATION_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

export type RoleSetting =
  | 'all settings'
  | 'flag assigned'
  | 'no flag'
  | 'missing role';

export const ROLE_SETTINGS: RoleSetting[] = [
  'all settings',
  'flag assigned',
  'no flag',
  'missing role',
];

export const FLAG = PermissionFlagType.WORKSPACE;

const ROLE_IDS = [MAIN_ROLE_ID, LIMITING_ROLE_ID, APPLICATION_ROLE_ID];

// A role left out of the settings exists and holds no flag
export const buildSettingPermissionsService = (
  settingByRoleId: Record<string, RoleSetting>,
) => {
  const roles = ROLE_IDS.map((id) => ({
    id,
    roleSetting: settingByRoleId[id] ?? 'no flag',
  })).filter(({ roleSetting }) => roleSetting !== 'missing role');
  const cacheValues = buildPermissionCacheValues({});
  const services = buildPermissionServices({
    cacheValues: {
      ...cacheValues,
      flatApplicationMaps: {
        ...cacheValues.flatApplicationMaps,
        byId: {
          ...cacheValues.flatApplicationMaps.byId,
          [DELETED_APPLICATION_ID]: {
            id: DELETED_APPLICATION_ID,
            defaultRoleId: MAIN_ROLE_ID,
            deletedAt: '2026-01-01T00:00:00.000Z',
          },
          [ROLELESS_APPLICATION_ID]: {
            id: ROLELESS_APPLICATION_ID,
            defaultRoleId: null,
            deletedAt: null,
          },
        },
      },
      flatRoleMaps: {
        byUniversalIdentifier: Object.fromEntries(
          roles.map(({ id, roleSetting }) => [
            id,
            {
              id,
              canUpdateAllSettings: roleSetting === 'all settings',
              rolePermissionFlagIds:
                roleSetting === 'flag assigned' ? [`flag-${id}`] : [],
            },
          ]),
        ),
        universalIdentifierById: Object.fromEntries(
          roles.map(({ id }) => [id, id]),
        ),
      },
      flatRolePermissionFlagMaps: {
        byUniversalIdentifier: Object.fromEntries(
          ROLE_IDS.map((roleId) => [
            `flag-${roleId}`,
            {
              id: `flag-${roleId}`,
              permissionFlagUniversalIdentifier: SystemPermissionFlag[FLAG],
            },
          ]),
        ),
        universalIdentifierById: Object.fromEntries(
          ROLE_IDS.map((roleId) => [`flag-${roleId}`, `flag-${roleId}`]),
        ),
      },
    },
  });

  return new SettingPermissionsService(
    services.workspaceCacheService,
    services.principalPermissionsService,
  );
};
