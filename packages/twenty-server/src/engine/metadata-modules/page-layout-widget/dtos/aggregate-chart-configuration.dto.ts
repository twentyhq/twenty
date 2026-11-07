import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { CalendarStartDay } from 'twenty-shared/constants';
import {
  type AggregateChartConfiguration,
  AggregateOperations,
  type ChartFilter,
  SerializedRelation,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { DashboardFilterBindingDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/dashboard-filter-binding.dto';
import { RatioAggregateConfigDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/ratio-aggregate-config.dto';
import { ChartNumberFormat } from 'src/engine/metadata-modules/page-layout-widget/enums/chart-number-format.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('AggregateChartConfiguration')
export class AggregateChartConfigurationDTO implements AggregateChartConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.AGGREGATE_CHART])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.AGGREGATE_CHART;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  aggregateFieldMetadataId: SerializedRelation;

  @Field(() => AggregateOperations)
  @IsEnum(AggregateOperations)
  @IsNotEmpty()
  aggregateOperation: AggregateOperations;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  label?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  displayDataLabel?: boolean;

  @Field(() => ChartNumberFormat, { nullable: true })
  @IsEnum(ChartNumberFormat)
  @IsOptional()
  numberFormat?: ChartNumberFormat;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  filter?: ChartFilter;

  @Field(() => [DashboardFilterBindingDTO], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DashboardFilterBindingDTO)
  @IsOptional()
  dashboardFilterBindings?: DashboardFilterBindingDTO[] | null;

  @Field(() => String, { nullable: true, defaultValue: 'UTC' })
  @IsTimeZone()
  @IsOptional()
  timezone?: string;

  @Field(() => Int, { nullable: true, defaultValue: CalendarStartDay.MONDAY })
  @IsOptional()
  @Min(0)
  @Max(7)
  firstDayOfTheWeek?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  prefix?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  suffix?: string;

  @Field(() => RatioAggregateConfigDTO, { nullable: true })
  @ValidateNested()
  @Type(() => RatioAggregateConfigDTO)
  @IsOptional()
  ratioAggregateConfig?: RatioAggregateConfigDTO;
}
