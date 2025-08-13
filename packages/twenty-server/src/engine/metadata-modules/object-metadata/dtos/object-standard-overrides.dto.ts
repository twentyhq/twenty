import { Field, ObjectType } from '@nestjs/graphql';

import { IsJSON, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { FlatObjectMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-object-metadata/utils/compare-two-flat-object-metadata.util';
import { type APP_LOCALES } from 'twenty-shared/translations';

export const objectMetadataStandardOverridesProperties = [
  'labelSingular',
  'labelPlural',
  'description',
  'icon',
] as const satisfies FlatObjectMetadataPropertiesToCompare[];

export type ObjectMetadataStandardOverridesProperties =
  (typeof objectMetadataStandardOverridesProperties)[number];
@ObjectType('ObjectStandardOverrides')
export class ObjectStandardOverridesDTO {
  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  labelSingular?: string | null;

  @IsString()
  @IsOptional()
  @Field(() => String, { nullable: true })
  labelPlural?: string | null;

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
        labelSingular?: string | null;
        labelPlural?: string | null;
        description?: string | null;
      }
    >
  > | null;
}
