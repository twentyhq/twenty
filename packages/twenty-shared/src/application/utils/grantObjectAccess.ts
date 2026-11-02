import {
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
} from '@/application/objectPermissionActionType';
import { type RoleManifest } from '@/application/roleManifestType';
import { ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION } from '@/application/utils/getEffectiveObjectPermissionsFromRoleManifest';
import { materializeRoleManifestObjectPermissions } from '@/application/utils/materializeRoleManifestObjectPermissions';
import {
  getAccessLevelFromObjectPermissionActions,
  type GrantAccessLevel,
  OBJECT_PERMISSION_ACTIONS_BY_ACCESS_LEVEL,
} from '@/application/utils/recordShareAccessLevelObjectPermissions';
import { RecordShareAccessLevel } from '@/types/RecordShareAccessLevel';

// What an admin decides about a grant: whether the "all objects" request keeps covering every object,
// including future ones, and objects listed with a level on top of what the app requires
export type GrantObjectAccess = {
  coversAllObjects: boolean;
  objects: {
    objectUniversalIdentifier: string;
    accessLevel: GrantAccessLevel;
  }[];
};

export const getRequestedAllObjectsActions = (
  roleManifest: RoleManifest,
): ObjectPermissionAction[] =>
  OBJECT_PERMISSION_ACTIONS.filter(
    (action) =>
      roleManifest[ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action]] ===
      true,
  );

const getGrantedActions = (
  objectPermission: Partial<Record<ObjectPermissionAction, boolean>>,
): ObjectPermissionAction[] =>
  OBJECT_PERMISSION_ACTIONS.filter((action) => objectPermission[action]);

// Rows between two levels (update without delete...) show as the smallest level that covers them
const getCoveringAccessLevel = (
  actions: ObjectPermissionAction[],
): GrantAccessLevel =>
  getAccessLevelFromObjectPermissionActions(actions) ??
  (actions.includes('canSoftDeleteObjectRecords') ||
  actions.includes('canDestroyObjectRecords')
    ? RecordShareAccessLevel.FULL
    : actions.includes('canUpdateObjectRecords')
      ? RecordShareAccessLevel.READ_WRITE
      : RecordShareAccessLevel.READ);

export const buildGrantRoleManifestFromObjectAccess = ({
  approvedRoleManifest,
  objectAccess,
}: {
  approvedRoleManifest: RoleManifest;
  objectAccess: GrantObjectAccess;
}): RoleManifest => {
  const requestedAllObjectsActions =
    getRequestedAllObjectsActions(approvedRoleManifest);
  const isScoped =
    !objectAccess.coversAllObjects && requestedAllObjectsActions.length > 0;

  const actionsByObject = new Map<
    string,
    Partial<Record<ObjectPermissionAction, boolean>>
  >(
    (
      materializeRoleManifestObjectPermissions(approvedRoleManifest)
        .objectPermissions ?? []
    ).map(({ objectUniversalIdentifier, ...actions }) => [
      objectUniversalIdentifier,
      actions,
    ]),
  );

  const grantActions = (
    objectUniversalIdentifier: string,
    actions: ObjectPermissionAction[],
  ) => {
    const current = actionsByObject.get(objectUniversalIdentifier) ?? {};

    actionsByObject.set(objectUniversalIdentifier, {
      ...current,
      ...Object.fromEntries(actions.map((action) => [action, true])),
    });
  };

  for (const { objectUniversalIdentifier, accessLevel } of objectAccess.objects) {
    grantActions(
      objectUniversalIdentifier,
      OBJECT_PERMISSION_ACTIONS_BY_ACCESS_LEVEL[accessLevel],
    );
  }

  return {
    ...approvedRoleManifest,
    ...(isScoped
      ? Object.fromEntries(
          requestedAllObjectsActions.map((action) => [
            ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action],
            false,
          ]),
        )
      : {}),
    objectPermissions: [...actionsByObject].map(
      ([objectUniversalIdentifier, actions]) => ({
        objectUniversalIdentifier,
        ...actions,
      }),
    ),
  };
};

// Reads the admin's decisions back from a grant: every granted row the app does not require is a listed object
export const getGrantObjectAccess = ({
  approvedRoleManifest,
  grantRoleManifest,
}: {
  approvedRoleManifest: RoleManifest;
  grantRoleManifest: RoleManifest;
}): GrantObjectAccess => {
  const requiredObjectUniversalIdentifiers = new Set(
    (approvedRoleManifest.objectPermissions ?? []).map(
      ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
    ),
  );

  const objects = (
    materializeRoleManifestObjectPermissions(grantRoleManifest)
      .objectPermissions ?? []
  ).flatMap(({ objectUniversalIdentifier, ...actions }) => {
    const grantedActions = getGrantedActions(actions);

    return requiredObjectUniversalIdentifiers.has(objectUniversalIdentifier) ||
      grantedActions.length === 0
      ? []
      : [
          {
            objectUniversalIdentifier,
            accessLevel: getCoveringAccessLevel(grantedActions),
          },
        ];
  });

  return {
    coversAllObjects: getRequestedAllObjectsActions(approvedRoleManifest).every(
      (action) =>
        grantRoleManifest[ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action]] ===
        true,
    ),
    objects,
  };
};
