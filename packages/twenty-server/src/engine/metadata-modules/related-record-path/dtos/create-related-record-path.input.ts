/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateRelatedRecordPathInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId: string;

  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, { nullable: true })
  firstFieldMetadataId: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  secondFieldMetadataId?: string | null;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  thirdFieldMetadataId?: string | null;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isInherent?: boolean | null;
}
