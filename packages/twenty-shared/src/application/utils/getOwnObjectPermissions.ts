import { type ObjectPermissionManifest, type RoleManifest } from '@/application/roleManifestType';

// A confined application requests its own objects with every action, unless its role names them
export const getOwnObjectPermissions = ({
  roleManifest,
  ownObjectUniversalIdentifiers,
}: {
  roleManifest: RoleManifest;
  ownObjectUniversalIdentifiers: string[];
}): ObjectPermissionManifest[] => {
  const declaredObjectUniversalIdentifiers = new Set(
    (roleManifest.objectPermissions ?? []).map(
      (objectPermission) => objectPermission.objectUniversalIdentifier,
    ),
  );

  return ownObjectUniversalIdentifiers
    .filter(
      (objectUniversalIdentifier) =>
        !declaredObjectUniversalIdentifiers.has(objectUniversalIdentifier),
    )
    .map((objectUniversalIdentifier) => ({
      objectUniversalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
    }));
};
