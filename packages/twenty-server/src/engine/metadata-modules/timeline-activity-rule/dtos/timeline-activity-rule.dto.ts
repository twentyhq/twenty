import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// An effective rule: id is null while the rule is only derived from the data
// model and no override row has been persisted yet.
@ObjectType('TimelineActivityRule')
export class TimelineActivityRuleDTO {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  id: string | null;

  @IsUUID()
  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  relationFieldMetadataId: string | null;

  @IsString()
  @Field()
  resolution: string;

  @IsArray()
  @Field(() => [String])
  actions: string[];

  @IsArray()
  @IsOptional()
  @Field(() => [UUIDScalarType], { nullable: true })
  triggerFieldMetadataIds: string[] | null;

  @IsBoolean()
  @Field()
  isActive: boolean;

  @IsBoolean()
  @Field()
  isStandard: boolean;

  @IsBoolean()
  @Field()
  isOverridden: boolean;
}
