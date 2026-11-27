import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ObjectViewsHash')
export class ObjectViewsHashDTO {
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field()
  hash: string;
}
