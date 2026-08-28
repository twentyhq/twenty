import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import { type FormFieldConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('FormFieldConfiguration')
export class FormFieldConfigurationDTO implements FormFieldConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.FORM_FIELD])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.FORM_FIELD;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fieldMetadataId: string;
}
