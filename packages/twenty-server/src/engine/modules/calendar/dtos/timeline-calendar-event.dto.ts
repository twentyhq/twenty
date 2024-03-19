import { ObjectType, ID, Field } from '@nestjs/graphql';

import { TimelineCalendarEventAttendee } from 'src/engine/modules/calendar/dtos/timeline-calendar-event-attendee.dto';

@ObjectType('TimelineCalendarEvent')
export class TimelineCalendarEvent {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  isCanceled: boolean;

  @Field()
  isFullDay: boolean;

  @Field()
  startsAt: Date;

  @Field()
  endsAt: Date;

  @Field()
  description: string;

  @Field()
  location: string;

  @Field()
  conferenceSolution: string;

  @Field()
  conferenceUri: string;

  @Field(() => [TimelineCalendarEventAttendee])
  attendees: TimelineCalendarEventAttendee[];

  @Field()
  visibility: string;
}
