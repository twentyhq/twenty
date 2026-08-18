import { type AllMetadataName } from 'twenty-shared/metadata';
import { type APP_LOCALES } from 'twenty-shared/translations';

import {
  type MetadataEntityOverridablePropertyName,
  type MetadataEntityTranslatablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type OverridesTranslationEntry<T extends AllMetadataName> = {
  [P in MetadataEntityTranslatablePropertyName<T>]?: string | null;
};

// Only translatable properties are guaranteed to hold strings. The rest are
// overridable but not textual -- pageLayoutTab.position is a number,
// commandMenuItem.isPinned a boolean -- so typing every overridable property as
// `string | null` made the entity-local override types unassignable to this one
// and kept those entities out of the shared resolver.
export type MetadataPresentationOverrides<T extends AllMetadataName> = {
  [P in MetadataEntityTranslatablePropertyName<T>]?: string | null;
} & {
  [P in Exclude<
    MetadataEntityOverridablePropertyName<T>,
    MetadataEntityTranslatablePropertyName<T>
  >]?: unknown;
} & {
  translations?: Partial<
    Record<keyof typeof APP_LOCALES, OverridesTranslationEntry<T>>
  > | null;
};
