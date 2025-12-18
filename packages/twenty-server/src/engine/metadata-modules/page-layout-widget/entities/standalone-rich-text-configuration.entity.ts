import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

import { RichTextV2BodyEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/rich-text-v2-body.entity';

@ObjectType('StandaloneRichTextConfiguration')
export class StandaloneRichTextConfigurationEntity {
  @Field(() => RichTextV2BodyEntity)
  @ValidateNested()
  @Type(() => RichTextV2BodyEntity)
  @IsNotEmpty()
  body: RichTextV2BodyEntity;
}
