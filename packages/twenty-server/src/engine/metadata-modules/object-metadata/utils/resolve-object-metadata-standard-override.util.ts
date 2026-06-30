import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const resolveObjectMetadataStandardOverride = (
  objectMetadata: Pick<
    ObjectMetadataDTO,
    | 'color'
    | 'labelPlural'
    | 'labelSingular'
    | 'description'
    | 'icon'
    | 'standardOverrides'
  >,
  labelKey: 'color' | 'labelPlural' | 'labelSingular' | 'description' | 'icon',
  locale: keyof typeof APP_LOCALES | undefined,
  i18nInstance: I18n,
  isStandardApp: boolean,
  applicationCatalog?: Record<string, string>,
  workspaceCatalog?: Record<string, string>,
): string => {
  const isLabelKey = labelKey !== 'icon' && labelKey !== 'color';

  // The workspace translation bench stores value-keyed overrides (keyed by the
  // source string's message id) and wins over shipped translations for any label.
  if (isLabelKey && isDefined(workspaceCatalog)) {
    const sourceValue = objectMetadata[labelKey];

    if (isNonEmptyString(sourceValue)) {
      const overrideValue = workspaceCatalog[generateMessageId(sourceValue)];

      if (isDefined(overrideValue)) {
        return overrideValue;
      }
    }
  }

  if (!isStandardApp && !isDefined(applicationCatalog)) {
    return objectMetadata[labelKey] ?? '';
  }

  if (
    (labelKey === 'icon' || labelKey === 'color') &&
    isDefined(objectMetadata.standardOverrides?.[labelKey])
  ) {
    return objectMetadata.standardOverrides[labelKey];
  }

  if (isNonEmptyString(objectMetadata.standardOverrides?.[labelKey])) {
    return objectMetadata.standardOverrides[labelKey] ?? '';
  }

  return translateStandardLabel({
    sourceValue: objectMetadata[labelKey] ?? '',
    isStandardApp,
    applicationCatalog,
    i18nInstance,
  });
};
