import { isNonEmptyString } from '@sniptt/guards';
import { TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { resolveEffectiveEntityPropertyByName } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { isTranslatableMetadataName } from 'src/engine/subscriptions/metadata-event/utils/is-translatable-metadata-name.util';

const TRANSLATIONS_OVERRIDE_KEY = 'translations';

export const resolveMetadataEventRecord = ({
  metadataName,
  record,
  i18nContext,
}: {
  metadataName: string;
  record: Record<string, unknown>;
  i18nContext: EffectiveEntityI18nContext;
}): Record<string, unknown> => {
  const { overrides, ...baseRecord } = record;

  const overrideRecord = (overrides ?? {}) as Record<string, unknown>;
  const translatable = isTranslatableMetadataName(metadataName);
  const translatableProperties = new Set<string>(
    translatable ? TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] : [],
  );

  const resolved: Record<string, unknown> = { ...baseRecord };

  // Overridable-but-not-translatable properties are not all strings --
  // pageLayoutTab.position is a number, commandMenuItem.isPinned a boolean --
  // so they pass through as they are rather than through the resolver.
  for (const [property, overrideValue] of Object.entries(overrideRecord)) {
    if (
      property === TRANSLATIONS_OVERRIDE_KEY ||
      translatableProperties.has(property)
    ) {
      continue;
    }

    resolved[property] = overrideValue;
  }

  if (!translatable) {
    return resolved;
  }

  for (const property of translatableProperties) {
    const baseValue = baseRecord[property];

    // An override with no base value still has to win, so absence of a base is
    // not on its own a reason to skip.
    if (
      !isNonEmptyString(baseValue) &&
      !isDefined(overrideRecord[property]) &&
      !isDefined(overrideRecord[TRANSLATIONS_OVERRIDE_KEY])
    ) {
      continue;
    }

    resolved[property] = resolveEffectiveEntityPropertyByName({
      metadataName,
      baseValue,
      overrides,
      property,
      i18nContext,
    });
  }

  return resolved;
};
