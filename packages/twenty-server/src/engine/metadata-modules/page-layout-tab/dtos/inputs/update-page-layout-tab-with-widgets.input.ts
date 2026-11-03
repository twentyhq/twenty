import { Field, Float, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import {
  ConditionalDisplay,
  PageLayoutTabLayoutMode,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget-with-id.input';

@InputType()
export class UpdatePageLayoutTabWithWidgetsInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => Float)
  @IsNumber()
  @IsNotEmpty()
  position: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  icon?: string | null;

  @Field(() => PageLayoutTabLayoutMode, {
    nullable: true,
    defaultValue: PageLayoutTabLayoutMode.GRID,
  })
  @IsEnum(PageLayoutTabLayoutMode)
  @IsOptional()
  layoutMode?: PageLayoutTabLayoutMode;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  conditionalDisplay?: ConditionalDisplay | null;

  @Field(() => [UpdatePageLayoutWidgetWithIdInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePageLayoutWidgetWithIdInput)
  @IsNotEmpty()
  widgets: UpdatePageLayoutWidgetWithIdInput[];
}
