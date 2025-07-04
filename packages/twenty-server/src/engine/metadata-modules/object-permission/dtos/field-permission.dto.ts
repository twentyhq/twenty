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

  @Field({ nullable: true })
  canReadFieldRecords?: boolean;

  @Field({ nullable: true })
  canUpdateFieldRecords?: boolean;
}
