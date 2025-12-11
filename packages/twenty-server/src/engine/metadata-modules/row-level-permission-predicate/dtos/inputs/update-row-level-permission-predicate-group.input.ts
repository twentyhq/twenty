import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateRowLevelPermissionPredicateGroupInput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  workspaceId: string;

  @Field(() => String, { nullable: true })
  parentRowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => String, { nullable: true })
  logicalOperator?: string;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;
}
