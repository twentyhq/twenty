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
import { isDefined } from '@/utils/validation/isDefined';

// What an admin decides about a grant: the scope of the "all objects" request
// (null keeps all objects, including future ones) and extra objects with a level
export type GrantObjectAccess = {
  chosenObjectUniversalIdentifiers: string[] | null;
  addedObjects: {
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
    isDefined(objectAccess.chosenObjectUniversalIdentifiers) &&
    requestedAllObjectsActions.length > 0;

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

  if (isScoped) {
    for (const objectUniversalIdentifier of objectAccess.chosenObjectUniversalIdentifiers ??
      []) {
      grantActions(objectUniversalIdentifier, requestedAllObjectsActions);
    }
  }

  for (const { objectUniversalIdentifier, accessLevel } of objectAccess.addedObjects) {
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

// Reads the admin's decisions back from a grant. Without per-row provenance, a row granting exactly the
// requested "all objects" actions under a narrowed scope is a chosen object, any other extra row an added one.
export const getGrantObjectAccess = ({
  approvedRoleManifest,
  grantRoleManifest,
}: {
  approvedRoleManifest: RoleManifest;
  grantRoleManifest: RoleManifest;
}): GrantObjectAccess => {
  const requestedAllObjectsActions =
    getRequestedAllObjectsActions(approvedRoleManifest);
  const requiredObjectUniversalIdentifiers = new Set(
    (approvedRoleManifest.objectPermissions ?? []).map(
      ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
    ),
  );
  const isScoped = requestedAllObjectsActions.some(
    (action) =>
      grantRoleManifest[ROLE_LEVEL_FLAG_BY_OBJECT_PERMISSION_ACTION[action]] !==
      true,
  );

  const chosenObjectUniversalIdentifiers: string[] = [];
  const addedObjects: GrantObjectAccess['addedObjects'] = [];

  for (const { objectUniversalIdentifier, ...actions } of materializeRoleManifestObjectPermissions(
    grantRoleManifest,
  ).objectPermissions ?? []) {
    const grantedActions = getGrantedActions(actions);

    if (
      requiredObjectUniversalIdentifiers.has(objectUniversalIdentifier) ||
      grantedActions.length === 0
    ) {
      continue;
    }

    const isChosen =
      isScoped &&
      grantedActions.length === requestedAllObjectsActions.length &&
      requestedAllObjectsActions.every((action) =>
        grantedActions.includes(action),
      );

    if (isChosen) {
      chosenObjectUniversalIdentifiers.push(objectUniversalIdentifier);
    } else {
      addedObjects.push({
        objectUniversalIdentifier,
        accessLevel: getCoveringAccessLevel(grantedActions),
      });
    }
  }

  return {
    chosenObjectUniversalIdentifiers: isScoped
      ? chosenObjectUniversalIdentifiers
      : null,
    addedObjects,
  };
};
