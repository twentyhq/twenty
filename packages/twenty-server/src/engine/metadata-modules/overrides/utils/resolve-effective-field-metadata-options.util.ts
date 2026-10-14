import {
  type FieldMetadataDefaultOption,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataSelectKind } from 'twenty-shared/utils';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveEffectiveFieldMetadataOptionLabel } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';

export const resolveEffectiveFieldMetadataOptions = <
  TOption extends Pick<FieldMetadataDefaultOption, 'id' | 'label'>,
>({
  fieldMetadataType,
  options,
  overrides,
  i18nContext,
}: {
  fieldMetadataType: FieldMetadataType;
  options: TOption[] | null | undefined;
  overrides: unknown;
  i18nContext: EffectiveEntityI18nContext;
}): TOption[] | null | undefined => {
  if (!isFieldMetadataSelectKind(fieldMetadataType) || !isDefined(options)) {
    return options;
  }

  return options.map((option) => ({
    ...option,
    label: resolveEffectiveFieldMetadataOptionLabel({
      option,
      overrides,
      i18nContext,
    }),
  }));
};
