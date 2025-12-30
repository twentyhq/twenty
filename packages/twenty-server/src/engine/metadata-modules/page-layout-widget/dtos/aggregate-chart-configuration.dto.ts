import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
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

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { RatioAggregateConfigDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/ratio-aggregate-config.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

@ObjectType('AggregateChartConfiguration')
export class AggregateChartConfigurationDTO
  implements PageLayoutWidgetConfigurationBase
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.AGGREGATE_CHART])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.AGGREGATE_CHART;

  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  aggregateFieldMetadataId: string;

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

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  format?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

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
