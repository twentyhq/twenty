import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { resolveWorkspaceTranslationOverride } from 'src/engine/core-modules/i18n/utils/resolve-workspace-translation-override.util';
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

  if (isLabelKey) {
    const overrideValue = resolveWorkspaceTranslationOverride({
      sourceValue: objectMetadata[labelKey],
      workspaceCatalog,
    });

    if (isDefined(overrideValue)) {
      return overrideValue;
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
