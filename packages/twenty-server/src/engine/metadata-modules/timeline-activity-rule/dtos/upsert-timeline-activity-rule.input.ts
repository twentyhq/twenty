import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// Upserts on the natural key (objectMetadataId, relationFieldMetadataId):
// editing a derived rule materializes it, so the caller never needs to know
// whether a row already exists.
@InputType()
export class UpsertTimelineActivityRuleInput {
  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  relationFieldMetadataId?: string | null;

  @IsArray()
  @IsOptional()
  @Field(() => [String], { nullable: true })
  actions?: string[];

  @IsArray()
  @IsOptional()
  @Field(() => [UUIDScalarType], { nullable: true })
  triggerFieldMetadataIds?: string[] | null;

  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}
