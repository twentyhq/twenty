import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RatioAggregateConfig')
@InputType('RatioAggregateConfigInput')
export class RatioAggregateConfigDTO {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  fieldMetadataId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  optionValue: string;
}
