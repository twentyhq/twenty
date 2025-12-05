import { Field, ObjectType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

import { RichTextV2BodyDTO } from 'src/engine/metadata-modules/page-layout/dtos/rich-text-v2-body.dto';

@ObjectType('StandaloneRichTextConfiguration')
export class StandaloneRichTextConfigurationDTO {
  @Field(() => RichTextV2BodyDTO)
  @ValidateNested()
  @Type(() => RichTextV2BodyDTO)
  @IsNotEmpty()
  body: RichTextV2BodyDTO;
}
