import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('CreateCalendarEventOutput')
export class CreateCalendarEventOutputDTO {
  @Field(() => Boolean)
  success: boolean;

  // Stable cross-provider identifier; query the created event in Twenty by iCalUid.
  @Field(() => String, { nullable: true })
  iCalUid?: string;

  // Absent when the event reached the provider but persistence failed; the next
  // sync then recovers the record, so callers must handle it being unset.
  @Field(() => String, { nullable: true })
  calendarEventId?: string;

  @Field(() => String, { nullable: true })
  conferenceLink?: string;

  @Field(() => String, { nullable: true })
  error?: string;
}
