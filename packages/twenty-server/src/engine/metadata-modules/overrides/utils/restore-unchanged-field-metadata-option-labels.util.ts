import { isNonEmptyString } from '@sniptt/guards';
import {
  buildTranslatablePropertyPath,
  FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN,
} from 'twenty-shared/i18n';
import { type FieldMetadataDefaultOption } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';
import { resolveEffectiveFieldMetadataOptionLabel } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';

type FieldMetadataOptionWithLabel = Pick<
  FieldMetadataDefaultOption,
  'id' | 'label'
>;

export const restoreUnchangedFieldMetadataOptionLabels = <
  TOption extends FieldMetadataOptionWithLabel,
>({
  updatedOptions,
  existingOptions,
  overrides,
  i18nContext,
}: {
  updatedOptions: TOption[];
  existingOptions: FieldMetadataOptionWithLabel[] | null | undefined;
  overrides: unknown;
  i18nContext: EffectiveEntityI18nContext;
}): TOption[] => {
  const labelsByOptionId = new Map(
    (existingOptions ?? []).flatMap((existingOption) => {
      if (!isDefined(existingOption.id)) {
        return [];
      }

      const overrideLabel = readAuthoredOverrideProperty({
        metadataName: 'fieldMetadata',
        overrides,
        path: [
          buildTranslatablePropertyPath({
            pattern: FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN,
            itemIds: [existingOption.id],
          }),
        ],
        authorContext: i18nContext,
      });

      return [
        [
          existingOption.id,
          {
            displayedLabel: resolveEffectiveFieldMetadataOptionLabel({
              option: existingOption,
              overrides,
              i18nContext,
            }),
            canonicalLabel: isNonEmptyString(overrideLabel)
              ? overrideLabel
              : existingOption.label,
          },
        ] as const,
      ];
    }),
  );

  return updatedOptions.map((updatedOption) => {
    const existingLabels = isDefined(updatedOption.id)
      ? labelsByOptionId.get(updatedOption.id)
      : undefined;

    return isDefined(existingLabels) &&
      updatedOption.label === existingLabels.displayedLabel
      ? { ...updatedOption, label: existingLabels.canonicalLabel }
      : updatedOption;
  });
};
