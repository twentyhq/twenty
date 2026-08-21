import { type TranslatableMetadataName } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { resolveEffectiveEntityPropertyByName } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

export const resolveTranslatableProperties = ({
  metadataName,
  entity,
  i18nContext,
}: {
  metadataName: TranslatableMetadataName;
  // The registry decides which properties to read, so the entity is indexed by
  // name: callers range from TypeORM classes to plain DTOs, some without an
  // overrides column at all.
  entity: Record<string, unknown>;
  i18nContext: EffectiveEntityI18nContext;
}): Record<string, string> =>
  Object.fromEntries(
    (ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] ?? [])
      .map((property) => {
        const baseValue = entity[property];

        return isDefined(baseValue)
          ? [
              property,
              resolveEffectiveEntityPropertyByName({
                metadataName,
                baseValue,
                overrides: entity.overrides,
                property,
                i18nContext,
              }),
            ]
          : undefined;
      })
      .filter(isDefined),
  );
