import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UpsertFieldsWidgetFieldInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget-field.input';
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

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpsertFieldsWidgetGroupInput)
  @Field(() => [UpsertFieldsWidgetGroupInput], {
    nullable: true,
    description:
      'The groups (with nested fields) to upsert. Mutually exclusive with "fields".',
  })
  groups?: UpsertFieldsWidgetGroupInput[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpsertFieldsWidgetFieldInput)
  @Field(() => [UpsertFieldsWidgetFieldInput], {
    nullable: true,
    description:
      'The ungrouped fields to upsert. When provided, all existing groups are deleted and fields are detached from groups. Mutually exclusive with "groups".',
  })
  fields?: UpsertFieldsWidgetFieldInput[];
}
