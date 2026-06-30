import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  AggregateOperations,
  ViewCalendarLayout,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { KANBAN_COLUMN_MAX_WIDTH } from 'src/engine/metadata-modules/view/constants/kanban-column-max-width.constant';
import { KANBAN_COLUMN_MIN_WIDTH } from 'src/engine/metadata-modules/view/constants/kanban-column-min-width.constant';

// TODO: this should be refactored like for view-field.input.ts
// This is a temporary fix as we were extending the CreateViewInput class which was adding default values for the non filled fields
@InputType()
export class UpdateViewInput {
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id: string;

  @IsOptional()
  @IsNotEmpty()
  @IsValidMetadataName()
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @IsEnum(ViewType)
  @Field(() => ViewType, { nullable: true })
  type?: ViewType;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isCompact?: boolean;

  @IsOptional()
  @IsEnum(ViewOpenRecordIn)
  @Field(() => ViewOpenRecordIn, {
    nullable: true,
  })
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
  @IsString()
  @Field({ nullable: true })
  anyFieldFilterValue?: string;

  @IsOptional()
  @IsEnum(ViewCalendarLayout)
  @Field(() => ViewCalendarLayout, { nullable: true })
  calendarLayout?: ViewCalendarLayout;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  calendarFieldMetadataId?: string;

  @IsOptional()
  @IsEnum(ViewVisibility)
  @Field(() => ViewVisibility, { nullable: true })
  visibility?: ViewVisibility;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  mainGroupByFieldMetadataId?: string | null;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  shouldHideEmptyGroups?: boolean;

  @IsOptional()
  @IsInt()
  @Min(KANBAN_COLUMN_MIN_WIDTH)
  @Max(KANBAN_COLUMN_MAX_WIDTH)
  @Field(() => Int, { nullable: true })
  kanbanColumnWidth?: number | null;
}
