import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { type FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';
import { CHANNEL_VISIBILITY_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-visibility-object-universal-identifiers.constant';

export const findChannelVisibilityRestrictedValues = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  featureFlagsMap,
}: {
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'universalIdentifier' | 'fieldIds'
  >;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
}): Record<string, string> => {
  if (
    !isChannelVisibilityRlsEnabled(featureFlagsMap) ||
    !CHANNEL_VISIBILITY_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
      flatObjectMetadata.universalIdentifier,
    )
  ) {
    return {};
  }

  return Object.fromEntries(
    flatObjectMetadata.fieldIds
      .filter(
        (fieldMetadataId) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          })?.type === FieldMetadataType.TEXT,
      )
      .map((fieldMetadataId) => [
        fieldMetadataId,
        FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ]),
  );
};
