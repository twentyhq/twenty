import { type TranslatableMetadataName } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { resolveEffectiveEntityPropertyByName } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

// The registry decides which property to read, so this is the one place a
// dynamic property name meets a concrete entity. Callers range from TypeORM
// classes to plain DTOs, some without an overrides column at all, so the read
// is dynamic rather than typed per shape.
const readProperty = (entity: object, property: string): unknown =>
  (entity as Record<string, unknown>)[property];

export const resolveTranslatableProperties = ({
  metadataName,
  entity,
  i18nContext,
}: {
  metadataName: TranslatableMetadataName;
  entity: object;
  i18nContext: EffectiveEntityI18nContext;
}): Record<string, string> =>
  Object.fromEntries(
    (ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] ?? [])
      .map((property) => {
        const baseValue = readProperty(entity, property);

        return isDefined(baseValue)
          ? [
              property,
              resolveEffectiveEntityPropertyByName({
                metadataName,
                baseValue,
                overrides: readProperty(entity, 'overrides'),
                property,
                i18nContext,
              }),
            ]
          : undefined;
      })
      .filter(isDefined),
  );
