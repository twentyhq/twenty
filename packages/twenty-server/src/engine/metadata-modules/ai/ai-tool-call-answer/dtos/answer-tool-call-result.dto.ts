import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AnswerToolCallResult')
export class AnswerToolCallResultDTO {
  // only chats resume as a stream; workflow runs resume in their own executor
  @Field(() => String, { nullable: true })
  streamId: string | null;
}
