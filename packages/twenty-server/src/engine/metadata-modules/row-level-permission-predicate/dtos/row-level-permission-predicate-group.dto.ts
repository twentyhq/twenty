import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('RowLevelPermissionPredicateGroup')
export class RowLevelPermissionPredicateGroupDTO {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  parentRowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => String)
  logicalOperator: string;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;

  @Field(() => String)
  workspaceId: string;

  @Field(() => String)
  roleId: string;
}
