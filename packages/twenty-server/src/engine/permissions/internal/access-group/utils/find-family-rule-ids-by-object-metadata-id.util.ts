/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type RecordAccessGroupComputationMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-computation-metadata-maps.type';
import { findAccessGroupFamilies } from 'src/engine/permissions/internal/access-group/utils/find-access-group-families.util';

export const findFamilyRuleIdsByObjectMetadataId = ({
  metadataMaps,
  objectMetadataIds,
}: {
  metadataMaps: RecordAccessGroupComputationMetadataMaps;
  objectMetadataIds: string[];
}): Map<string, Set<string>> => {
  const familyRuleIdsByObjectMetadataId = new Map<string, Set<string>>();

  for (const objectMetadataId of objectMetadataIds) {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      continue;
    }

    familyRuleIdsByObjectMetadataId.set(
      objectMetadataId,
      new Set(
        findAccessGroupFamilies({ flatObjectMetadata, metadataMaps }).map(
          ({ ruleId }) => ruleId,
        ),
      ),
    );
  }

  return familyRuleIdsByObjectMetadataId;
};
