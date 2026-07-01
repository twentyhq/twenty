import { type APP_LOCALES } from 'twenty-shared/translations';

// Anonymous single-slot override blob for field metadata: flat presentation
// overrides plus an optional per-locale translations sub-map for translatable
// properties.
export type FieldMetadataOverrides = {
  label?: string | null;
  description?: string | null;
  icon?: string | null;
  translations?: Partial<
    Record<
      keyof typeof APP_LOCALES,
      {
        label?: string | null;
        description?: string | null;
      }
    >
  > | null;
};
