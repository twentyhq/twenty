import { type AuthoredOverrides } from 'src/engine/metadata-modules/utils/authored-overrides.type';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/utils/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/utils/read-authored-override-property.util';

export type OverridableFlatEntity<TEntity> = {
  applicationUniversalIdentifier: string;
  overrides?: AuthoredOverrides<Partial<TEntity>> | null;
};

export const resolveEffectiveFlatEntityProperty = <
  TEntity extends OverridableFlatEntity<TEntity>,
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
    property,
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
