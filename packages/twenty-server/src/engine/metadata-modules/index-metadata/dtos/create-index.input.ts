import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';

@InputType()
export class CreateIndexFieldInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  fieldMetadataId!: string;

  // Composite sub-property name (e.g. 'addressCity'). Required for composite
  // parents, must be absent for scalar/relation parents.
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  subFieldName?: string;
}

@InputType()
export class CreateIndexInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId!: string;

  // Order matters: Postgres uses the leading column first.
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Type(() => CreateIndexFieldInput)
  @ValidateNested({ each: true })
  @Field(() => [CreateIndexFieldInput])
  fields!: CreateIndexFieldInput[];

  @IsEnum(IndexType)
  @Field(() => IndexType, { defaultValue: IndexType.BTREE })
  indexType!: IndexType;

  // indexWhereClause is not exposed: the validator only allows a hardcoded
  // allowlist, so a free-text field on the user-facing API would mislead.
}

@InputType()
export class CreateOneIndexInput {
  @Type(() => CreateIndexInput)
  @ValidateNested()
  @Field(() => CreateIndexInput, {
    description: 'The custom index to create',
  })
  index!: CreateIndexInput;
}
