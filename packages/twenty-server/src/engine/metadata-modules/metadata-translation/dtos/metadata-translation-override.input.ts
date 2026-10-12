import { Field, InputType } from '@nestjs/graphql';

import { APP_LOCALES } from 'twenty-shared/translations';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// a null or empty value removes the stored translation
@InputType()
export class MetadataTranslationOverrideInput {
  @IsIn(Object.keys(APP_LOCALES))
  @Field(() => String)
  locale: keyof typeof APP_LOCALES;

  @IsString()
  @IsNotEmpty()
  @Field()
  property: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  value?: string | null;
}
