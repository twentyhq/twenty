import { Field, HideField, InputType } from '@nestjs/graphql';

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
import { ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

@InputType()
export class CreateViewFilterInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @IsOptional()
  @IsEnum(ViewFilterOperand)
  @Field({ nullable: true, defaultValue: ViewFilterOperand.CONTAINS })
  operand?: ViewFilterOperand;

  @IsDefined()
  @Field(() => GraphQLJSON, { nullable: false })
  value: ViewFilterValue;

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

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}
