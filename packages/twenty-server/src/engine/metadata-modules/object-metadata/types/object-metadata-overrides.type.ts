import { type APP_LOCALES } from 'twenty-shared/translations';

// Anonymous single-slot override blob for object metadata: flat presentation
// overrides plus an optional per-locale translations sub-map for translatable
// properties.
export type ObjectMetadataOverrides = {
  labelSingular?: string | null;
  labelPlural?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
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
};
