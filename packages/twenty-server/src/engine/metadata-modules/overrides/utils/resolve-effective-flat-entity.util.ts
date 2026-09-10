import { type AllMetadataName } from 'twenty-shared/metadata';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-properties-by-metadata-name.constant';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

// Every overridable property of the kind resolved across author entries, with
// its own type. Translatable properties are not translated here; that is
// resolveEffectiveTranslatedFlatEntity, at the read edge with a locale.
export const resolveEffectiveFlatEntity = <
  TFlatEntity extends OverridableFlatEntity & Record<string, unknown>,
>({
  metadataName,
  flatEntity,
  authorContext,
}: {
  metadataName: AllMetadataName;
  flatEntity: TFlatEntity;
  authorContext?: Pick<
    OverrideAuthorReadContext,
    'workspaceCustomApplicationUniversalIdentifier'
  >;
}): TFlatEntity => {
  const overridableProperties: readonly string[] =
    ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[metadataName];

  return overridableProperties.reduce<TFlatEntity>(
    (effectiveFlatEntity, property) => ({
      ...effectiveFlatEntity,
      [property]: resolveEffectiveFlatEntityProperty(
        flatEntity,
        property,
        authorContext,
      ),
    }),
    flatEntity,
  );
};
