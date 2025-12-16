import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateRowLevelPermissionPredicateGroupInput {
  @Field(() => String, { nullable: true })
  parentRowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => String)
  logicalOperator: string;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;

  @Field(() => String)
  roleId: string;
}
