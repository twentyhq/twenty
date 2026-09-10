import { type AllMetadataName } from 'twenty-shared/metadata';

import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

type OverridableUniversalFlatEntity = {
  applicationUniversalIdentifier: string;
  universalOverrides?: unknown;
};

// The property is a universal name, such as viewFieldGroupUniversalIdentifier,
// which the registry only knows through universalProperty; it is not narrowed
// to the overridable set the way the flat resolver's is.
export const resolveEffectiveUniversalFlatEntityProperty = <
  TUniversalFlatEntity extends OverridableUniversalFlatEntity,
  TProperty extends string & keyof TUniversalFlatEntity,
>({
  metadataName,
  universalFlatEntity,
  property,
  authorContext,
}: {
  metadataName: AllMetadataName;
  universalFlatEntity: TUniversalFlatEntity;
  property: TProperty;
  authorContext?: Pick<
    OverrideAuthorReadContext,
    'workspaceCustomApplicationUniversalIdentifier'
  >;
}): TUniversalFlatEntity[TProperty] => {
  const overrideValue = readAuthoredOverrideProperty({
    metadataName,
    overrides: universalFlatEntity.universalOverrides,
    path: [property],
    authorContext: {
      ...authorContext,
      ownerApplicationUniversalIdentifier:
        universalFlatEntity.applicationUniversalIdentifier,
    },
  });

  return overrideValue !== undefined
    ? (overrideValue as TUniversalFlatEntity[TProperty])
    : universalFlatEntity[property];
};
