import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, ValidateNested } from 'class-validator';

import { RichTextV2BodyEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/rich-text-v2-body.entity';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

@ObjectType('StandaloneRichTextConfiguration')
export class StandaloneRichTextConfigurationEntity implements PageLayoutWidgetConfigurationBase {
  @Field(() => String)
  @IsIn(['STANDALONE_RICH_TEXT'])
  @IsNotEmpty()
  configurationType: 'STANDALONE_RICH_TEXT';
  @Field(() => RichTextV2BodyEntity)
  @ValidateNested()
  @Type(() => RichTextV2BodyEntity)
  @IsNotEmpty()
  body: RichTextV2BodyEntity;
}
