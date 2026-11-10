/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';

export const findRelatedRecordPathTargetObjectMetadataIds = ({
  flatRelatedRecordPathMaps,
  flatFieldMetadataMaps,
}: Pick<
  PermissionsMetadataMaps,
  'flatRelatedRecordPathMaps' | 'flatFieldMetadataMaps'
>): Set<string> =>
  new Set(
    Object.values(flatRelatedRecordPathMaps?.byUniversalIdentifier ?? {})
      .filter(isDefined)
      .map((flatRelatedRecordPath) => {
        const lastFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId:
            flatRelatedRecordPath.thirdFieldMetadataId ??
            flatRelatedRecordPath.secondFieldMetadataId ??
            flatRelatedRecordPath.firstFieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        return isDefined(lastFlatFieldMetadata) &&
          isMorphOrRelationFlatFieldMetadata(lastFlatFieldMetadata)
          ? lastFlatFieldMetadata.relationTargetObjectMetadataId
          : undefined;
      })
      .filter(isDefined),
  );
