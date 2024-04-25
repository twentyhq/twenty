import { FeatureFlagKeys } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { BEHAVIORAL_EVENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.behavioralEvent,
  namePlural: 'behavioralEvents',
  labelSingular: 'Behavioral Event',
  labelPlural: 'Behavioral Events',
  description: 'An event related to user behavior',
  icon: 'IconIconTimelineEvent',
})
@IsSystem()
@Gate({
  featureFlag: FeatureFlagKeys.IsEventObjectEnabled,
})
export class BehavioralEventObjectMetadata extends BaseObjectMetadata {
  /** 
   * 
   * Common in Segment, Rudderstack, etc.
   * = Track, Screen, Page...
   * But doesn't feel that useful. 
   * Let's try living without it.
   * 
  @FieldMetadata({
    standardId: behavioralEventStandardFieldIds.type,
    type: FieldMetadataType.TEXT,
    label: 'Event type',
    description: 'Event type',
    icon: 'IconAbc',
  })
  type: string;
  */

  @FieldMetadata({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Event name',
    description: 'Event name',
    icon: 'IconAbc',
  })
  name: string;

  @FieldMetadata({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.properties,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event details',
    description: 'Json value for event details',
    icon: 'IconListDetails',
  })
  @IsNullable()
  properties: JSON;

  @FieldMetadata({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.context,
    type: FieldMetadataType.RAW_JSON,
    label: 'Event context',
    description:
      'Json object to provide context (user, device, workspace, etc.)',
    icon: 'IconListDetails',
  })
  @IsNullable()
  context: JSON;

  @FieldMetadata({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.objectName,
    type: FieldMetadataType.TEXT,
    label: 'Object name',
    description: 'If the event is related to a particular object',
    icon: 'IconAbc',
  })
  objectName: string;

  @FieldMetadata({
    standardId: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS.recordId,
    type: FieldMetadataType.UUID,
    label: 'Object id',
    description: 'Event name/type',
    icon: 'IconAbc',
  })
  @IsNullable()
  recordId: string;
}
