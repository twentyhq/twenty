import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export const buildMorphRelationHeadViewFilterUpdates = ({
  destinationFieldByOriginFieldId,
  flatViewFilterMaps,
}: {
  destinationFieldByOriginFieldId: Map<string, FlatFieldMetadata>;
  flatViewFilterMaps: FlatEntityMaps<FlatViewFilter>;
}): FlatViewFilter[] =>
  Object.values(flatViewFilterMaps.byUniversalIdentifier)
    .filter(isDefined)
    .flatMap((viewFilter) => {
      const fieldDestination = destinationFieldByOriginFieldId.get(
        viewFilter.fieldMetadataId,
      );
      const relationTargetDestination = isDefined(
        viewFilter.relationTargetFieldMetadataId,
      )
        ? destinationFieldByOriginFieldId.get(
            viewFilter.relationTargetFieldMetadataId,
          )
        : undefined;

      if (
        !isDefined(fieldDestination) &&
        !isDefined(relationTargetDestination)
      ) {
        return [];
      }

      return [
        {
          ...viewFilter,
          ...(isDefined(fieldDestination) && {
            fieldMetadataId: fieldDestination.id,
            fieldMetadataUniversalIdentifier:
              fieldDestination.universalIdentifier,
          }),
          ...(isDefined(relationTargetDestination) && {
            relationTargetFieldMetadataId: relationTargetDestination.id,
            relationTargetFieldMetadataUniversalIdentifier:
              relationTargetDestination.universalIdentifier,
          }),
        },
      ];
    });
