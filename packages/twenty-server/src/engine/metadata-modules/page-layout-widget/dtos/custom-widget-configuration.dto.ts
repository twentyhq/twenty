import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty } from 'class-validator';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

@ObjectType('CustomWidgetConfiguration')
export class CustomWidgetConfigurationDTO
  implements PageLayoutWidgetConfigurationBase
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.CUSTOM_WIDGET])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.CUSTOM_WIDGET;
}
