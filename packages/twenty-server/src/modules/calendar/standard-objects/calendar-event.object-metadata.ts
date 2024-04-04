import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { FeatureFlagKeys } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/gate.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CalendarChannelEventAssociationObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-channel-event-association.object-metadata';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { calendarEventStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { LinkMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/link.composite-type';

@ObjectMetadata({
  standardId: standardObjectIds.calendarEvent,
  namePlural: 'calendarEvents',
  labelSingular: 'Calendar event',
  labelPlural: 'Calendar events',
  description: 'Calendar events',
  icon: 'IconCalendar',
})
@IsSystem()
@Gate({
  featureFlag: FeatureFlagKeys.IsCalendarEnabled,
})
export class CalendarEventObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.title,
    type: FieldMetadataType.TEXT,
    label: 'Title',
    description: 'Title',
    icon: 'IconH1',
  })
  title: string;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.isCanceled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is canceled',
    description: 'Is canceled',
    icon: 'IconCalendarCancel',
  })
  isCanceled: boolean;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.isFullDay,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Full Day',
    description: 'Is Full Day',
    icon: 'Icon24Hours',
  })
  isFullDay: boolean;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.startsAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Start Date',
    description: 'Start Date',
    icon: 'IconCalendarClock',
  })
  @IsNullable()
  startsAt: string | null;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.endsAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'End Date',
    description: 'End Date',
    icon: 'IconCalendarClock',
  })
  @IsNullable()
  endsAt: string | null;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.externalCreatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Creation DateTime',
    description: 'Creation DateTime',
    icon: 'IconCalendarPlus',
  })
  @IsNullable()
  externalCreatedAt: string | null;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.externalUpdatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Update DateTime',
    description: 'Update DateTime',
    icon: 'IconCalendarCog',
  })
  @IsNullable()
  externalUpdatedAt: string | null;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.description,
    type: FieldMetadataType.TEXT,
    label: 'Description',
    description: 'Description',
    icon: 'IconFileDescription',
  })
  description: string;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.location,
    type: FieldMetadataType.TEXT,
    label: 'Location',
    description: 'Location',
    icon: 'IconMapPin',
  })
  location: string;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.iCalUID,
    type: FieldMetadataType.TEXT,
    label: 'iCal UID',
    description: 'iCal UID',
    icon: 'IconKey',
  })
  iCalUID: string;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.conferenceSolution,
    type: FieldMetadataType.TEXT,
    label: 'Conference Solution',
    description: 'Conference Solution',
    icon: 'IconScreenShare',
  })
  conferenceSolution: string;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.conferenceLink,
    type: FieldMetadataType.LINK,
    label: 'Meet Link',
    description: 'Meet Link',
    icon: 'IconLink',
  })
  @IsNullable()
  conferenceLink: LinkMetadata;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.recurringEventExternalId,
    type: FieldMetadataType.TEXT,
    label: 'Recurring Event ID',
    description: 'Recurring Event ID',
    icon: 'IconHistory',
  })
  recurringEventExternalId: string;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.calendarChannelEventAssociations,
    type: FieldMetadataType.RELATION,
    label: 'Calendar Channel Event Associations',
    description: 'Calendar Channel Event Associations',
    icon: 'IconCalendar',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CalendarChannelEventAssociationObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
    inverseSideFieldKey: 'calendarEvent',
  })
  @Gate({
    featureFlag: 'IS_CALENDAR_ENABLED',
  })
  calendarChannelEventAssociations: CalendarChannelEventAssociationObjectMetadata[];

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.eventParticipants,
    type: FieldMetadataType.RELATION,
    label: 'Event Participants',
    description: 'Event Participants',
    icon: 'IconUserCircle',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CalendarEventParticipantObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  eventParticipants: CalendarEventParticipantObjectMetadata[];
}
