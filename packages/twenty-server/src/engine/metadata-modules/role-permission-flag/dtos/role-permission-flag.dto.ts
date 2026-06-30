import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RolePermissionFlag')
export class RolePermissionFlagDTO {
  @Field(() => UUIDScalarType, { nullable: false })
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  roleId: string;

  @Field(() => String, { nullable: false })
  flag: string;
}
