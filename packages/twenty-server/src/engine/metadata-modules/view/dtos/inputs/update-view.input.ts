import { Field, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  AggregateOperations,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { ViewCalendarLayout } from 'src/engine/metadata-modules/view/enums/view-calendar-layout.enum';
import { ViewRoadmapZoom } from 'src/engine/metadata-modules/view/enums/view-roadmap-zoom.enum';

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
  @IsEnum(ViewRoadmapZoom)
  @Field(() => ViewRoadmapZoom, { nullable: true })
  roadmapDefaultZoom?: ViewRoadmapZoom;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  roadmapShowToday?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  roadmapShowWeekends?: boolean;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldStartId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldEndId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldGroupId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldColorId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldLabelId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldPlannedStartId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldPlannedEndId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldStatusId?: string | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  roadmapFieldBlockedById?: string | null;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  roadmapShowDeviation?: boolean;
}
