import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  AggregateOperations,
  ViewCalendarLayout,
  ViewOpenRecordIn,
  ViewType,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { KANBAN_COLUMN_MAX_WIDTH } from 'src/engine/metadata-modules/view/constants/kanban-column-max-width.constant';
import { KANBAN_COLUMN_MIN_WIDTH } from 'src/engine/metadata-modules/view/constants/kanban-column-min-width.constant';

@InputType()
export class UpsertViewWidgetViewSettingsInput {
  @IsOptional()
  @IsEnum(ViewType)
  @Field(() => ViewType, {
    nullable: true,
    description:
      'The layout type of the widget view. Only widget view types (TABLE_WIDGET, KANBAN_WIDGET, CALENDAR_WIDGET) are allowed.',
  })
  type?: ViewType;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  mainGroupByFieldMetadataId?: string | null;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  shouldHideEmptyGroups?: boolean;

  @IsOptional()
  @IsEnum(ViewOpenRecordIn)
  @Field(() => ViewOpenRecordIn, { nullable: true })
  openRecordIn?: ViewOpenRecordIn;

  @IsOptional()
  @IsEnum(AggregateOperations)
  @Field(() => AggregateOperations, { nullable: true })
  kanbanAggregateOperation?: AggregateOperations;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  kanbanAggregateOperationFieldMetadataId?: string;

  @IsOptional()
  @IsInt()
  @Min(KANBAN_COLUMN_MIN_WIDTH)
  @Max(KANBAN_COLUMN_MAX_WIDTH)
  @Field(() => Int, { nullable: true })
  kanbanColumnWidth?: number | null;

  @IsOptional()
  @IsEnum(ViewCalendarLayout)
  @Field(() => ViewCalendarLayout, { nullable: true })
  calendarLayout?: ViewCalendarLayout;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  calendarFieldMetadataId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  calendarEndFieldMetadataId?: string | null;
}
