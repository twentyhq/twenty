import { Field, Float, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  type PageLayoutFilterCondition,
  PageLayoutFilterType,
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class PageLayoutFilterConditionInput implements PageLayoutFilterCondition {
  @Field(() => ViewFilterOperand)
  @IsEnum(ViewFilterOperand)
  operand: ViewFilterOperand;

  @Field()
  @IsString()
  value: string;
}

@InputType()
class PageLayoutFilterValueInput implements PageLayoutFilterValue {
  @Field(() => [PageLayoutFilterConditionInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageLayoutFilterConditionInput)
  conditions: PageLayoutFilterConditionInput[];
}

@InputType()
export class PageLayoutFilterInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  label: string;

  @Field(() => PageLayoutFilterType)
  @IsEnum(PageLayoutFilterType)
  type: PageLayoutFilterType;

  @Field(() => Float)
  @IsNumber()
  position: number;

  @Field(() => PageLayoutFilterValueInput, { nullable: true })
  @ValidateNested()
  @Type(() => PageLayoutFilterValueInput)
  @IsOptional()
  defaultValue?: PageLayoutFilterValueInput | null;
}
