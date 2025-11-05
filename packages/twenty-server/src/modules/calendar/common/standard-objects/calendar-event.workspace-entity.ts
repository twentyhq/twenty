import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsObjectUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-object-ui-readonly.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CALENDAR_EVENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.calendarEvent,
  namePlural: 'calendarEvents',
  labelSingular: msg`Calendar event`,
  labelPlural: msg`Calendar events`,
  description: msg`Calendar events`,
  icon: STANDARD_OBJECT_ICONS.calendarEvent,
  labelIdentifierStandardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.title,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
@WorkspaceIsObjectUIReadOnly()
export class CalendarEventWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: msg`Title`,
    description: msg`Title`,
    icon: 'IconH1',
  })
  title: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.isCanceled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is canceled`,
    description: msg`Is canceled`,
    icon: 'IconCalendarCancel',
    defaultValue: false,
  })
  isCanceled: boolean;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.isFullDay,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Full Day`,
    description: msg`Is Full Day`,
    icon: 'IconHours24',
    defaultValue: false,
  })
  isFullDay: boolean;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.startsAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Start Date`,
    description: msg`Start Date`,
    icon: 'IconCalendarClock',
  })
  @WorkspaceIsNullable()
  startsAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.endsAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`End Date`,
    description: msg`End Date`,
    icon: 'IconCalendarClock',
  })
  @WorkspaceIsNullable()
  endsAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.externalCreatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Creation DateTime`,
    description: msg`Creation DateTime`,
    icon: 'IconCalendarPlus',
  })
  @WorkspaceIsNullable()
  externalCreatedAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.externalUpdatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Update DateTime`,
    description: msg`Update DateTime`,
    icon: 'IconCalendarCog',
  })
  @WorkspaceIsNullable()
  externalUpdatedAt: string | null;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Description`,
    icon: 'IconFileDescription',
  })
  description: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.location,
    type: FieldMetadataType.TEXT,
    label: msg`Location`,
    description: msg`Location`,
    icon: 'IconMapPin',
  })
  location: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.iCalUID,
    type: FieldMetadataType.TEXT,
    label: msg`iCal UID`,
    description: msg`iCal UID`,
    icon: 'IconKey',
  })
  iCalUID: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.conferenceSolution,
    type: FieldMetadataType.TEXT,
    label: msg`Conference Solution`,
    description: msg`Conference Solution`,
    icon: 'IconScreenShare',
  })
  conferenceSolution: string;

  @WorkspaceField({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.conferenceLink,
    type: FieldMetadataType.LINKS,
    label: msg`Meet Link`,
    description: msg`Meet Link`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  conferenceLink: LinksMetadata;

  @WorkspaceRelation({
    standardId:
      CALENDAR_EVENT_STANDARD_FIELD_IDS.calendarChannelEventAssociations,
    type: RelationType.ONE_TO_MANY,
    label: msg`Calendar Channel Event Associations`,
    description: msg`Calendar Channel Event Associations`,
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelEventAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  calendarChannelEventAssociations: Relation<
    CalendarChannelEventAssociationWorkspaceEntity[]
  >;

  @WorkspaceRelation({
    standardId: CALENDAR_EVENT_STANDARD_FIELD_IDS.calendarEventParticipants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Event Participants`,
    description: msg`Event Participants`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => CalendarEventParticipantWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  calendarEventParticipants: Relation<
    CalendarEventParticipantWorkspaceEntity[]
  >;
}
