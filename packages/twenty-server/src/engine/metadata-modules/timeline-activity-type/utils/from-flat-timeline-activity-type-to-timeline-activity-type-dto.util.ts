import { isDefined } from 'twenty-shared/utils';

import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { type TimelineActivityTypeDTO } from 'src/engine/metadata-modules/timeline-activity-type/dtos/timeline-activity-type.dto';
import { resolveOverridableEntityProperty } from 'src/engine/metadata-modules/utils/resolve-overridable-entity-property.util';

export const fromFlatTimelineActivityTypeToTimelineActivityTypeDto = (
  flatTimelineActivityType: FlatTimelineActivityType,
): TimelineActivityTypeDTO => ({
  id: flatTimelineActivityType.id,
  universalIdentifier: flatTimelineActivityType.universalIdentifier,
  name: flatTimelineActivityType.name,
  label: resolveOverridableEntityProperty(flatTimelineActivityType, 'label'),
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
            }
          : null,
      }
    : null,
  action: flatTimelineActivityType.action,
  icon: resolveOverridableEntityProperty(flatTimelineActivityType, 'icon'),
  renderer: null,
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
