import { Field, InputType } from '@nestjs/graphql';

import { CalendarEventRecurrenceInput } from 'src/modules/calendar/calendar-event-creation-manager/dtos/calendar-event-recurrence.input';

@InputType()
export class CreateCalendarEventInput {
  @Field(() => String)
  connectedAccountId: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String)
  startsAt: string;

  @Field(() => String)
  endsAt: string;

  @Field(() => Boolean, { nullable: true })
  isFullDay?: boolean;

  @Field(() => String, { nullable: true })
  timeZone?: string;

  // Comma-separated attendee email addresses.
  @Field(() => String, { nullable: true })
  attendees?: string;

  @Field(() => Boolean, { nullable: true })
  sendInvitations?: boolean;

  @Field(() => Boolean, { nullable: true })
  addConferencing?: boolean;

  @Field(() => CalendarEventRecurrenceInput, { nullable: true })
  recurrence?: CalendarEventRecurrenceInput;
}
