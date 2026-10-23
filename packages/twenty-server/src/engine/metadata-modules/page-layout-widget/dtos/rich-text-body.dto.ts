import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';
import { RICH_TEXT_BLOCKNOTE_DEPRECATION_REASON } from 'twenty-shared/constants';
import { type RichTextMetadata } from 'twenty-shared/types';

@ObjectType('RichTextBody')
export class RichTextBodyDTO implements RichTextMetadata {
  @Field(() => String, {
    nullable: true,
    deprecationReason: RICH_TEXT_BLOCKNOTE_DEPRECATION_REASON,
  })
  @IsString()
  @IsOptional()
  blocknote?: string | null;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  markdown?: string | null;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  tiptap?: string | null;
}
