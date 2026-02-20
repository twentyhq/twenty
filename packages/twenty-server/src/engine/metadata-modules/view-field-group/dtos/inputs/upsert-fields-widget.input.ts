import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UpsertFieldsWidgetGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget-group.input';

@InputType()
export class UpsertFieldsWidgetInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description:
      'The id of the fields widget whose groups and fields to upsert',
  })
  widgetId: string;

  @ValidateNested({ each: true })
  @Type(() => UpsertFieldsWidgetGroupInput)
  @Field(() => [UpsertFieldsWidgetGroupInput])
  groups: UpsertFieldsWidgetGroupInput[];
}
