import { Field, InputType } from '@nestjs/graphql';

import { APP_LOCALES } from 'twenty-shared/translations';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// Two access shapes, one query: an entity id scopes to that entity across all
// locales (the per-entity translations panel), a locale alone scopes to every
// translatable entity in that locale (the workspace translations page).
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
