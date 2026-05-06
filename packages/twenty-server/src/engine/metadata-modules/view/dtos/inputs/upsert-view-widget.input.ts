import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UpsertViewWidgetViewFieldInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-field.input';
import { UpsertViewWidgetViewFilterGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-filter-group.input';
import { UpsertViewWidgetViewFilterInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-filter.input';
import { UpsertViewWidgetViewSortInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-sort.input';

@InputType()
export class UpsertViewWidgetInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the view widget (page layout widget).',
  })
  widgetId: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpsertViewWidgetViewFieldInput)
  @Field(() => [UpsertViewWidgetViewFieldInput], {
    nullable: true,
    description: 'The view fields to upsert.',
  })
  viewFields?: UpsertViewWidgetViewFieldInput[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpsertViewWidgetViewFilterInput)
  @Field(() => [UpsertViewWidgetViewFilterInput], {
    nullable: true,
    description: 'The view filters to upsert.',
  })
  viewFilters?: UpsertViewWidgetViewFilterInput[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpsertViewWidgetViewFilterGroupInput)
  @Field(() => [UpsertViewWidgetViewFilterGroupInput], {
    nullable: true,
    description: 'The view filter groups to upsert.',
  })
  viewFilterGroups?: UpsertViewWidgetViewFilterGroupInput[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpsertViewWidgetViewSortInput)
  @Field(() => [UpsertViewWidgetViewSortInput], {
    nullable: true,
    description: 'The view sorts to upsert.',
  })
  viewSorts?: UpsertViewWidgetViewSortInput[];
}
