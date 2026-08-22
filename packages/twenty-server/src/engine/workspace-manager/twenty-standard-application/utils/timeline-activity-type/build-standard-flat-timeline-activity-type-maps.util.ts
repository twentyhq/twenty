import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-type-definitions.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildStandardFlatTimelineActivityTypeMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
}: {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
}): FlatEntityMaps<FlatTimelineActivityType> => {
  let flatTimelineActivityTypeMaps = createEmptyFlatEntityMaps();

  for (const definition of STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS) {
    flatTimelineActivityTypeMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: {
        id: v4(),
        name: definition.name,
        label: i18nLabel(definition.label),
        action: definition.action,
        icon: definition.icon,
        renderer: definition.renderer,
        objectUniversalIdentifier: definition.objectUniversalIdentifier,
        workspaceId,
        applicationId: twentyStandardApplicationId,
        universalIdentifier: definition.universalIdentifier,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        createdAt: now,
        updatedAt: now,
      },
      flatEntityMaps: flatTimelineActivityTypeMaps,
    });
  }

  return flatTimelineActivityTypeMaps;
};
