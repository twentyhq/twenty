import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  type RecordTableConfiguration,
  type SerializedRelation,
} from 'twenty-shared/types';

import { DashboardFilterBindingDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/dashboard-filter-binding.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('RecordTableConfiguration')
export class RecordTableConfigurationDTO implements RecordTableConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.RECORD_TABLE])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.RECORD_TABLE;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  viewId?: SerializedRelation | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  recordLimit?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isUIEditable?: boolean;

  @Field(() => [DashboardFilterBindingDTO], { nullable: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DashboardFilterBindingDTO)
  @IsOptional()
  dashboardFilterBindings?: DashboardFilterBindingDTO[] | null;
}
