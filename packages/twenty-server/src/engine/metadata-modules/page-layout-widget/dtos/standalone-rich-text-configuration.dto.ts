import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, ValidateNested } from 'class-validator';
import { type StandaloneRichTextConfiguration } from 'twenty-shared/types';

import { RichTextBodyDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/rich-text-body.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

@ObjectType('StandaloneRichTextConfiguration')
export class StandaloneRichTextConfigurationDTO
  implements StandaloneRichTextConfiguration
{
  @Field(() => WidgetConfigurationType)
  @IsIn([WidgetConfigurationType.STANDALONE_RICH_TEXT])
  @IsNotEmpty()
  configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT;

  @Field(() => RichTextBodyDTO)
  @ValidateNested()
  @Type(() => RichTextBodyDTO)
  @IsNotEmpty()
  body: RichTextBodyDTO;
}
