import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('EmitAppEventOutput')
export class EmitAppEventOutput {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  occurredAt: string;
}
