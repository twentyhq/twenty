import { isNonEmptyString } from '@sniptt/guards';
import { TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'twenty-shared/i18n';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-overridable-properties-by-metadata-name.constant';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { resolveEffectiveEntityPropertyByName } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-flat-entity-property.util';
import { isTranslatableMetadataName } from 'src/engine/subscriptions/metadata-event/utils/is-translatable-metadata-name.util';

const TRANSLATIONS_OVERRIDE_KEY = 'translations';

type OverridableEventRecord = Record<string, unknown> & {
  overrides: Record<string, unknown> | null;
};

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
  const overridableProperties: readonly string[] =
    ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[
      metadataName as AllMetadataName
    ] ?? [];

  const entity: OverridableEventRecord = {
    ...baseRecord,
    overrides: overrideRecord,
  };

  const resolved: Record<string, unknown> = { ...baseRecord };

  // Overridable-but-not-translatable properties are not all strings --
  // pageLayoutTab.position is a number, commandMenuItem.isPinned a boolean --
  // so they pass through as they are rather than through the resolver.
  for (const property of overridableProperties) {
    if (
      property === TRANSLATIONS_OVERRIDE_KEY ||
      translatableProperties.has(property)
    ) {
      continue;
    }

    const effectiveValue = resolveEffectiveFlatEntityProperty(entity, property);

    if (effectiveValue !== undefined) {
      resolved[property] = effectiveValue;
    }
  }

  if (!translatable) {
    return resolved;
  }

  // An override with no base value still has to win, so the resolver runs
  // regardless of the base; only an empty result is dropped, which keeps an
  // absent or null base from being delivered as a translated empty string.
  for (const property of translatableProperties) {
    const effectiveValue = resolveEffectiveEntityPropertyByName({
      metadataName,
      baseValue: baseRecord[property],
      overrides,
      property,
      i18nContext,
    });

    if (isNonEmptyString(effectiveValue)) {
      resolved[property] = effectiveValue;
    }
  }

  return resolved;
};
