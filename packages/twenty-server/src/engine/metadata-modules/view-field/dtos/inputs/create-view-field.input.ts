import { Field, HideField, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AggregateOperations } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFieldRelationScopeInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/view-field-relation-scope.input';

@InputType()
export class CreateViewFieldInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: true })
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: true })
  isCanonical?: boolean;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true, defaultValue: 0 })
  size?: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true, defaultValue: 0 })
  position?: number;

  @IsOptional()
  @IsEnum(AggregateOperations)
  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  viewFieldGroupId?: string;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  relationTargetFieldMetadataId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ViewFieldRelationScopeInput)
  @Field(() => ViewFieldRelationScopeInput, { nullable: true })
  relationScope?: ViewFieldRelationScopeInput;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  label?: string;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}
