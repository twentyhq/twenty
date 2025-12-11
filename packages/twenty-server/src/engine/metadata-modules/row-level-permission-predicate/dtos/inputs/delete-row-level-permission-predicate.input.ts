import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteRowLevelPermissionPredicateInput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  workspaceId: string;
}
