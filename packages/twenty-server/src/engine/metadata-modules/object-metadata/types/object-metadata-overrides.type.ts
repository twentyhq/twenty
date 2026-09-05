import { type APP_LOCALES } from 'twenty-shared/translations';
import { type MetadataReadability } from 'twenty-shared/types';

export type ObjectMetadataOverrides = {
  labelSingular?: string | null;
  labelPlural?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  imageIdentifierFieldMetadataId?: string | null;
  readability?: MetadataReadability | null;
  ownerFieldMetadataId?: string | null;
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
