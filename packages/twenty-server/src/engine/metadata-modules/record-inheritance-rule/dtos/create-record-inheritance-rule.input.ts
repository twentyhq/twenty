/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateRecordInheritanceRuleInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  junctionFieldMetadataId?: string | null;
}
