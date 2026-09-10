import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntityOverridablePropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

// Entries are typed on the entity column; here they stay opaque so entry
// types that allow null or carry translations still fit.
export type OverridableFlatEntity = {
  applicationUniversalIdentifier: string;
  overrides?: unknown;
};

export const resolveEffectiveFlatEntityProperty = <
  TMetadataName extends AllMetadataName,
  TFlatEntity extends OverridableFlatEntity,
  TProperty extends MetadataEntityOverridablePropertyName<TMetadataName> &
    string &
    keyof TFlatEntity,
>({
  // Only pins TMetadataName so the property is checked against the kind.
  metadataName: _metadataName,
  flatEntity,
  property,
  authorContext,
}: {
  metadataName: TMetadataName;
  flatEntity: TFlatEntity;
  property: TProperty;
  authorContext?: Pick<
    OverrideAuthorReadContext,
    'workspaceCustomApplicationUniversalIdentifier'
  >;
}): TFlatEntity[TProperty] => {
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
    ? (overrideValue as TFlatEntity[TProperty])
    : flatEntity[property];
};
