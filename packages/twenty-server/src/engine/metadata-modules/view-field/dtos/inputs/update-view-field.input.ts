import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
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
class UpdateViewFieldInputUpdates {
  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isVisible?: boolean;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  size?: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  position?: number;

  @IsOptional()
  @IsEnum(AggregateOperations)
  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  viewFieldGroupId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  relationTargetFieldMetadataId?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ViewFieldRelationScopeInput)
  @Field(() => ViewFieldRelationScopeInput, { nullable: true })
  relationScope?: ViewFieldRelationScopeInput | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  label?: string | null;
}

@InputType()
export class UpdateViewFieldInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the view field to update',
  })
  id: string;

  @Type(() => UpdateViewFieldInputUpdates)
  @ValidateNested()
  @Field(() => UpdateViewFieldInputUpdates, {
    description: 'The view field to update',
  })
  update: UpdateViewFieldInputUpdates;
}
