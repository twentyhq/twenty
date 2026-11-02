import { PermissionFlagType } from 'twenty-shared/constants';
import {
  type AiRunScope,
  type AiRunScopeObjectPermission,
  hasAiRunScopeRepeatedEntries,
} from 'twenty-shared/ai';
import { OBJECT_PERMISSION_ACTIONS } from 'twenty-shared/application';
import {
  FieldMetadataType,
  type ObjectsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildIsPermissionFlagGranted } from 'src/engine/permissions/role/utils/build-is-permission-flag-granted.util';
import { buildResolveMorphRelationPermissionFieldIds } from 'src/engine/metadata-modules/role/utils/build-resolve-morph-relation-permission-field-ids.util';
import { computeObjectsPermissionsForRoleDefinition } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-role-definition.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';

// a flag decides objects such as workflows regardless of their object permission, so a scope's explicit deny is applied after
const narrowObjectsPermissionsToExplicitDenies = ({
  objectsPermissions,
  objectPermissions,
}: {
  objectsPermissions: ObjectsPermissions;
  objectPermissions: (Omit<
    AiRunScopeObjectPermission,
    'objectUniversalIdentifier'
  > & {
    objectMetadataId: string;
  })[];
}): ObjectsPermissions =>
  objectPermissions.reduce(
    (narrowedObjectsPermissions, { objectMetadataId, ...objectPermission }) => {
      const grantedObjectPermissions =
        narrowedObjectsPermissions[objectMetadataId];

      if (!isDefined(grantedObjectPermissions)) {
        return narrowedObjectsPermissions;
      }

      return {
        ...narrowedObjectsPermissions,
        [objectMetadataId]: {
          ...grantedObjectPermissions,
          ...Object.fromEntries(
            OBJECT_PERMISSION_ACTIONS.map((action) => [
              action,
              grantedObjectPermissions[action] &&
                objectPermission[action] !== false,
            ]),
          ),
        },
      };
    },
    objectsPermissions,
  );

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
    ({ objectUniversalIdentifier, ...objectPermission }) => ({
      ...objectPermission,
      objectMetadataId: findObjectMetadataIdOrThrow(objectUniversalIdentifier),
    }),
  );

  const flatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const flagGrantedObjectsPermissions =
    computeObjectsPermissionsForRoleDefinition({
      roleDefinition: {
        canReadAllObjectRecords: scope.canReadAllObjectRecords ?? false,
        canUpdateAllObjectRecords: scope.canUpdateAllObjectRecords ?? false,
        canSoftDeleteAllObjectRecords:
          scope.canSoftDeleteAllObjectRecords ?? false,
        canDestroyAllObjectRecords: scope.canDestroyAllObjectRecords ?? false,
        isPermissionFlagGranted,
        areSystemObjectsReadOnlyByDefault: true,
        objectPermissions,
        fieldPermissions: (scope.fieldPermissions ?? []).flatMap(
          ({
            objectUniversalIdentifier,
            fieldUniversalIdentifier,
            ...fieldPermission
          }) => {
            const objectMetadataId = findObjectMetadataIdOrThrow(
              objectUniversalIdentifier,
            );
            const flatFieldMetadata =
              flatFieldMetadataMaps.byUniversalIdentifier[
                fieldUniversalIdentifier
              ];

            if (!isDefined(flatFieldMetadata)) {
              throw new PermissionsException(
                `Field ${fieldUniversalIdentifier} in an AI run scope does not exist`,
                PermissionsExceptionCode.INVALID_ARG,
              );
            }

            // attached to the named object, the restriction would miss the field's own
            if (flatFieldMetadata.objectMetadataId !== objectMetadataId) {
              throw new PermissionsException(
                `Field ${fieldUniversalIdentifier} does not belong to object ${objectUniversalIdentifier} in an AI run scope`,
                PermissionsExceptionCode.INVALID_ARG,
              );
            }

            return [
              {
                ...fieldPermission,
                objectMetadataId,
                fieldMetadataId: flatFieldMetadata.id,
              },
            ];
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
    objectsPermissions: narrowObjectsPermissionsToExplicitDenies({
      objectsPermissions: flagGrantedObjectsPermissions,
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
