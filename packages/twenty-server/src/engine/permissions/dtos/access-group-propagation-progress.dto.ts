import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AccessGroupPropagationProgress')
export class AccessGroupPropagationProgressDTO {
  @Field(() => Int)
  totalRecordCount: number;

  @Field(() => Int)
  remainingRecordCount: number;

  @Field(() => Boolean)
  isInProgress: boolean;
}
