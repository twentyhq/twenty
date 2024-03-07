import { FeatureFlagKeys } from 'src/core/feature-flag/feature-flag.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CalendarEventObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event.object-metadata';

@ObjectMetadata({
  namePlural: 'calendarChannelEventAssociations',
  labelSingular: 'Calendar Channel Event Association',
  labelPlural: 'Calendar Channel Event Associations',
  description: 'Calendar Channel Event Associations',
  icon: 'IconCalendar',
})
@IsSystem()
@Gate({
  featureFlag: FeatureFlagKeys.IsCalendarEnabled,
})
export class CalendarChannelEventAssociationObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Channel ID',
    description: 'Channel ID',
    icon: 'IconCalendar',
    joinColumn: 'calendarChannelId',
  })
  calendarChannel: CalendarEventObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Event ID',
    description: 'Event ID',
    icon: 'IconCalendar',
    joinColumn: 'calendarEventId',
  })
  calendarEvent: CalendarEventObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Event external ID',
    description: 'Event external ID',
    icon: 'IconCalendar',
  })
  eventExternalId: string;
}
