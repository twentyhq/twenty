import { Field, ObjectType } from '@nestjs/graphql';

import { IsJSON, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/utils/compare-two-flat-field-metadata.util';

export const fieldMetadataStandardOverridesProperties = [
  'label',
  'description',
  'icon',
] as const satisfies FlatFieldMetadataPropertiesToCompare[];

export type FieldMetadataStandardOverridesProperties =
  (typeof fieldMetadataStandardOverridesProperties)[number];
@ObjectType('StandardOverrides')
export class FieldStandardOverridesDTO
  implements Partial<Record<FieldMetadataStandardOverridesProperties, unknown>>
{
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  label?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  icon?: string | null;

  @IsJSON()
  @IsOptional()
  @Field(() => GraphQLJSON, {
    nullable: true,
  })
  translations?: Partial<
    Record<
      keyof typeof APP_LOCALES,
      {
        label?: string | null;
        description?: string | null;
      }
    >
  > | null;
}
