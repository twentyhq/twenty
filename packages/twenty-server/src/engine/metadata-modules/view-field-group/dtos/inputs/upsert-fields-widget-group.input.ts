import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UpsertFieldsWidgetFieldInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget-field.input';

@InputType()
export class UpsertFieldsWidgetGroupInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsNumber()
  @Field()
  position: number;

  @IsBoolean()
  @Field()
  isVisible: boolean;

  @ValidateNested({ each: true })
  @Type(() => UpsertFieldsWidgetFieldInput)
  @Field(() => [UpsertFieldsWidgetFieldInput])
  fields: UpsertFieldsWidgetFieldInput[];
}
