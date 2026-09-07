import { Field, InputType } from '@nestjs/graphql';

import { APP_LOCALES } from 'twenty-shared/translations';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// Scopes to one entity: all locales for the translations panel, or a single
// locale when the caller only needs the viewer's resolution.
@InputType()
export class MetadataTranslationsInput {
  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId?: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  fieldMetadataId?: string;

  @IsIn(Object.keys(APP_LOCALES))
  @IsOptional()
  @Field(() => String, { nullable: true })
  locale?: keyof typeof APP_LOCALES;
}
