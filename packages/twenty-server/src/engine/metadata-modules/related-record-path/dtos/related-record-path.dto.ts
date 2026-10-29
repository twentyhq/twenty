/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RelatedRecordPath')
export class RelatedRecordPathDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field(() => [UUIDScalarType])
  fieldMetadataIds: string[];
}
