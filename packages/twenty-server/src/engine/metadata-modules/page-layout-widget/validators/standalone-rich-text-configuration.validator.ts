import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, ValidateNested } from 'class-validator';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';
import { RichTextV2BodyValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/rich-text-v2-body.validator';

@ObjectType('StandaloneRichTextConfiguration')
export class StandaloneRichTextConfigurationValidator
  implements PageLayoutWidgetConfigurationBase
{
  @Field(() => String)
  @IsIn(['STANDALONE_RICH_TEXT'])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT;

  @Field(() => RichTextV2BodyValidator)
  @ValidateNested()
  @Type(() => RichTextV2BodyValidator)
  @IsNotEmpty()
  body: RichTextV2BodyValidator;
}
