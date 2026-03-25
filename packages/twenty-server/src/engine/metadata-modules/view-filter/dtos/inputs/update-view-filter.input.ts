import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { ViewFilterOperand } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

@InputType()
class UpdateViewFilterInputUpdates {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  fieldMetadataId?: string;

  @IsOptional()
  @IsEnum(ViewFilterOperand)
  @Field({ nullable: true })
  operand?: ViewFilterOperand;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  value?: ViewFilterValue;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  viewFilterGroupId?: string;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  positionInViewFilterGroup?: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  subFieldName?: string;
}

@InputType()
export class UpdateViewFilterInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the view filter to update',
  })
  id: string;

  @Type(() => UpdateViewFilterInputUpdates)
  @ValidateNested()
  @Field(() => UpdateViewFilterInputUpdates, {
    description: 'The view filter to update',
  })
  update: UpdateViewFilterInputUpdates;
}
