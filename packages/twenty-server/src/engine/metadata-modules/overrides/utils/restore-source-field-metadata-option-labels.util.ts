import {
  type FieldMetadataDefaultOption,
  type FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveEffectiveFieldMetadataOptions } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-field-metadata-options.util';

type FieldMetadataOptionWithLabel = Pick<
  FieldMetadataDefaultOption,
  'id' | 'label'
>;

export const restoreSourceFieldMetadataOptionLabels = <
  TOption extends FieldMetadataOptionWithLabel,
>({
  fieldMetadataType,
  updatedOptions,
  existingOptions,
  overrides,
  i18nContext,
}: {
  fieldMetadataType: FieldMetadataType;
  updatedOptions: TOption[];
  existingOptions: FieldMetadataOptionWithLabel[] | null | undefined;
  overrides: unknown;
  i18nContext: EffectiveEntityI18nContext;
}): TOption[] => {
  const effectiveExistingOptions =
    resolveEffectiveFieldMetadataOptions({
      fieldMetadataType,
      options: existingOptions,
      overrides,
      i18nContext,
    }) ?? [];

  const labelsByOptionId = new Map(
    (existingOptions ?? []).flatMap((existingOption, index) =>
      isDefined(existingOption.id)
        ? [
            [
              existingOption.id,
              {
                sourceLabel: existingOption.label,
                effectiveLabel: effectiveExistingOptions[index]?.label,
              },
            ] as const,
          ]
        : [],
    ),
  );

  return updatedOptions.map((updatedOption) => {
    const existingLabels = isDefined(updatedOption.id)
      ? labelsByOptionId.get(updatedOption.id)
      : undefined;

    return isDefined(existingLabels) &&
      existingLabels.effectiveLabel === updatedOption.label
      ? { ...updatedOption, label: existingLabels.sourceLabel }
      : updatedOption;
  });
};
