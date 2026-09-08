import { listAuthoredOverrideEntries } from 'src/engine/metadata-modules/utils/list-authored-override-entries.util';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';
import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/utils/resolve-effective-flat-entity-property.util';

type FlatEntityWithOverrides = Record<string, unknown> & OverridableFlatEntity;

export const resolveEffectiveFlatEntity = <T extends FlatEntityWithOverrides>(
  flatEntity: T,
  authorContext?: Pick<
    OverrideAuthorReadContext,
    'workspaceCustomApplicationUniversalIdentifier'
  >,
): T => {
  const overriddenProperties = new Set(
    listAuthoredOverrideEntries<Record<string, unknown>>({
      overrides: flatEntity.overrides,
      authorContext: {
        ...authorContext,
        ownerApplicationUniversalIdentifier:
          flatEntity.applicationUniversalIdentifier,
      },
    }).flatMap(Object.keys),
  );

  return [...overriddenProperties].reduce<T>(
    (effectiveEntity, property) => ({
      ...effectiveEntity,
      [property]: resolveEffectiveFlatEntityProperty(
        flatEntity as FlatEntityWithOverrides,
        property,
        authorContext,
      ),
    }),
    flatEntity,
  );
};
