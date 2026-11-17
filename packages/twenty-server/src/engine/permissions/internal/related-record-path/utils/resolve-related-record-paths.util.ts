/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import {
  type RelatedRecordPathHop,
  type ResolvedRelatedRecordPath,
} from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { findRelationJoinColumnsOrThrow } from 'src/engine/permissions/internal/rls/utils/find-relation-join-columns-or-throw.util';

type RelatedRecordPathMetadataMaps = Pick<
  PermissionsMetadataMaps,
  | 'flatFieldMetadataMaps'
  | 'flatObjectMetadataMaps'
  | 'flatRelatedRecordPathMaps'
>;

const resolveRelatedRecordPath = ({
  flatRelatedRecordPath,
  metadataMaps,
}: {
  flatRelatedRecordPath: FlatRelatedRecordPath;
  metadataMaps: RelatedRecordPathMetadataMaps;
}): ResolvedRelatedRecordPath | undefined => {
  const fieldMetadataIds = [
    flatRelatedRecordPath.firstFieldMetadataId,
    flatRelatedRecordPath.secondFieldMetadataId,
    flatRelatedRecordPath.thirdFieldMetadataId,
  ].filter(isDefined);
  const hops: RelatedRecordPathHop[] = [];
  let currentObjectMetadataId = flatRelatedRecordPath.objectMetadataId;

  for (const fieldMetadataId of fieldMetadataIds) {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
    });
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: currentObjectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });

    if (
      !isDefined(flatFieldMetadata) ||
      !isDefined(flatObjectMetadata) ||
      !flatFieldMetadata.isActive ||
      flatFieldMetadata.objectMetadataId !== currentObjectMetadataId ||
      !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
      !isDefined(flatFieldMetadata.relationTargetObjectMetadataId)
    ) {
      return undefined;
    }

    hops.push({
      flatObjectMetadata,
      ...findRelationJoinColumnsOrThrow({
        relationFieldMetadata: flatFieldMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      }),
    });
    currentObjectMetadataId = flatFieldMetadata.relationTargetObjectMetadataId;
  }

  return {
    isInherent: flatRelatedRecordPath.isInherent,
    sourceFlatObjectMetadata: hops[0].flatObjectMetadata,
    targetObjectMetadataId: currentObjectMetadataId,
    hops,
  };
};

export const resolveRelatedRecordPaths = (
  metadataMaps: RelatedRecordPathMetadataMaps,
): ResolvedRelatedRecordPath[] =>
  Object.values(
    metadataMaps.flatRelatedRecordPathMaps?.byUniversalIdentifier ?? {},
  )
    .filter(isDefined)
    .map((flatRelatedRecordPath) =>
      resolveRelatedRecordPath({ flatRelatedRecordPath, metadataMaps }),
    )
    .filter(isDefined);
