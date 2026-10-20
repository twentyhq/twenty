/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RecordInheritanceRule')
export class RecordInheritanceRuleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field(() => UUIDScalarType)
  parentObjectMetadataId: string;

  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  junctionFieldMetadataId: string | null;

  @Field(() => UUIDScalarType)
  applicationId: string;
}
