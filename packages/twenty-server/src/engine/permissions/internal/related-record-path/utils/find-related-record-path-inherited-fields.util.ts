/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';

export type RelatedRecordPathInheritedField = {
  fieldMetadataId: string;
  sourceObjectMetadataId: string;
  sourceFieldMetadataId: string;
};

export const findRelatedRecordPathInheritedFields = ({
  principals,
  metadataMaps: { rolesPermissions, flatFieldMetadataMaps },
  flatObjectMetadata,
}: PermissionsObjectAccessRequest): RelatedRecordPathInheritedField[] => {
  const inheritedFieldBySourceKey = new Map<
    string,
    RelatedRecordPathInheritedField
  >();

  for (const roleId of principals.mainPrincipal.roleIds) {
    const inheritedFields =
      rolesPermissions[roleId]?.objects[flatObjectMetadata.id]
        ?.inheritedFields ?? [];

    for (const { fieldMetadataId, sourceFieldMetadataId } of inheritedFields) {
      const sourceFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: sourceFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(sourceFlatFieldMetadata)) {
        continue;
      }

      inheritedFieldBySourceKey.set(
        `${fieldMetadataId}:${sourceFieldMetadataId}`,
        {
          fieldMetadataId,
          sourceObjectMetadataId: sourceFlatFieldMetadata.objectMetadataId,
          sourceFieldMetadataId,
        },
      );
    }
  }

  return [...inheritedFieldBySourceKey.values()];
};
