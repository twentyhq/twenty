import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('RowLevelPermissionPredicate')
export class RowLevelPermissionPredicateDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  fieldMetadataId: string;

  @Field(() => String)
  objectMetadataId: string;

  @Field(() => String)
  operand: string;

  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @Field(() => String, { nullable: true })
  workspaceMemberFieldMetadataId?: string | null;

  @Field(() => String, { nullable: true })
  workspaceMemberSubFieldName?: string | null;

  @Field(() => String, { nullable: true })
  rowLevelPermissionPredicateGroupId?: string | null;

  @Field(() => Number, { nullable: true })
  positionInRowLevelPermissionPredicateGroup?: number | null;

  @Field(() => String)
  workspaceId: string;

  @Field(() => String)
  roleId: string;

  @Field(() => String)
  value: string;
}
