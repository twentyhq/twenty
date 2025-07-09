import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('FieldPermission')
export class FieldPermissionDTO {
  @Field({ nullable: false })
  id: string;

  @Field({ nullable: false })
  objectMetadataId: string;

  @Field({ nullable: false })
  fieldMetadataId: string;

  @Field({ nullable: false })
  roleId: string;

  @Field(() => Boolean, { nullable: true })
  canReadFieldValue?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  canUpdateFieldValue?: boolean | null;
}
