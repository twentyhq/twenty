import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntityOverridablePropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

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
  metadataName,
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
    metadataName,
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
