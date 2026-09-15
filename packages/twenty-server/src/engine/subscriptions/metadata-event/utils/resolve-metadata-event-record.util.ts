import { isNonEmptyString } from '@sniptt/guards';
import { TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'twenty-shared/i18n';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-properties-by-metadata-name.constant';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveEffectiveEntityPropertyByName } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';
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

  const translatable = isTranslatableMetadataName(metadataName);
  const translatableProperties = new Set<string>(
    translatable ? TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] : [],
  );
  const overridableProperties: readonly string[] =
    ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[
      metadataName as AllMetadataName
    ] ?? [];

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

    const overrideValue = readAuthoredOverrideProperty({
      metadataName: metadataName as AllMetadataName,
      overrides,
      path: [property],
      authorContext: i18nContext,
    });

    if (overrideValue !== undefined) {
      resolved[property] = overrideValue;
    }
  }

  if (!translatable) {
    return resolved;
  }

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
