import { Field, Float, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import {
  ConditionalDisplay,
  PageLayoutTabLayoutMode,
} from 'twenty-shared/types';

@InputType()
export class UpdatePageLayoutTabInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  position?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  icon?: string | null;

  @Field(() => PageLayoutTabLayoutMode, { nullable: true })
  @IsEnum(PageLayoutTabLayoutMode)
  @IsOptional()
  layoutMode?: PageLayoutTabLayoutMode;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  conditionalDisplay?: ConditionalDisplay | null;
}
