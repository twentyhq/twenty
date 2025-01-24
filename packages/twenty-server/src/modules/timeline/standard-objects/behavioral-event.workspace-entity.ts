import { FieldMetadataType } from 'twenty-shared';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { BEHAVIORAL_EVENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.behavioralEvent,
  namePlural: 'behavioralEvents',
  labelSingular: 'Behavioral Event',
  labelPlural: 'Behavioral Events',
  description: 'An event related to user behavior',
  icon: STANDARD_OBJECT_ICONS.behavioralEvent,
})
@WorkspaceIsSystem()
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsEventObjectEnabled,
})
export class BehavioralEventWorkspaceEntity extends BaseWorkspaceEntity {
  /** 
   * 
   * Common in Segment, Rudderstack, etc.
   * = Track, Screen, Page...
   * But doesn't feel that useful. 
   * Let's try living without it.
   * 
  @WorkspaceField({
    standardId: behavioralEventStandardFieldIds.type,
    type: FieldMetadataType.TEXT,
    label: 'Event type',
    description: 'Event type',
    icon: 'IconAbc',
  })
  type: string;
  */

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Event name',
    description: 'Event name',
    icon: 'IconAbc',
  })
  name: string;

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.properties,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event details',
    description: 'Json value for event details',
    icon: 'IconListDetails',
  })
  @WorkspaceIsNullable()
  properties: JSON | null;

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.context,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event context',
    description:
      'Json object to provide context (user, device, workspace, etc.)',
    icon: 'IconListDetails',
  })
  @WorkspaceIsNullable()
  context: JSON | null;

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.objectName,
    type: FieldMetadataType.TEXT,
    label: 'Object name',
    description: 'If the event is related to a particular object',
    icon: 'IconAbc',
  })
  objectName: string;

  @WorkspaceField({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.recordId,
    type: FieldMetadataType.UUID,
    label: 'Object id',
    description: 'Event name/type',
    icon: 'IconAbc',
  })
  @WorkspaceIsNullable()
  recordId: string | null;
}
