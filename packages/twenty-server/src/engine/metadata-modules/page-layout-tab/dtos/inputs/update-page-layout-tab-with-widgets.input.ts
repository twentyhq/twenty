import { Field, Float, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

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

  @Field(() => [UpdatePageLayoutWidgetWithIdInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePageLayoutWidgetWithIdInput)
  @IsNotEmpty()
  widgets: UpdatePageLayoutWidgetWithIdInput[];
}
