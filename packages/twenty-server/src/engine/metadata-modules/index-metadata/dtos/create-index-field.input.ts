import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderByDirection } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

  @IsOptional()
  @IsEnum(OrderByDirection)
  @Field(() => OrderByDirection, {
    nullable: true,
    description:
      'Sort order of this column in the index. Match the orderBy you query with, e.g. DescNullsLast for a newest first list. Btree only.',
  })
  direction?: OrderByDirection;
}
