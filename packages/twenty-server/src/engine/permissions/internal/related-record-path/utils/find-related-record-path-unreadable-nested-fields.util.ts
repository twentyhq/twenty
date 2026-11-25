/* @license Enterprise */

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  type PermissionsMetadataMaps,
  type PermissionsObjectAccessRequest,
} from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';

export type RelatedRecordPathUnreadableNestedField = {
  fieldMetadataId: string;
  sourceObjectMetadataId: string | null;
  sourceFieldMetadataId: string;
};

export const findRelatedRecordPathUnreadableNestedFields = ({
  principals,
  metadataMaps: { rolesPermissions, flatFieldMetadataMaps },
  flatObjectMetadata,
}: Pick<PermissionsObjectAccessRequest, 'principals' | 'flatObjectMetadata'> & {
  metadataMaps: Pick<
    PermissionsMetadataMaps,
    'rolesPermissions' | 'flatFieldMetadataMaps'
  >;
}): RelatedRecordPathUnreadableNestedField[] => {
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
      unreadableNestedFieldBySourceKey.set(
        `${fieldMetadataId}:${sourceFieldMetadataId}`,
        {
          fieldMetadataId,
          sourceObjectMetadataId:
            findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: sourceFieldMetadataId,
              flatEntityMaps: flatFieldMetadataMaps,
            })?.objectMetadataId ?? null,
          sourceFieldMetadataId,
        },
      );
    }
  }

  return [...unreadableNestedFieldBySourceKey.values()];
};
