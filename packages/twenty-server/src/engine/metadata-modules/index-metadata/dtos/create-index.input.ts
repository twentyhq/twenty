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
export class CreateIndexInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId!: string;

  // Ordered list of field metadata ids that make up the index. Order matters
  // for composite indexes — Postgres uses the leading column first.
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  @Field(() => [UUIDScalarType])
  fieldMetadataIds!: string[];

  @IsEnum(IndexType)
  @Field(() => IndexType, { defaultValue: IndexType.BTREE })
  indexType!: IndexType;

  // Optional partial-index predicate (e.g. "active = true"). Server stores it
  // raw and Postgres validates it when the index is created.
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  indexWhereClause?: string;
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
