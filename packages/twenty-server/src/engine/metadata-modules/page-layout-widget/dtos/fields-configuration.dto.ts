import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

@ObjectType('FieldsConfiguration')
export class FieldsConfigurationDTO
  implements PageLayoutWidgetConfigurationBase
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.FIELDS])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.FIELDS;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  viewId: string | null;
}
