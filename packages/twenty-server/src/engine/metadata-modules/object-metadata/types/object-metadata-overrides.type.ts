import { type APP_LOCALES } from 'twenty-shared/translations';

export type ObjectMetadataOverrides = {
  labelSingular?: string | null;
  labelPlural?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  imageIdentifierFieldMetadataId?: string | null;
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
