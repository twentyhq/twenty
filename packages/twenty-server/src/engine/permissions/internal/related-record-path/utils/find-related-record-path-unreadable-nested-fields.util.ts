/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';

export type RelatedRecordPathUnreadableNestedField = {
  fieldMetadataId: string;
  sourceObjectMetadataId: string;
  sourceFieldMetadataId: string;
};

export const findRelatedRecordPathUnreadableNestedFields = ({
  principals,
  metadataMaps: { rolesPermissions, flatFieldMetadataMaps },
  flatObjectMetadata,
}: PermissionsObjectAccessRequest): RelatedRecordPathUnreadableNestedField[] => {
  const unreadableNestedFieldBySourceKey = new Map<
    string,
    RelatedRecordPathUnreadableNestedField
  >();

  for (const roleId of principals.mainPrincipal.roleIds) {
    const unreadableNestedFields =
      rolesPermissions[roleId]?.objects[flatObjectMetadata.id]
        ?.unreadableNestedFields ?? [];

    for (const {
      fieldMetadataId,
      sourceFieldMetadataId,
    } of unreadableNestedFields) {
      const sourceFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: sourceFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(sourceFlatFieldMetadata)) {
        continue;
      }

      unreadableNestedFieldBySourceKey.set(
        `${fieldMetadataId}:${sourceFieldMetadataId}`,
        {
          fieldMetadataId,
          sourceObjectMetadataId: sourceFlatFieldMetadata.objectMetadataId,
          sourceFieldMetadataId,
        },
      );
    }
  }

  return [...unreadableNestedFieldBySourceKey.values()];
};
