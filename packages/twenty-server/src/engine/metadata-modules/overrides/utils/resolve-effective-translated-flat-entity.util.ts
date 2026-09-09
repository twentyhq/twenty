import { type TranslatableMetadataName } from 'twenty-shared/i18n';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-properties-by-metadata-name.constant';
import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { resolveEffectiveEntityPropertyByName } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

// The read edge of a flat entity: every overridable property resolved across
// author entries, the translatable ones also run through the catalogs. Flat
// entities and caches stay untranslated; this is for what leaves the server.
export const resolveEffectiveTranslatedFlatEntity = <
  TFlatEntity extends OverridableFlatEntity & Record<string, unknown>,
>({
  metadataName,
  flatEntity,
  i18nContext,
}: {
  metadataName: AllMetadataName;
  flatEntity: TFlatEntity;
  i18nContext: EffectiveEntityI18nContext;
}): TFlatEntity => {
  const overridableProperties: readonly string[] =
    ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[metadataName];
  const translatableProperties: readonly string[] =
    ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] ?? [];

  return overridableProperties.reduce<TFlatEntity>(
    (effectiveFlatEntity, property) => ({
      ...effectiveFlatEntity,
      [property]: translatableProperties.includes(property)
        ? resolveEffectiveEntityPropertyByName({
            // A property is only listed as translatable under a translatable
            // metadata name.
            metadataName: metadataName as TranslatableMetadataName,
            baseValue: flatEntity[property],
            overrides: flatEntity.overrides,
            property,
            i18nContext,
          })
        : resolveEffectiveFlatEntityProperty(flatEntity, property, i18nContext),
    }),
    flatEntity,
  );
};
