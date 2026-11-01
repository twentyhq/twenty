import { PermissionFlagType } from 'twenty-shared/constants';
import { type AiRunScope } from 'twenty-shared/ai';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildIsPermissionFlagGranted } from 'src/engine/permissions/role/utils/build-is-permission-flag-granted.util';
import { buildResolveMorphRelationPermissionFieldIds } from 'src/engine/metadata-modules/role/utils/build-resolve-morph-relation-permission-field-ids.util';
import { computeObjectsPermissionsForRoleDefinition } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-role-definition.util';
import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';

export const resolveAiRunPermissionScope = ({
  scope,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  scope: AiRunScope;
  flatObjectMetadataMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >;
  flatFieldMetadataMaps: Pick<
    FlatEntityMaps<FlatFieldMetadata>,
    'byUniversalIdentifier'
  >;
}): PermissionScope => {
  const findObjectMetadataId = (objectUniversalIdentifier: string) =>
    flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier]?.id;
  const findFieldMetadataId = (fieldUniversalIdentifier: string) =>
    flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier]?.id;

  const isPermissionFlagGranted = buildIsPermissionFlagGranted({
    role: {
      canUpdateAllSettings: scope.canUpdateAllSettings ?? false,
      canAccessAllTools: scope.canAccessAllTools ?? false,
    },
    permissionFlagUniversalIdentifiers:
      scope.permissionFlagUniversalIdentifiers ?? [],
  });

  const flatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const objectsPermissions = computeObjectsPermissionsForRoleDefinition({
    roleDefinition: {
      canReadAllObjectRecords: scope.canReadAllObjectRecords ?? false,
      canUpdateAllObjectRecords: scope.canUpdateAllObjectRecords ?? false,
      canSoftDeleteAllObjectRecords:
        scope.canSoftDeleteAllObjectRecords ?? false,
      canDestroyAllObjectRecords: scope.canDestroyAllObjectRecords ?? false,
      isPermissionFlagGranted,
      objectPermissions: (scope.objectPermissions ?? []).flatMap(
        ({ objectUniversalIdentifier, ...objectPermission }) => {
          const objectMetadataId = findObjectMetadataId(
            objectUniversalIdentifier,
          );

          return isDefined(objectMetadataId)
            ? [{ ...objectPermission, objectMetadataId }]
            : [];
        },
      ),
      fieldPermissions: (scope.fieldPermissions ?? []).flatMap(
        ({
          objectUniversalIdentifier,
          fieldUniversalIdentifier,
          ...fieldPermission
        }) => {
          const objectMetadataId = findObjectMetadataId(
            objectUniversalIdentifier,
          );
          const fieldMetadataId = findFieldMetadataId(fieldUniversalIdentifier);

          return isDefined(objectMetadataId) && isDefined(fieldMetadataId)
            ? [{ ...fieldPermission, objectMetadataId, fieldMetadataId }]
            : [];
        },
      ),
      rowLevelPermissionPredicates: [],
      rowLevelPermissionPredicateGroups: [],
    },
    objectMetadataCollection: Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined),
    resolveMorphRelationPermissionFieldIds:
      buildResolveMorphRelationPermissionFieldIds(
        flatFieldMetadatas.filter(
          (flatFieldMetadata) =>
            flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION,
        ),
      ),
  });

  return {
    objectsPermissions,
    permissionFlags: Object.fromEntries(
      Object.values(PermissionFlagType).map((permissionFlag) => [
        permissionFlag,
        isPermissionFlagGranted(permissionFlag),
      ]),
    ),
  };
};
