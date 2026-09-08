import { isDefined } from 'twenty-shared/utils';

import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { type TimelineActivityTypeDTO } from 'src/engine/metadata-modules/timeline-activity-type/dtos/timeline-activity-type.dto';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-flat-entity-property.util';

export const fromFlatTimelineActivityTypeToTimelineActivityTypeDto = (
  flatTimelineActivityType: FlatTimelineActivityType,
): TimelineActivityTypeDTO => ({
  id: flatTimelineActivityType.id,
  universalIdentifier: flatTimelineActivityType.universalIdentifier,
  name: flatTimelineActivityType.name,
  label: resolveEffectiveFlatEntityProperty(flatTimelineActivityType, 'label'),
  emit: isDefined(flatTimelineActivityType.action)
    ? {
        on: flatTimelineActivityType.action,
        objectUniversalIdentifier:
          flatTimelineActivityType.objectUniversalIdentifier,
        through: isDefined(
          flatTimelineActivityType.targetRelationFieldUniversalIdentifier,
        )
          ? {
              relationFieldUniversalIdentifier:
                flatTimelineActivityType.targetRelationFieldUniversalIdentifier,
              triggerFieldUniversalIdentifiers:
                flatTimelineActivityType.triggerFieldUniversalIdentifiers,
              happensAtFieldUniversalIdentifier:
                flatTimelineActivityType.happensAtFieldUniversalIdentifier,
            }
          : null,
      }
    : null,
  action: flatTimelineActivityType.action,
  icon: resolveEffectiveFlatEntityProperty(flatTimelineActivityType, 'icon'),
  frontComponentUniversalIdentifier:
    flatTimelineActivityType.frontComponentUniversalIdentifier,
  objectUniversalIdentifier: flatTimelineActivityType.objectUniversalIdentifier,
  replacesTimelineActivityTypeUniversalIdentifier:
    flatTimelineActivityType.replacesTimelineActivityTypeUniversalIdentifier,
  isActive: flatTimelineActivityType.isActive,
  workspaceId: flatTimelineActivityType.workspaceId,
  applicationId: flatTimelineActivityType.applicationId,
  overrides: flatTimelineActivityType.overrides,
  createdAt: new Date(flatTimelineActivityType.createdAt),
  updatedAt: new Date(flatTimelineActivityType.updatedAt),
});
