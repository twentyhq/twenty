import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.calendarChannelEventAssociation,

  namePlural: 'calendarChannelEventAssociations',
  labelSingular: msg`Calendar Channel Event Association`,
  labelPlural: msg`Calendar Channel Event Associations`,
  description: msg`Calendar Channel Event Associations`,
  icon: STANDARD_OBJECT_ICONS.calendarChannelEventAssociation,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class CalendarChannelEventAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  /**
   * External ID of the calendar event. Comes from the provider's API, is unique per connected account.
   * Used by the provider to identify the event in their system.
   * So two External ID can be related to the same event sharing the same iCalUID.
   */
  @WorkspaceField({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.eventExternalId,
    type: FieldMetadataType.TEXT,
    label: msg`Event external ID`,
    description: msg`Event external ID`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  eventExternalId: string | null;

  @WorkspaceField({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.recurringEventExternalId,
    type: FieldMetadataType.TEXT,
    label: msg`Recurring Event ID`,
    description: msg`Recurring Event ID`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  recurringEventExternalId: string | null;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarChannel,
    type: RelationType.MANY_TO_ONE,
    label: msg`Channel ID`,
    description: msg`Channel ID`,
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannelEventAssociations',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  calendarChannel: Relation<CalendarChannelWorkspaceEntity>;

  @WorkspaceJoinColumn('calendarChannel')
  calendarChannelId: string;

  @WorkspaceRelation({
    standardId:
      CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS.calendarEvent,
    type: RelationType.MANY_TO_ONE,
    label: msg`Event ID`,
    description: msg`Event ID`,
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarEventWorkspaceEntity,
    inverseSideFieldKey: 'calendarChannelEventAssociations',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  calendarEvent: Relation<CalendarEventWorkspaceEntity>;

  @WorkspaceJoinColumn('calendarEvent')
  calendarEventId: string;
}
