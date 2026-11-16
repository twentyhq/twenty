import { Field, Float, InputType } from '@nestjs/graphql';

import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { ViewFilterOperand } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

@InputType()
export class UpsertViewWidgetViewFilterInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @IsOptional()
  @IsEnum(ViewFilterOperand)
  @Field({ nullable: true })
  operand?: ViewFilterOperand;

  @IsDefined()
  @Field(() => GraphQLJSON, { nullable: false })
  value: ViewFilterValue;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  viewFilterGroupId?: string | null;

  @IsOptional()
  @IsNumber()
  @Field(() => Float, { nullable: true })
  positionInViewFilterGroup?: number | null;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  subFieldName?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  relationTargetFieldMetadataId?: string | null;
}
