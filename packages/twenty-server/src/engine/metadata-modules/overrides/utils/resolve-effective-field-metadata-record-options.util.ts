import {
  type FieldMetadataDefaultOption,
  type FieldMetadataType,
} from 'twenty-shared/types';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveEffectiveFieldMetadataOptions } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-field-metadata-options.util';

export const resolveEffectiveFieldMetadataRecordOptions = ({
  record,
  i18nContext,
}: {
  record: Record<string, unknown>;
  i18nContext: EffectiveEntityI18nContext;
}): { options?: FieldMetadataDefaultOption[] | null } => {
  const { type, options, overrides } = record;

  if (typeof type !== 'string' || !Array.isArray(options)) {
    return {};
  }

  return {
    options: resolveEffectiveFieldMetadataOptions({
      fieldMetadataType: type as FieldMetadataType,
      options: options as FieldMetadataDefaultOption[],
      overrides,
      i18nContext,
    }),
  };
};
