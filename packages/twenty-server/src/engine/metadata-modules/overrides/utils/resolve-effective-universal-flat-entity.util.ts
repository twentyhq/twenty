import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_OVERRIDABLE_UNIVERSAL_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-universal-properties-by-metadata-name.constant';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import {
  type OverridableUniversalFlatEntity,
  resolveEffectiveUniversalFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';

export const resolveEffectiveUniversalFlatEntity = <
  TUniversalFlatEntity extends OverridableUniversalFlatEntity &
    Record<string, unknown>,
>({
  metadataName,
  universalFlatEntity,
  authorContext,
}: {
  metadataName: AllMetadataName;
  universalFlatEntity: TUniversalFlatEntity;
  authorContext?: Pick<
    OverrideAuthorReadContext,
    'workspaceCustomApplicationUniversalIdentifier'
  >;
}): TUniversalFlatEntity =>
  ALL_OVERRIDABLE_UNIVERSAL_PROPERTIES_BY_METADATA_NAME[
    metadataName
  ].reduce<TUniversalFlatEntity>(
    (effectiveUniversalFlatEntity, property) => ({
      ...effectiveUniversalFlatEntity,
      [property]: resolveEffectiveUniversalFlatEntityProperty({
        metadataName,
        universalFlatEntity,
        property: property as never,
        authorContext,
      }),
    }),
    universalFlatEntity,
  );
