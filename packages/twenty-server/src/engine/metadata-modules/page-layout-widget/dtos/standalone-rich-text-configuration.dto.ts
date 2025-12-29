import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, ValidateNested } from 'class-validator';

import { RichTextV2BodyDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/rich-text-v2-body.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

@ObjectType('StandaloneRichTextConfiguration')
export class StandaloneRichTextConfigurationDTO
  implements PageLayoutWidgetConfigurationBase
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.STANDALONE_RICH_TEXT])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT;

  @Field(() => RichTextV2BodyDTO)
  @ValidateNested()
  @Type(() => RichTextV2BodyDTO)
  @IsNotEmpty()
  body: RichTextV2BodyDTO;
}
