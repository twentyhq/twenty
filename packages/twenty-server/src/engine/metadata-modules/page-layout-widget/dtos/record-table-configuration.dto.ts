import { Field, Int, ObjectType } from '@nestjs/graphql';

import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { type RecordTableConfiguration } from 'twenty-shared/types';

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
  viewId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
