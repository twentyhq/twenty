import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';

type OverridesTranslations = Partial<
  Record<keyof typeof APP_LOCALES, Record<string, string | null | undefined>>
>;

type OverridesWithTranslations = {
  [key: string]: unknown;
  translations?: OverridesTranslations | null;
};

type EntityWithOverrides = {
  [key: string]: unknown;
  overrides?: OverridesWithTranslations | null;
};

export type EffectiveEntityI18nContext = {
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: I18n;
  isStandardApp: boolean;
  applicationCatalog?: Record<string, string>;
};

// Single i18n-aware override resolver. It is a strict superset of the former
// object/field standard-override resolvers: for a translatable property it
// layers translations[locale] over the flat override over the Lingui/catalog
// fallback, and for a non-translatable property (icon/color) it takes the
// direct override before the same fallback. Without an i18nContext it reduces
// to the flat override-or-base spread used by the registry-driven entities.
export const resolveEffectiveEntityProperty = <
  TEntity extends EntityWithOverrides,
>({
  entity,
  property,
  isTranslatable,
  i18nContext,
}: {
  entity: TEntity;
  property: string & keyof TEntity;
  isTranslatable: boolean;
  i18nContext?: EffectiveEntityI18nContext;
}): string => {
  const overrides = entity.overrides;

  if (!isDefined(i18nContext)) {
    const overrideValue = overrides?.[property];

    return (
      overrideValue !== undefined ? overrideValue : entity[property]
    ) as string;
  }

  const { locale, i18nInstance, isStandardApp, applicationCatalog } =
    i18nContext;
  const safeLocale = locale ?? SOURCE_LOCALE;
  const baseValue = (entity[property] ?? '') as string;

  if (!isStandardApp && !isDefined(applicationCatalog)) {
    return baseValue;
  }

  if (!isTranslatable && isDefined(overrides?.[property])) {
    return overrides[property] as string;
  }

  if (isTranslatable && isDefined(overrides?.translations)) {
    const translationValue = overrides.translations[safeLocale]?.[property];

    if (isDefined(translationValue)) {
      return translationValue;
    }
  }

  if (isNonEmptyString(overrides?.[property])) {
    return (overrides?.[property] as string) ?? '';
  }

  return translateStandardLabel({
    sourceValue: baseValue,
    isStandardApp,
    applicationCatalog,
    i18nInstance,
  });
};

// Whole-entity flat resolution: applies the anonymous override blob on top of
// the base entity. Superset entry point for entities without translatable
// properties (views, layouts, commands) — equivalent to a shallow spread.
export const resolveEffectiveEntity = <
  T extends { overrides?: Record<string, unknown> | null },
>(
  flatEntity: T,
): T => {
  if (!isDefined(flatEntity.overrides)) {
    return flatEntity;
  }

  return {
    ...flatEntity,
    ...flatEntity.overrides,
  };
};
