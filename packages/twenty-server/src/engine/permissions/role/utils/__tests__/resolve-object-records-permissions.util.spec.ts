import { type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import {
  type ObjectRecordsPermissionsWorkspaceContext,
  resolveObjectRecordsPermissions,
} from 'src/engine/permissions/role/utils/resolve-object-records-permissions.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

const WORKSPACE_ID = 'workspace-id';
const OBJECT_ID = 'object-id';
const API_KEY_ID = 'api-key-id';
const ROLE_ID = 'role-id';

const buildObjectPermissions = (
  canReadObjectRecords: boolean,
): ObjectPermissions => ({
  canReadObjectRecords,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

const buildApiKeyWorkspaceContext = (
  canReadObjectRecords: boolean,
): ObjectRecordsPermissionsWorkspaceContext => ({
  authContext: {
    type: 'apiKey',
    workspace: { id: WORKSPACE_ID },
    apiKey: { id: API_KEY_ID },
  },
  permissionsPerRoleId: {
    [ROLE_ID]: { [OBJECT_ID]: buildObjectPermissions(canReadObjectRecords) },
  },
  flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
  flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
  userWorkspaceRoleMap: {},
  apiKeyRoleMap: { [API_KEY_ID]: ROLE_ID },
  flatRoleTargetByAgentIdMaps: {},
  flatApplicationMaps: { byId: {} },
});

describe('resolveObjectRecordsPermissions', () => {
  it('should resolve a workspace context once and reuse its principal', () => {
    const workspaceContext = buildApiKeyWorkspaceContext(true);

    const firstResolution = resolveObjectRecordsPermissions({
      workspaceContext,
    });
    const secondResolution = resolveObjectRecordsPermissions({
      workspaceContext,
    });

    expect(secondResolution).toBe(firstResolution);
    expect(firstResolution.permissionsPrincipal?.mainPrincipal).toEqual({
      type: 'apiKey',
      apiKeyId: API_KEY_ID,
      roleId: ROLE_ID,
    });
    expect(
      firstResolution.objectRecordsPermissions[OBJECT_ID]?.canReadObjectRecords,
    ).toBe(true);
  });

  it('should not reuse the resolution of another workspace context', () => {
    const readingContext = buildApiKeyWorkspaceContext(true);
    const deniedContext = buildApiKeyWorkspaceContext(false);

    const readingResolution = resolveObjectRecordsPermissions({
      workspaceContext: readingContext,
    });
    const deniedResolution = resolveObjectRecordsPermissions({
      workspaceContext: deniedContext,
    });

    expect(deniedResolution).not.toBe(readingResolution);
    expect(deniedResolution.permissionsPrincipal).not.toBe(
      readingResolution.permissionsPrincipal,
    );
    expect(
      deniedResolution.objectRecordsPermissions[OBJECT_ID]
        ?.canReadObjectRecords,
    ).toBe(false);
  });

  it('should bypass permission checks for the system context', () => {
    expect(
      resolveObjectRecordsPermissions({
        workspaceContext: {
          ...buildApiKeyWorkspaceContext(false),
          authContext: buildSystemAuthContext(WORKSPACE_ID),
        },
      }),
    ).toEqual({
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: true,
      permissionsPrincipal: undefined,
    });
  });
});
