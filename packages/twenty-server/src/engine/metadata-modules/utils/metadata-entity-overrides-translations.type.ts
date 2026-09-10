import { type TranslatableMetadataName } from 'twenty-shared/i18n';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { type MetadataEntityTranslatablePropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';

// The entity is only ever read from the mapped type template, never from its
// key constraint: TypeScript resolves a mapped type's keys eagerly when it
// instantiates it, which would make the entity depend on itself.
type MetadataEntityTranslatableProperties<T extends AllMetadataName> = {
  [P in MetadataEntityTranslatablePropertyName<T>]?: P extends keyof MetadataEntity<T>
    ? MetadataEntity<T>[P]
    : never;
};

export type MetadataEntityOverridesTranslations<T extends AllMetadataName> =
  T extends TranslatableMetadataName
    ? {
        translations?: Partial<
          Record<
            keyof typeof APP_LOCALES,
            MetadataEntityTranslatableProperties<T>
          >
        > | null;
      }
    : unknown;
