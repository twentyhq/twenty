import { ObjectType, ID, Field } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { FieldMetadataType } from 'src/engine-metadata/field-metadata/field-metadata.entity';
import { TimelineCalendarEventAttendee } from 'src/engine/modules/calendar/dtos/timeline-calendar-event-attendee.dto';
import {
  calendarChannelStandardFieldIds,
  calendarEventStandardFieldIds,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { CalendarChannelVisibility } from 'src/modules/calendar/standard-objects/calendar-channel.object-metadata';

@ObjectType('TimelineCalendarEvent')
export class TimelineCalendarEvent {
  @IDField(() => ID)
  id: string;

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
    label: 'Start DateTime',
    description: 'Start DateTime',
    icon: 'IconCalendarClock',
  })
  @IsNullable()
  startsAt: string | null;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.endsAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'End DateTime',
    description: 'End DateTime',
    icon: 'IconCalendarClock',
  })
  @IsNullable()
  endsAt: string | null;

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
    standardId: calendarEventStandardFieldIds.conferenceSolution,
    type: FieldMetadataType.TEXT,
    label: 'Conference Solution',
    description: 'Conference Solution',
    icon: 'IconScreenShare',
  })
  conferenceSolution: string;

  @FieldMetadata({
    standardId: calendarEventStandardFieldIds.conferenceUri,
    type: FieldMetadataType.TEXT,
    label: 'Conference URI',
    description: 'Conference URI',
    icon: 'IconLink',
  })
  conferenceUri: string;

  @Field(() => [TimelineCalendarEventAttendee])
  eventAttendees: TimelineCalendarEventAttendee[];

  @FieldMetadata({
    standardId: calendarChannelStandardFieldIds.visibility,
    type: FieldMetadataType.SELECT,
    label: 'Visibility',
    description: 'Visibility',
    icon: 'IconEyeglass',
    options: [
      {
        value: CalendarChannelVisibility.METADATA,
        label: 'Metadata',
        position: 0,
        color: 'green',
      },
      {
        value: CalendarChannelVisibility.SHARE_EVERYTHING,
        label: 'Share Everything',
        position: 1,
        color: 'orange',
      },
    ],
    defaultValue: { value: CalendarChannelVisibility.SHARE_EVERYTHING },
  })
  visibility: string;
}
