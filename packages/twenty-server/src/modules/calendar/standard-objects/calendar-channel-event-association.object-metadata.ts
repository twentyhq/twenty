import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CalendarEventObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.calendarChannelEventAssociation,
  namePlural: 'calendarChannelEventAssociations',
  labelSingular: 'Calendar Channel Event Association',
  labelPlural: 'Calendar Channel Event Associations',
  description: 'Calendar Channel Event Associations',
  icon: 'IconCalendar',
})
@IsSystem()
@IsNotAuditLogged()
export class CalendarChannelEventAssociationObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarChannel,
    type: FieldMetadataType.RELATION,
    label: 'Channel ID',
    description: 'Channel ID',
    icon: 'IconCalendar',
    joinColumn: 'calendarChannelId',
  })
  calendarChannel: Relation<CalendarEventObjectMetadata>;

  @FieldMetadata({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarEvent,
    type: FieldMetadataType.RELATION,
    label: 'Event ID',
    description: 'Event ID',
    icon: 'IconCalendar',
    joinColumn: 'calendarEventId',
  })
  calendarEvent: Relation<CalendarEventObjectMetadata>;

  @FieldMetadata({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.eventExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Event external ID',
    description: 'Event external ID',
    icon: 'IconCalendar',
  })
  eventExternalId: string;
}
