import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, ValidateNested } from 'class-validator';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { RichTextV2BodyValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/schemas/rich-text-v2-body.validation-schema';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

@ObjectType('StandaloneRichTextConfiguration')
export class StandaloneRichTextConfigurationValidationSchema
  implements PageLayoutWidgetConfigurationBase
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.STANDALONE_RICH_TEXT])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT;

  @Field(() => RichTextV2BodyValidationSchema)
  @ValidateNested()
  @Type(() => RichTextV2BodyValidationSchema)
  @IsNotEmpty()
  body: RichTextV2BodyValidationSchema;
}
