import { Field, ObjectType } from '@nestjs/graphql';

import { IsIn, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

@ObjectType('IframeConfiguration')
export class IframeConfigurationEntity implements PageLayoutWidgetConfigurationBase {
  @Field(() => String)
  @IsIn(['IFRAME'])
  @IsNotEmpty()
  configurationType: 'IFRAME';

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @IsUrl()
  url?: string;
}
