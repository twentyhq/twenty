import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/utils/read-authored-override-property.util';

type OverridableUniversalFlatEntity = {
  applicationUniversalIdentifier: string;
  universalOverrides?: unknown;
};

export const resolveEffectiveUniversalFlatEntityProperty = <
  TEntity extends OverridableUniversalFlatEntity,
  K extends string & keyof TEntity,
>(
  universalFlatEntity: TEntity,
  property: K,
  authorContext?: Pick<
    OverrideAuthorReadContext,
    'workspaceCustomApplicationUniversalIdentifier'
  >,
): TEntity[K] => {
  const overrideValue = readAuthoredOverrideProperty({
    overrides: universalFlatEntity.universalOverrides,
    property,
    authorContext: {
      ...authorContext,
      ownerApplicationUniversalIdentifier:
        universalFlatEntity.applicationUniversalIdentifier,
    },
  });

  return overrideValue !== undefined
    ? (overrideValue as TEntity[K])
    : universalFlatEntity[property];
};
