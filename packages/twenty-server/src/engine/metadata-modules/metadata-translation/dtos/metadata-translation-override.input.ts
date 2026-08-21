import { Field, InputType } from '@nestjs/graphql';

import { APP_LOCALES } from 'twenty-shared/translations';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// One translated value for one property in one locale. A null or empty value
// removes the stored translation, reverting that locale to shipped-or-source.
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
