import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AnswerToolCallResult')
export class AnswerToolCallResultDTO {
  // Only a chat conversation resumes as a stream, once its last call is
  // answered; a workflow run resumes in its own executor.
  @Field(() => String, { nullable: true })
  streamId: string | null;
}
