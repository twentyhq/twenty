import { isDefined } from 'twenty-shared/utils';

import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-flat-entity-property.util';

type FlatEntityWithOverrides = Record<string, unknown> & {
  overrides: Record<string, unknown> | null;
};

export const resolveEffectiveFlatEntity = <T extends FlatEntityWithOverrides>(
  flatEntity: T,
): T => {
  if (!isDefined(flatEntity.overrides)) {
    return flatEntity;
  }

  return Object.keys(flatEntity.overrides).reduce<T>(
    (effectiveEntity, property) => ({
      ...effectiveEntity,
      [property]: resolveEffectiveFlatEntityProperty(
        flatEntity as FlatEntityWithOverrides,
        property,
      ),
    }),
    flatEntity,
  );
};
