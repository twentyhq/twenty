import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/utils/read-authored-override-property.util';

// Entries are typed on the entity column; here they stay opaque so entry
// types that allow null or carry translations still fit.
export type OverridableFlatEntity = {
  applicationUniversalIdentifier: string;
  overrides?: unknown;
};

export const resolveEffectiveFlatEntityProperty = <
  TEntity extends OverridableFlatEntity,
  K extends string & keyof TEntity,
>(
  flatEntity: TEntity,
  property: K,
  authorContext?: Pick<
    OverrideAuthorReadContext,
    'workspaceCustomApplicationUniversalIdentifier'
  >,
): TEntity[K] => {
  const overrideValue = readAuthoredOverrideProperty({
    overrides: flatEntity.overrides,
    path: [property],
    authorContext: {
      ...authorContext,
      ownerApplicationUniversalIdentifier:
        flatEntity.applicationUniversalIdentifier,
    },
  });

  return overrideValue !== undefined
    ? (overrideValue as TEntity[K])
    : flatEntity[property];
};
