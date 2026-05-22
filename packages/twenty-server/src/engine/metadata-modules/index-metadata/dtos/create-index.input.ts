import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
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
