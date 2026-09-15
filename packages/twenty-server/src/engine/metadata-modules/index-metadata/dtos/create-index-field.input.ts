import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsString, IsUUID } from 'class-validator';

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
}
