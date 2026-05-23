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

  // For composite-typed parent fields (Address, Currency, ...), the user
  // picks a specific sub-property name (e.g. 'addressCity', 'amountMicros').
  // Required for composite parents, must be null/absent for scalar/relation
  // parents — validated server-side.
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

  // Ordered list of fields that make up the index. Order matters for
  // composite indexes — Postgres uses the leading column first.
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

  // Partial-index WHERE clause is intentionally NOT exposed on this input.
  // The server-side validateAndReturnIndexWhereClause util only allows a
  // hardcoded allowlist (currently just `"deletedAt" IS NULL`), so a
  // free-text WHERE field on the user-facing API would mislead callers.
  // System indexes that legitimately use WHERE clauses go through other
  // code paths that bypass this DTO.
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
