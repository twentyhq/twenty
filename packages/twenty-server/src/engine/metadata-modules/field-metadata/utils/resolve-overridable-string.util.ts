import { i18n } from '@lingui/core';
import { isDefined } from 'class-validator';
import { APP_LOCALES } from 'twenty-shared/translations';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const resolveOverridableString = (
  fieldMetadata: Pick<
    FieldMetadataDTO,
    'label' | 'description' | 'icon' | 'isCustom' | 'standardOverrides'
  >,
  labelKey: 'label' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
): string => {
  if (fieldMetadata.isCustom) {
    return fieldMetadata[labelKey] ?? '';
  }

  const translationValue =
    // @ts-expect-error legacy noImplicitAny
    fieldMetadata.standardOverrides?.translations?.[locale]?.[labelKey];

  if (isDefined(translationValue)) {
    return translationValue;
  }

  const messageId = generateMessageId(fieldMetadata[labelKey] ?? '');
  const translatedMessage = i18n._(messageId);

  if (translatedMessage === messageId) {
    return fieldMetadata[labelKey] ?? '';
  }

  return translatedMessage;
};
