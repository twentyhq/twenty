import { type APP_LOCALES } from 'twenty-shared/translations';

type OverridesTranslationEntry = {
  label?: string | null;
  labelSingular?: string | null;
  labelPlural?: string | null;
  description?: string | null;
};

export type MetadataPresentationOverrides = {
  label?: string | null;
  labelSingular?: string | null;
  labelPlural?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  translations?: Partial<
    Record<keyof typeof APP_LOCALES, OverridesTranslationEntry>
  > | null;
};
