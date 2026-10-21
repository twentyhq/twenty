import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MinimalRole')
export class MinimalRoleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  label: string;

  @Field(() => String, { nullable: true })
  icon: string | null;
}
