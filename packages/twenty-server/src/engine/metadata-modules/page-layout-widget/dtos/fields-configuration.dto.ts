import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { type FieldsConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('FieldsConfiguration')
export class FieldsConfigurationDTO implements FieldsConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.FIELDS])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.FIELDS;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  viewId: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  newFieldDefaultVisibility: boolean | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  shouldAllowUserToSeeHiddenFields?: boolean;
}
