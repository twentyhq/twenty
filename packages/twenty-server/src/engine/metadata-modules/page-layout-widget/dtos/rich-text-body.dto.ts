import { Field, ObjectType } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';
import { type RichTextMetadata } from 'twenty-shared/types';

@ObjectType('RichTextBody')
export class RichTextBodyDTO implements RichTextMetadata {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  blocknote?: string | null;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  markdown: string | null;
}
