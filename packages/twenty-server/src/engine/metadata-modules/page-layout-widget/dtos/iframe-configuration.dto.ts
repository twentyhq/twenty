import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { type IframeConfiguration } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('IframeConfiguration')
export class IframeConfigurationDTO implements IframeConfiguration {
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.IFRAME])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.IFRAME;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsUrl()
  url?: string;
}
