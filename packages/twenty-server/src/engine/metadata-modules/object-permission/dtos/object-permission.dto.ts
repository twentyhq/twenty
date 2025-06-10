import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ObjectPermission')
export class ObjectPermissionDTO {
  @Field({ nullable: false })
  objectMetadataId: string;

  @Field({ nullable: true })
  canReadObjectRecords?: boolean;

  @Field({ nullable: true })
  canUpdateObjectRecords?: boolean;

  @Field({ nullable: true })
  canSoftDeleteObjectRecords?: boolean;

  @Field({ nullable: true })
  canDestroyObjectRecords?: boolean;
}
