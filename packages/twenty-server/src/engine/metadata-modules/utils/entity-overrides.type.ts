import {
  type TranslatableMetadataName,
  type TranslatablePropertyName,
} from 'twenty-shared/i18n';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { type SerializedRelation } from 'twenty-shared/types';

import { type MetadataEntityOverridablePropertyName } from 'src/engine/metadata-modules/flat-entity/constant/overridable-properties-by-metadata-name.constant';

// The entity is only read from the mapped type template: this types the
// entity's own overrides column.
//
// Mapping over the keys of an `as const` record copies its readonly modifier.
//
// A foreign key stored in the overrides blob has no FK constraint, which is what
// SerializedRelation encodes.
type OverridableProperties<TEntity, TMetadataName extends AllMetadataName> = {
  -readonly [P in MetadataEntityOverridablePropertyName<TMetadataName>]?: P extends keyof TEntity
    ? P extends `${string}Id`
      ? SerializedRelation | Extract<TEntity[P], null>
      : TEntity[P]
    : never;
};

type TranslatableProperties<
  TEntity,
  TMetadataName extends TranslatableMetadataName,
> = {
  [P in TranslatablePropertyName<TMetadataName>]?: P extends keyof TEntity
    ? TEntity[P]
    : never;
};

export type EntityOverrides<
  TEntity,
  TMetadataName extends AllMetadataName,
> = OverridableProperties<TEntity, TMetadataName> &
  (TMetadataName extends TranslatableMetadataName
    ? {
        translations?: Partial<
          Record<
            keyof typeof APP_LOCALES,
            TranslatableProperties<TEntity, TMetadataName>
          >
        > | null;
      }
    : unknown);
