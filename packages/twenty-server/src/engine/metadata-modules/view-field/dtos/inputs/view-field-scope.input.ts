import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

import { UpsertViewWidgetViewFilterGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-filter-group.input';
import { UpsertViewWidgetViewFilterInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-filter.input';
import { UpsertViewWidgetViewSortInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-sort.input';

@InputType()
export class ViewFieldScopeInput {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertViewWidgetViewFilterInput)
  @Field(() => [UpsertViewWidgetViewFilterInput])
  viewFilters: UpsertViewWidgetViewFilterInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertViewWidgetViewFilterGroupInput)
  @Field(() => [UpsertViewWidgetViewFilterGroupInput])
  viewFilterGroups: UpsertViewWidgetViewFilterGroupInput[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertViewWidgetViewSortInput)
  @Field(() => [UpsertViewWidgetViewSortInput])
  viewSorts: UpsertViewWidgetViewSortInput[];
}
