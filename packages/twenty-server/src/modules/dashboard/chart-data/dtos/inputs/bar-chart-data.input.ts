import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';

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

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  dashboardFilterValues?: unknown;

  @Field(() => String, { nullable: true })
  @IsOptional()
  dashboardFilterTimeZone?: string | null;
}
