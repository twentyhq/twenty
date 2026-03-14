import { type FromTo } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const recomputeViewNameAfterFlatObjectMetadataLabelUpdate = ({
  flatViewMaps,
  fromFlatObjectMetadata,
  toFlatObjectMetadata,
}: FromTo<FlatObjectMetadata, 'flatObjectMetadata'> &
  Pick<AllFlatEntityMaps, 'flatViewMaps'>): UniversalFlatView[] => {
  const viewsToUpdate: UniversalFlatView[] = [];

  const oldLabelPlural = fromFlatObjectMetadata.labelPlural;
  const newLabelPlural = toFlatObjectMetadata.labelPlural;

  if (oldLabelPlural === newLabelPlural) {
    return [];
  }

  const oldAllViewNameCap = `All ${oldLabelPlural}`;
  const oldAllViewNameLower = `all ${oldLabelPlural.toLowerCase()}`;
  const templateName = 'All {objectLabelPlural}';

  for (const flatViewMap of flatViewMaps.values()) {
    for (const flatView of flatViewMap.values()) {
      if (flatView.objectMetadataId !== fromFlatObjectMetadata.id) {
        continue;
      }

      if (
        flatView.name === oldAllViewNameCap ||
        flatView.name === oldAllViewNameLower
      ) {
        viewsToUpdate.push({
          ...flatView,
          name: templateName,
        });
      }
    }
  }

  return viewsToUpdate;
};
