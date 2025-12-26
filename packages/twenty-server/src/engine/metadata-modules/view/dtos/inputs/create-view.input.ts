import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { ViewCalendarLayout } from 'src/engine/metadata-modules/view/enums/view-calendar-layout.enum';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';

@InputType()
export class CreateViewInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsString()
  @IsNotEmpty()
  @IsValidMetadataName()
  @Field({ nullable: false })
  name: string;

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  objectMetadataId: string;

  @IsEnum(ViewType)
  @Field(() => ViewType, { nullable: true, defaultValue: ViewType.TABLE })
  type?: ViewType;

  @IsOptional()
  @IsEnum(ViewKey)
  @Field(() => ViewKey, { nullable: true })
  key?: ViewKey;

  @IsString()
  @Field({ nullable: false })
  icon: string;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true, defaultValue: 0 })
  position?: number;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false })
  isCompact?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false })
  shouldHideEmptyGroups?: boolean;

  @IsOptional()
  @IsEnum(ViewOpenRecordIn)
  @Field(() => ViewOpenRecordIn, {
    nullable: true,
    defaultValue: ViewOpenRecordIn.SIDE_PANEL,
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
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  mainGroupByFieldMetadataId?: string;

  @IsOptional()
  @IsEnum(ViewVisibility)
  @Field(() => ViewVisibility, {
    nullable: true,
  })
  visibility?: ViewVisibility;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}
