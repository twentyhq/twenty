import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateRowLevelPermissionPredicateInput {
  @Field(() => String)
  fieldMetadataId: string;

  @Field(() => String)
  objectMetadataId: string;

  @Field(() => String)
  operand: string;

  @Field(() => String)
  value: string;

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
}
