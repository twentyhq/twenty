import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsTimeZone,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { DashboardFilterValueInput } from 'src/modules/dashboard/chart-data/dtos/inputs/dashboard-filter-value.input';

@InputType()
export class BarChartDataInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  objectMetadataId: string;

  @Field(() => GraphQLJSON)
  @ValidateNested()
  @Type(() => BarChartConfigurationDTO)
  @IsNotEmpty()
  configuration: BarChartConfigurationDTO;

  @Field(() => [DashboardFilterValueInput], { nullable: true })
  @IsArray()
  @ArrayUnique(
    ({ pageLayoutFilterId }: DashboardFilterValueInput) => pageLayoutFilterId,
  )
  @ValidateNested({ each: true })
  @Type(() => DashboardFilterValueInput)
  @IsOptional()
  dashboardFilterValues?: DashboardFilterValueInput[] | null;

  @Field(() => String, { nullable: true })
  @ValidateIf(
    ({
      dashboardFilterValues,
      viewerTimeZone,
    }: Pick<BarChartDataInput, 'dashboardFilterValues' | 'viewerTimeZone'>) =>
      isNonEmptyArray(dashboardFilterValues) || isDefined(viewerTimeZone),
  )
  @IsTimeZone()
  viewerTimeZone?: string | null;
}
