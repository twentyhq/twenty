import { type FieldOptionLabelTranslationProperty } from 'twenty-shared/i18n';
import { type APP_LOCALES } from 'twenty-shared/translations';

export type FieldMetadataOverrides = {
  isActive?: boolean;
  label?: string | null;
  description?: string | null;
  icon?: string | null;
  translations?: Partial<
    Record<
      keyof typeof APP_LOCALES,
      {
        label?: string | null;
        description?: string | null;
      } & Partial<Record<FieldOptionLabelTranslationProperty, string | null>>
    >
  > | null;
};
