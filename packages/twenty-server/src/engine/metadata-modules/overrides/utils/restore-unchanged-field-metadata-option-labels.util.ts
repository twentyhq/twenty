import { isNonEmptyString } from '@sniptt/guards';
import { getFieldOptionLabelTranslationProperty } from 'twenty-shared/i18n';
import { type FieldMetadataDefaultOption } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';
import { resolveEffectiveFieldMetadataOptionLabel } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';

type FieldMetadataOptionWithLabel = Pick<
  FieldMetadataDefaultOption,
  'id' | 'label'
>;

// Options are saved as a whole array holding the labels the editor was shown, so an option sent back with its
// displayed label is untouched: it keeps its canonical label instead of turning a translation into a rename
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
        path: [getFieldOptionLabelTranslationProperty(existingOption.id)],
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
