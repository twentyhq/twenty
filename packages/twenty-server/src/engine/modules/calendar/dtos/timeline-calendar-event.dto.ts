import { ObjectType, ID, Field } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { TimelineCalendarEventAttendee } from 'src/engine/modules/calendar/dtos/timeline-calendar-event-attendee.dto';

@ObjectType('TimelineCalendarEvent')
export class TimelineCalendarEvent {
  @IDField(() => ID)
  id: string;

  @Field()
  title: string | null;

  @Field()
  isCanceled: boolean;

  @Field()
  isFullDay: boolean;

  @Field()
  startsAt: string;

  @Field()
  endsAt: string;

  @Field()
  description: string | null;

  @Field()
  location: string | null;

  @Field()
  conferenceSolution: string | null;

  @Field()
  conferenceUri: string | null;

  @Field()
  eventAttendees: TimelineCalendarEventAttendee[];

  @Field()
  visibility: string;
}
