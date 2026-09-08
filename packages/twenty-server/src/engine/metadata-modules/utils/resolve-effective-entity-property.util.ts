import { isNonEmptyString } from '@sniptt/guards';
import { type TranslatableMetadataName } from 'twenty-shared/i18n';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import {
  type MetadataEntityOverridablePropertyName,
  type MetadataEntityTranslatablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/utils/authored-overrides.type';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { listAuthoredOverrideEntries } from 'src/engine/metadata-modules/utils/list-authored-override-entries.util';
import { type MetadataPresentationOverrides } from 'src/engine/metadata-modules/utils/metadata-presentation-overrides.type';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/utils/read-authored-override-property.util';

const readEntryProperty = (entry: unknown, property: string): unknown =>
  isDefined(entry) && typeof entry === 'object'
    ? (entry as Record<string, unknown>)[property]
    : undefined;

export const readOverrideTranslation = ({
  overrides,
  locale,
  property,
  authorContext,
}: {
  overrides: unknown;
  locale: string;
  property: string;
  authorContext: OverrideAuthorReadContext;
}): string | undefined =>
  listAuthoredOverrideEntries({ overrides, authorContext })
    .map((entry) =>
      readEntryProperty(
        readEntryProperty(readEntryProperty(entry, 'translations'), locale),
        property,
      ),
    )
    .find(
      (translation): translation is string => typeof translation === 'string',
    );

const resolveEffectiveProperty = ({
  metadataName,
  baseValue,
  overrides,
  property,
  i18nContext,
}: {
  metadataName: AllMetadataName;
  baseValue: string | null | undefined;
  overrides: unknown;
  property: string;
  i18nContext: EffectiveEntityI18nContext;
}): string => {
  const translatableProperties: readonly string[] =
    ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] ?? [];

  const isTranslatable = translatableProperties.includes(property);

  const overrideValue = readAuthoredOverrideProperty({
    overrides,
    property,
    authorContext: i18nContext,
  });

  const { locale, i18nInstance, isStandardApp, applicationCatalog } =
    i18nContext;
  const safeLocale = locale ?? SOURCE_LOCALE;
  const safeBaseValue = baseValue ?? '';

  // Workspace-authored translations apply to every entity, custom ones
  // included: a custom object created in French can still carry an English
  // translation even though it has no catalog to fall back to.
  if (isTranslatable) {
    const translation = readOverrideTranslation({
      overrides,
      locale: safeLocale,
      property,
      authorContext: i18nContext,
    });

    if (isDefined(translation)) {
      return translation;
    }
  }

  // Custom (non-standard) entities without a catalog have no standard label
  // to resolve or translate, and property renames live in base columns.
  if (!isStandardApp && !isDefined(applicationCatalog)) {
    return safeBaseValue;
  }

  if (!isTranslatable && isDefined(overrideValue)) {
    return overrideValue as string;
  }

  if (isNonEmptyString(overrideValue)) {
    return overrideValue;
  }

  return translateStandardLabel({
    sourceValue: safeBaseValue,
    context: `${metadataName}.${property}`,
    isStandardApp,
    applicationCatalog,
    i18nInstance,
  });
};

export const resolveEffectiveEntityProperty = <T extends AllMetadataName>({
  metadataName,
  baseValue,
  overrides,
  property,
  i18nContext,
}: {
  metadataName: T;
  baseValue: string | null | undefined;
  overrides:
    | AuthoredOverrides<MetadataPresentationOverrides<T>>
    | null
    | undefined;
  // A property is resolvable if it is overridable, translatable, or both:
  // navigationMenuItem.name is translated but never renamed, so keying this on
  // "overridable" alone would lock it out of the shared resolution path.
  property: (
    | MetadataEntityOverridablePropertyName<T>
    | MetadataEntityTranslatablePropertyName<T>
  ) &
    string;
  i18nContext: EffectiveEntityI18nContext;
}): string =>
  resolveEffectiveProperty({
    metadataName,
    baseValue,
    overrides,
    property,
    i18nContext,
  });

// Subscription events carry their metadata name as data, so a caller cannot
// satisfy the generic above: TypeScript collapses the property union across
// every possible name. The registry is what guarantees the pairing.
export const resolveEffectiveEntityPropertyByName = ({
  metadataName,
  baseValue,
  overrides,
  property,
  i18nContext,
}: {
  metadataName: TranslatableMetadataName;
  baseValue: unknown;
  overrides: unknown;
  property: string;
  i18nContext: EffectiveEntityI18nContext;
}): string =>
  resolveEffectiveProperty({
    metadataName,
    baseValue: typeof baseValue === 'string' ? baseValue : undefined,
    overrides,
    property,
    i18nContext,
  });
