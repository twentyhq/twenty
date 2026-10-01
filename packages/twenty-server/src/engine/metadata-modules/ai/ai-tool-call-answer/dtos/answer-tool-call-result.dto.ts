import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AnswerToolCallResult')
export class AnswerToolCallResultDTO {
  // set only when a chat's last pending call is answered; workflow runs resume in their own executor
  @Field(() => String, { nullable: true })
  streamId: string | null;
}
