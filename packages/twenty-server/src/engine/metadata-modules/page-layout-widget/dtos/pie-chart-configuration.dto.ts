import { Field, Int, ObjectType } from '@nestjs/graphql';

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
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { CalendarStartDay } from 'twenty-shared/constants';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ObjectRecordGroupByDateGranularity } from 'src/engine/metadata-modules/page-layout-widget/enums/date-granularity.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

@ObjectType('PieChartConfiguration')
export class PieChartConfigurationDTO
  implements PageLayoutWidgetConfigurationBase
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.PIE_CHART])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.PIE_CHART;

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
  groupByFieldMetadataId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  groupBySubFieldName?: string;

  @Field(() => ObjectRecordGroupByDateGranularity, {
    nullable: true,
    defaultValue: ObjectRecordGroupByDateGranularity.DAY,
  })
  @IsEnum(ObjectRecordGroupByDateGranularity)
  @IsOptional()
  dateGranularity?: ObjectRecordGroupByDateGranularity;

  @Field(() => GraphOrderBy, {
    nullable: true,
    defaultValue: GraphOrderBy.VALUE_DESC,
  })
  @IsEnum(GraphOrderBy)
  @IsOptional()
  orderBy?: GraphOrderBy;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  manualSortOrder?: string[];

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  displayDataLabel?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  showCenterMetric?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsBoolean()
  @IsOptional()
  displayLegend?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  hideEmptyCategory?: boolean;

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
