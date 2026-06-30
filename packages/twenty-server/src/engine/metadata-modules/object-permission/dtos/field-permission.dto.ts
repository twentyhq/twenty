import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('FieldPermission')
export class FieldPermissionDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  objectMetadataId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  roleId: string;

  @Field(() => Boolean, { nullable: true })
  canReadFieldValue?: boolean | null;

  @Field(() => Boolean, { nullable: true })
  canUpdateFieldValue?: boolean | null;
}
