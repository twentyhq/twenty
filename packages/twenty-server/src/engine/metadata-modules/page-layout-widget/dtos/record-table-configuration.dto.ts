import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  type RecordTableConfiguration,
  type SerializedRelation,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { ViewerControlsConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/viewer-controls-configuration.dto';

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

  @Field(() => ViewerControlsConfigurationDTO, { nullable: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ViewerControlsConfigurationDTO)
  viewerControls?: ViewerControlsConfigurationDTO;
}
