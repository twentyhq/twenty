import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { type FieldsConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('NewFieldDefaultConfiguration')
export class NewFieldDefaultConfigurationDTO {
  @Field(() => Boolean)
  @IsBoolean()
  isVisible: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  viewFieldGroupId: string | null;
}

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

  @Field(() => NewFieldDefaultConfigurationDTO, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => NewFieldDefaultConfigurationDTO)
  newFieldDefaultConfiguration: NewFieldDefaultConfigurationDTO | null;
}
