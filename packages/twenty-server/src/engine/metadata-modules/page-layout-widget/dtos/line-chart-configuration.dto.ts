import { Field, Int, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { CalendarStartDay } from 'twenty-shared/constants';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { ObjectRecordGroupByDateGranularity } from 'src/engine/metadata-modules/page-layout-widget/enums/date-granularity.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

@ObjectType('LineChartConfiguration')
export class LineChartConfigurationDTO
  implements PageLayoutWidgetConfigurationBase
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.LINE_CHART])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.LINE_CHART;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  aggregateFieldMetadataId: string;

  @Field(() => AggregateOperations)
  @IsEnum(AggregateOperations)
  @IsNotEmpty()
  aggregateOperation: AggregateOperations;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  primaryAxisGroupByFieldMetadataId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  primaryAxisGroupBySubFieldName?: string;

  @Field(() => ObjectRecordGroupByDateGranularity, {
    nullable: true,
    defaultValue: ObjectRecordGroupByDateGranularity.DAY,
  })
  @IsEnum(ObjectRecordGroupByDateGranularity)
  @IsOptional()
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity;

  @Field(() => GraphOrderBy, {
    nullable: true,
    defaultValue: GraphOrderBy.FIELD_ASC,
  })
  @IsEnum(GraphOrderBy)
  @IsOptional()
  primaryAxisOrderBy?: GraphOrderBy;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  primaryAxisManualSortOrder?: string[];

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  secondaryAxisGroupByFieldMetadataId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  secondaryAxisGroupBySubFieldName?: string;

  @Field(() => ObjectRecordGroupByDateGranularity, {
    nullable: true,
    defaultValue: ObjectRecordGroupByDateGranularity.DAY,
  })
  @IsEnum(ObjectRecordGroupByDateGranularity)
  @IsOptional()
  secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity;

  @Field(() => GraphOrderBy, { nullable: true })
  @IsEnum(GraphOrderBy)
  @IsOptional()
  secondaryAxisOrderBy?: GraphOrderBy;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  secondaryAxisManualSortOrder?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  omitNullValues?: boolean;

  @Field(() => AxisNameDisplay, {
    nullable: true,
    defaultValue: AxisNameDisplay.NONE,
  })
  @IsEnum(AxisNameDisplay)
  @IsOptional()
  axisNameDisplay?: AxisNameDisplay;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  displayDataLabel?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  displayLegend?: boolean;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  rangeMin?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  rangeMax?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  color?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  filter?: ObjectRecordFilter;

  @Field(() => Boolean, {
    nullable: true,
  })
  @IsBoolean()
  @IsOptional()
  isStacked?: boolean;

  @Field(() => Boolean, {
    nullable: true,
  })
  @IsBoolean()
  @IsOptional()
  isCumulative?: boolean;

  @Field(() => String, { nullable: true, defaultValue: 'UTC' })
  @IsTimeZone()
  @IsOptional()
  timezone?: string;

  @Field(() => Int, { nullable: true, defaultValue: CalendarStartDay.MONDAY })
  @IsOptional()
  @Min(0)
  @Max(7)
  firstDayOfTheWeek?: number;
}
