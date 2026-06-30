import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';

export const resolveFieldMetadataStandardOverride = (
  fieldMetadata: Pick<
    FieldMetadataDTO,
    'label' | 'description' | 'icon' | 'standardOverrides'
  >,
  labelKey: 'label' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
  i18nInstance: I18n,
  isStandardApp: boolean,
  applicationCatalog?: Record<string, string>,
  workspaceCatalog?: Record<string, string>,
): string => {
  // The workspace translation bench stores value-keyed overrides (keyed by the
  // source string's message id) and wins over shipped translations for any label.
  if (labelKey !== 'icon' && isDefined(workspaceCatalog)) {
    const sourceValue = fieldMetadata[labelKey];

    if (isNonEmptyString(sourceValue)) {
      const overrideValue = workspaceCatalog[generateMessageId(sourceValue)];

      if (isDefined(overrideValue)) {
        return overrideValue;
      }
    }
  }

  if (!isStandardApp && !isDefined(applicationCatalog)) {
    return fieldMetadata[labelKey] ?? '';
  }

  if (labelKey === 'icon' && isDefined(fieldMetadata.standardOverrides?.icon)) {
    return fieldMetadata.standardOverrides.icon;
  }

  if (isNonEmptyString(fieldMetadata.standardOverrides?.[labelKey])) {
    return fieldMetadata.standardOverrides[labelKey] ?? '';
  }

  return translateStandardLabel({
    sourceValue: fieldMetadata[labelKey] ?? '',
    isStandardApp,
    applicationCatalog,
    i18nInstance,
  });
};
