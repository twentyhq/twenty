import { ObjectType, ID, Field } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { TimelineCalendarEventAttendee } from 'src/engine/modules/calendar/dtos/timeline-calendar-event-attendee.dto';

@ObjectType('TimelineCalendarEvent')
export class TimelineCalendarEvent {
  @IDField(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  isCanceled: boolean;

  @Field()
  isFullDay: boolean;

  @Field()
  startsAt: string;

  @Field()
  endsAt: string;

  @Field()
  externalCreatedAt: string;

  @Field()
  externalUpdatedAt: string;

  @Field()
  description: string;

  @Field()
  location: string;

  @Field()
  iCalUID: string;

  @Field()
  conferenceSolution: string;

  @Field()
  conferenceUri: string;

  @Field()
  recurringEventExternalId: string;

  @Field()
  calendarChannelEventAssociations: string[];

  @Field()
  eventAttendees: TimelineCalendarEventAttendee[];
}
