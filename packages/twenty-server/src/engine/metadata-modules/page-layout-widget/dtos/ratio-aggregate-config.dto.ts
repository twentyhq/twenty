import { Field, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { SerializedRelation } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RatioAggregateConfig')
export class RatioAggregateConfigDTO {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  fieldMetadataId: SerializedRelation;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  optionValue: string;
}
