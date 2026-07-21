import { type AllMetadataName } from 'twenty-shared/metadata';
import { type APP_LOCALES } from 'twenty-shared/translations';

import {
  type MetadataEntityOverridablePropertyName,
  type MetadataEntityTranslatablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type OverridesTranslationEntry<T extends AllMetadataName> = {
  [P in MetadataEntityTranslatablePropertyName<T>]?: string | null;
};

export type MetadataPresentationOverrides<T extends AllMetadataName> = {
  [P in MetadataEntityOverridablePropertyName<T>]?: string | null;
} & {
  translations?: Partial<
    Record<keyof typeof APP_LOCALES, OverridesTranslationEntry<T>>
  > | null;
};
