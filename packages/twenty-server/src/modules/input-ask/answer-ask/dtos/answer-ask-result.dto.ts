import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AnswerAskResult')
export class AnswerAskResultDTO {
  // Only a chat conversation resumes as a stream; a workflow run resumes in
  // its own executor.
  @Field(() => String, { nullable: true })
  streamId: string | null;
}
