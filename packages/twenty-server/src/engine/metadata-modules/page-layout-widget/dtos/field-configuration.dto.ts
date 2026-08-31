import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { type FieldConfiguration } from 'twenty-shared/types';

import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { ViewerControlsConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/viewer-controls-configuration.dto';
import { ViewerControlsOnlyForTableDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/dtos/validators/viewer-controls-only-for-table-display-mode.validator';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('FieldConfiguration')
export class FieldConfigurationDTO implements FieldConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.FIELD])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.FIELD;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fieldMetadataId: string;

  @Field(() => FieldDisplayMode)
  @IsEnum(FieldDisplayMode)
  @IsNotEmpty()
  fieldDisplayMode: FieldDisplayMode;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  viewId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  nestedRelationFieldMetadataId?: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isUIEditable?: boolean;

  @Field(() => ViewerControlsConfigurationDTO, { nullable: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ViewerControlsConfigurationDTO)
  @ViewerControlsOnlyForTableDisplayMode()
  viewerControls?: ViewerControlsConfigurationDTO;
}
