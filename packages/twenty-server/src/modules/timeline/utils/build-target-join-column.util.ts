import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationFlatFieldMetadata } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-flat-field-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type TimelineActivityRuleTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-rule.type';

// The join column a relation field writes and the object it points at, the
// unit both target shapes are made of.
export const buildTargetJoinColumn = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): TimelineActivityRuleTargetJoinColumn | undefined => {
  const targetObjectMetadataId =
    flatFieldMetadata.relationTargetObjectMetadataId;

  if (!isDefined(targetObjectMetadataId)) {
    return undefined;
  }

  const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: targetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(targetFlatObjectMetadata)) {
    return undefined;
  }

  return {
    joinColumnName:
      getJoinColumnNameForRelationFlatFieldMetadata(flatFieldMetadata),
    targetObjectNameSingular: targetFlatObjectMetadata.nameSingular,
  };
};
