import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('CreateCalendarEventOutput')
export class CreateCalendarEventOutputDTO {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  iCalUid?: string;

  // Unset when persistence failed after provider creation; the next sync recovers the record
  @Field(() => String, { nullable: true })
  calendarEventId?: string;

  @Field(() => String, { nullable: true })
  conferenceLink?: string;

  @Field(() => String, { nullable: true })
  error?: string;
}
