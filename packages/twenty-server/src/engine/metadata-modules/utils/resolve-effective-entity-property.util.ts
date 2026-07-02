import { isNonEmptyString } from '@sniptt/guards';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { type MetadataPresentationOverrides } from 'src/engine/metadata-modules/utils/metadata-presentation-overrides.type';

export const resolveEffectiveEntityProperty = ({
  baseValue,
  overrides,
  property,
  isTranslatable,
  i18nContext,
}: {
  baseValue: string | null | undefined;
  overrides: MetadataPresentationOverrides | null | undefined;
  property: string;
  isTranslatable: boolean;
  i18nContext: EffectiveEntityI18nContext;
}): string => {
  const overrideValue = (
    overrides as Record<string, unknown> | null | undefined
  )?.[property];

  const { locale, i18nInstance, isStandardApp, applicationCatalog } =
    i18nContext;
  const safeLocale = locale ?? SOURCE_LOCALE;
  const safeBaseValue = baseValue ?? '';

  // Custom (non-standard) entities without a catalog have no standard label to
  // resolve or translate, and never carry overrides.
  if (!isStandardApp && !isDefined(applicationCatalog)) {
    return safeBaseValue;
  }

  if (!isTranslatable && isDefined(overrideValue)) {
    return overrideValue as string;
  }

  if (isTranslatable && isDefined(overrides?.translations)) {
    const translationValue = (
      overrides.translations[safeLocale] as
        | Record<string, string | null | undefined>
        | undefined
    )?.[property];

    if (isDefined(translationValue)) {
      return translationValue;
    }
  }

  if (isNonEmptyString(overrideValue)) {
    return overrideValue;
  }

  return translateStandardLabel({
    sourceValue: safeBaseValue,
    isStandardApp,
    applicationCatalog,
    i18nInstance,
  });
};
