import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('OnFrontComponentUpdated')
export class OnFrontComponentUpdatedDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  builtComponentChecksum: string;

  @Field()
  updatedAt: Date;
}
