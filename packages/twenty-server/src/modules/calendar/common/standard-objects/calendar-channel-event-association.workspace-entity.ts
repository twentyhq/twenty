import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.calendarChannelEventAssociation,
  namePlural: 'calendarChannelEventAssociations',
  labelSingular: 'Calendar Channel Event Association',
  labelPlural: 'Calendar Channel Event Associations',
  description: 'Calendar Channel Event Associations',
  icon: STANDARD_OBJECT_ICONS.calendarChannelEventAssociation,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CalendarChannelEventAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.eventExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Event external ID',
    description: 'Event external ID',
    icon: 'IconCalendar',
  })
  eventExternalId: string;

  @WorkspaceField({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.recurringEventExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Recurring Event ID',
    description: 'Recurring Event ID',
    icon: 'IconHistory',
  })
  recurringEventExternalId: string;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarChannel,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Channel ID',
    description: 'Channel ID',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannelEventAssociations',
  })
  calendarChannel: Relation<CalendarChannelWorkspaceEntity>;

  @WorkspaceJoinColumn('calendarChannel')
  calendarChannelId: string;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarEvent,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Event ID',
    description: 'Event ID',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarEventWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannelEventAssociations',
  })
  calendarEvent: Relation<CalendarEventWorkspaceEntity>;

  @WorkspaceJoinColumn('calendarEvent')
  calendarEventId: string;
}
