import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildTimelineActivityRelatedMorphFieldMetadataName } from 'src/modules/timeline/utils/timeline-activity-related-morph-field-metadata-name-builder.util';

export const resolveTimelineActivityObject = ({
  timelineActivity,
  flatObjectMetadataMaps,
}: {
  timelineActivity: Record<string, unknown>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): FlatObjectMetadata | undefined => {
  const { linkedObjectMetadataId } = timelineActivity;

  if (isNonEmptyString(linkedObjectMetadataId)) {
    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: linkedObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
  }

  return Object.values(flatObjectMetadataMaps.byUniversalIdentifier).find(
    (flatObjectMetadata) =>
      isDefined(flatObjectMetadata) &&
      isNonEmptyString(
        timelineActivity[
          `${buildTimelineActivityRelatedMorphFieldMetadataName(flatObjectMetadata.nameSingular)}Id`
        ],
      ),
  );
};
