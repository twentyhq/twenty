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
  action: flatTimelineActivityType.action,
  icon: resolveOverridableEntityProperty(flatTimelineActivityType, 'icon'),
  renderer: null,
  frontComponentUniversalIdentifier:
    flatTimelineActivityType.frontComponentUniversalIdentifier,
  objectUniversalIdentifier: flatTimelineActivityType.objectUniversalIdentifier,
  targetRelationFieldUniversalIdentifier:
    flatTimelineActivityType.targetRelationFieldUniversalIdentifier,
  triggerFieldUniversalIdentifiers:
    flatTimelineActivityType.triggerFieldUniversalIdentifiers,
  overridesTimelineActivityTypeUniversalIdentifier:
    flatTimelineActivityType.overridesTimelineActivityTypeUniversalIdentifier,
  isActive: flatTimelineActivityType.isActive,
  workspaceId: flatTimelineActivityType.workspaceId,
  applicationId: flatTimelineActivityType.applicationId,
  overrides: flatTimelineActivityType.overrides,
  createdAt: new Date(flatTimelineActivityType.createdAt),
  updatedAt: new Date(flatTimelineActivityType.updatedAt),
});
