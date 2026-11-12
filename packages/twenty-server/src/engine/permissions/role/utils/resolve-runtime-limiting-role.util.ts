import { PermissionFlagType } from 'twenty-shared/constants';
import {
  type AiRunScope,
  type AiRunScopeObjectPermission,
  hasAiRunScopeRepeatedEntries,
} from 'twenty-shared/ai';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildIsPermissionFlagGranted } from 'src/engine/permissions/role/utils/build-is-permission-flag-granted.util';
import { buildResolveMorphRelationPermissionFieldIds } from 'src/engine/metadata-modules/role/utils/build-resolve-morph-relation-permission-field-ids.util';
import { computeRoleRecordsPermissions } from 'src/engine/permissions/role/utils/compute-role-records-permissions.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { type RuntimeLimitingRole } from 'src/engine/permissions/principal/types/runtime-limiting-role.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

// a flag decides objects such as workflows regardless of their object permission, so a scope's explicit deny is applied after
const narrowRecordsPermissionsToExplicitDenies = ({
  recordsPermissions,
  objectPermissions,
}: {
  recordsPermissions: RoleRecordsPermissions;
  objectPermissions: (Omit<
    AiRunScopeObjectPermission,
    'objectUniversalIdentifier'
  > & {
    objectMetadataId: string;
  })[];
}): RoleRecordsPermissions => {
  const objects = { ...recordsPermissions.objects };

  for (const objectPermission of objectPermissions) {
    const grantedObjectRecordsPermissions =
      objects[objectPermission.objectMetadataId];

    if (!isDefined(grantedObjectRecordsPermissions)) {
      continue;
    }

    objects[objectPermission.objectMetadataId] = {
      canCreateAllRecords:
        grantedObjectRecordsPermissions.canCreateAllRecords &&
        objectPermission.canUpdateObjectRecords !== false,
      canReadAllRecords:
        grantedObjectRecordsPermissions.canReadAllRecords &&
        objectPermission.canReadObjectRecords !== false,
      canUpdateAllRecords:
        grantedObjectRecordsPermissions.canUpdateAllRecords &&
        objectPermission.canUpdateObjectRecords !== false,
      canSoftDeleteAllRecords:
        grantedObjectRecordsPermissions.canSoftDeleteAllRecords &&
        objectPermission.canSoftDeleteObjectRecords !== false,
      canDestroyAllRecords:
        grantedObjectRecordsPermissions.canDestroyAllRecords &&
        objectPermission.canDestroyObjectRecords !== false,
      unreadableFields: grantedObjectRecordsPermissions.unreadableFields,
      uneditableFields: grantedObjectRecordsPermissions.uneditableFields,
    };
  }

  return {
    canReadAllRecords: recordsPermissions.canReadAllRecords,
    canUpdateAllRecords: recordsPermissions.canUpdateAllRecords,
    canSoftDeleteAllRecords: recordsPermissions.canSoftDeleteAllRecords,
    canDestroyAllRecords: recordsPermissions.canDestroyAllRecords,
    objects,
  };
};

export const resolveRuntimeLimitingRole = ({
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
}): RuntimeLimitingRole => {
  if (hasAiRunScopeRepeatedEntries(scope)) {
    throw new PermissionsException(
      'An AI run scope lists an object or field more than once',
      PermissionsExceptionCode.INVALID_ARG,
    );
  }

  // a dropped entry could be a deny, so one naming metadata the workspace lacks fails the run
  const findObjectMetadataIdOrThrow = (objectUniversalIdentifier: string) => {
    const objectMetadataId =
      flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier]
        ?.id;

    if (!isDefined(objectMetadataId)) {
      throw new PermissionsException(
        `Object ${objectUniversalIdentifier} in an AI run scope does not exist`,
        PermissionsExceptionCode.INVALID_ARG,
      );
    }

    return objectMetadataId;
  };

  const isPermissionFlagGranted = buildIsPermissionFlagGranted({
    role: {
      canUpdateAllSettings: scope.canUpdateAllSettings ?? false,
      canAccessAllTools: scope.canAccessAllTools ?? false,
    },
    permissionFlagUniversalIdentifiers:
      scope.permissionFlagUniversalIdentifiers ?? [],
  });

  const objectPermissions = (scope.objectPermissions ?? []).map(
    (objectPermission) => ({
      objectMetadataId: findObjectMetadataIdOrThrow(
        objectPermission.objectUniversalIdentifier,
      ),
      canCreateObjectRecords: objectPermission.canUpdateObjectRecords,
      canReadObjectRecords: objectPermission.canReadObjectRecords,
      canUpdateObjectRecords: objectPermission.canUpdateObjectRecords,
      canSoftDeleteObjectRecords: objectPermission.canSoftDeleteObjectRecords,
      canDestroyObjectRecords: objectPermission.canDestroyObjectRecords,
    }),
  );

  const flatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const flagGrantedRecordsPermissions = computeRoleRecordsPermissions({
    roleDefinition: {
      canCreateAllObjectRecords: scope.canUpdateAllObjectRecords ?? false,
      canReadAllObjectRecords: scope.canReadAllObjectRecords ?? false,
      canUpdateAllObjectRecords: scope.canUpdateAllObjectRecords ?? false,
      canSoftDeleteAllObjectRecords:
        scope.canSoftDeleteAllObjectRecords ?? false,
      canDestroyAllObjectRecords: scope.canDestroyAllObjectRecords ?? false,
      isPermissionFlagGranted,
      areSystemObjectsReadOnlyByDefault: true,
      objectPermissions,
      fieldPermissions: (scope.fieldPermissions ?? []).flatMap(
        (fieldPermission) => {
          const objectMetadataId = findObjectMetadataIdOrThrow(
            fieldPermission.objectUniversalIdentifier,
          );
          const flatFieldMetadata =
            flatFieldMetadataMaps.byUniversalIdentifier[
              fieldPermission.fieldUniversalIdentifier
            ];

          if (!isDefined(flatFieldMetadata)) {
            throw new PermissionsException(
              `Field ${fieldPermission.fieldUniversalIdentifier} in an AI run scope does not exist`,
              PermissionsExceptionCode.INVALID_ARG,
            );
          }

          // attached to the named object, the restriction would miss the field's own
          if (flatFieldMetadata.objectMetadataId !== objectMetadataId) {
            throw new PermissionsException(
              `Field ${fieldPermission.fieldUniversalIdentifier} does not belong to object ${fieldPermission.objectUniversalIdentifier} in an AI run scope`,
              PermissionsExceptionCode.INVALID_ARG,
            );
          }

          return [
            {
              objectMetadataId,
              fieldMetadataId: flatFieldMetadata.id,
              rowLevelPermissionRuleId: null,
              canReadFieldValue: fieldPermission.canReadFieldValue,
              canUpdateFieldValue: fieldPermission.canUpdateFieldValue,
            },
          ];
        },
      ),
      rowLevelPermissionRules: [],
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
    recordsPermissions: narrowRecordsPermissionsToExplicitDenies({
      recordsPermissions: flagGrantedRecordsPermissions,
      objectPermissions,
    }),
    permissionFlags: Object.fromEntries(
      Object.values(PermissionFlagType).map((permissionFlag) => [
        permissionFlag,
        isPermissionFlagGranted(permissionFlag),
      ]),
    ),
  };
};
