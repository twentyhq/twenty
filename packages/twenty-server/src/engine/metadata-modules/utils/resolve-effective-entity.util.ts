import { type I18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';

type OverridesTranslationEntry = {
  label?: string | null;
  labelSingular?: string | null;
  labelPlural?: string | null;
  description?: string | null;
};

// Superset of the object/field override blobs (ObjectMetadataOverrides,
// FieldMetadataOverrides): every presentation key optional so both concrete
// types are assignable without an index signature.
export type MetadataPresentationOverrides = {
  label?: string | null;
  labelSingular?: string | null;
  labelPlural?: string | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  translations?: Partial<
    Record<keyof typeof APP_LOCALES, OverridesTranslationEntry>
  > | null;
};

export type EffectiveEntityI18nContext = {
  locale: keyof typeof APP_LOCALES | undefined;
  i18nInstance: I18n;
  isStandardApp: boolean;
  applicationCatalog?: Record<string, string>;
};

// Single i18n-aware override resolver. It is a strict superset of the former
// object/field standard-override resolvers. Precedence, in order:
// - a non-standard app with no application catalog returns the base value as-is
//   (such entities are custom, with no standard label to translate; overrides
//   are only ever written for standard-app entities), so nothing else applies;
// - otherwise a non-translatable property (icon/color) takes the direct override;
// - a translatable property takes translations[locale], then the flat override;
// - finally the Lingui/catalog fallback (translateStandardLabel).
// Without an i18nContext it reduces to the flat override-or-base spread used by
// the registry-driven entities.
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
  i18nContext?: EffectiveEntityI18nContext;
}): string => {
  const overrideValue = (
    overrides as Record<string, unknown> | null | undefined
  )?.[property];

  if (!isDefined(i18nContext)) {
    return (overrideValue !== undefined ? overrideValue : baseValue) as string;
  }

  const { locale, i18nInstance, isStandardApp, applicationCatalog } =
    i18nContext;
  const safeLocale = locale ?? SOURCE_LOCALE;
  const safeBaseValue = baseValue ?? '';

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

type FlatEntityWithOverrides = {
  [key: string]: unknown;
  overrides: Record<string, unknown> | null;
};

// Whole-entity flat resolution: applies the anonymous override blob on top of
// the base entity. Entry point for entities without translatable properties
// (views, layouts, commands) — equivalent to a shallow spread.
export const resolveEffectiveEntity = <T extends FlatEntityWithOverrides>(
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
