import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('CreateCalendarEventOutput')
export class CreateCalendarEventOutputDTO {
  @Field(() => Boolean)
  success: boolean;

  // Stable cross-provider identifier; query the created event in Twenty by iCalUid.
  @Field(() => String, { nullable: true })
  iCalUid?: string;

  @Field(() => String, { nullable: true })
  conferenceLink?: string;

  @Field(() => String, { nullable: true })
  error?: string;
}
