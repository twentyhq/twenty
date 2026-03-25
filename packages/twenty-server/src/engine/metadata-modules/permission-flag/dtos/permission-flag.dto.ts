import { Field, ObjectType } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('PermissionFlag')
export class PermissionFlagDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  roleId: string;

  @Field({ nullable: false })
  flag: PermissionFlagType;
}
