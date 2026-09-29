import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ResolveToolCallResult')
export class ResolveToolCallResultDTO {
  // Only a chat conversation resumes as a stream; a workflow run resumes in
  // its own executor.
  @Field(() => String, { nullable: true })
  streamId: string | null;
}
