import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { LineChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.validation-schema';

@InputType()
export class LineChartDataInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  @IsNotEmpty()
  objectMetadataId: string;

  @Field(() => GraphQLJSON)
  @ValidateNested()
  @Type(() => LineChartConfigurationValidationSchema)
  @IsNotEmpty()
  configuration: LineChartConfigurationValidationSchema;
}
