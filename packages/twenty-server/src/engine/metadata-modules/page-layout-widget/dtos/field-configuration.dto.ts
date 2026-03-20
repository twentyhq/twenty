import { Field, ObjectType } from '@nestjs/graphql';

import { IsEnum, IsIn, IsNotEmpty, IsString } from 'class-validator';

import { type FieldConfiguration } from 'twenty-shared/types';

import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
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
}
