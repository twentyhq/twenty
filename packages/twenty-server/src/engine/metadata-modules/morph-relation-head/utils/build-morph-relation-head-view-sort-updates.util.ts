import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';

export const buildMorphRelationHeadViewSortUpdates = ({
  destinationFieldByOriginFieldId,
  flatViewSortMaps,
}: {
  destinationFieldByOriginFieldId: Map<string, FlatFieldMetadata>;
  flatViewSortMaps: FlatEntityMaps<FlatViewSort>;
}): FlatViewSort[] =>
  Object.values(flatViewSortMaps.byUniversalIdentifier)
    .filter(isDefined)
    .flatMap((viewSort) => {
      const destination = destinationFieldByOriginFieldId.get(
        viewSort.fieldMetadataId,
      );

      return isDefined(destination)
        ? [
            {
              ...viewSort,
              fieldMetadataId: destination.id,
              fieldMetadataUniversalIdentifier: destination.universalIdentifier,
            },
          ]
        : [];
    });
