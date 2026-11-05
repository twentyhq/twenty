import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { getTargetOptionColumnsByUniversalIdentifier } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/get-target-option-columns-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const buildStandardFlatFieldMetadataOptionMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  dependencyFlatEntityMaps: { flatFieldMetadataMaps },
}: {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  };
}): FlatEntityMaps<FlatFieldMetadataOption> => {
  let flatFieldMetadataOptionMaps: FlatEntityMaps<FlatFieldMetadataOption> =
    createEmptyFlatEntityMaps();

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    for (const [
      universalIdentifier,
      optionColumns,
    ] of getTargetOptionColumnsByUniversalIdentifier(flatFieldMetadata)) {
      flatFieldMetadataOptionMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: {
          id: v4(),
          workspaceId,
          universalIdentifier,
          applicationId: twentyStandardApplicationId,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION.universalIdentifier,
          fieldMetadataId: flatFieldMetadata.id,
          fieldMetadataUniversalIdentifier:
            flatFieldMetadata.universalIdentifier,
          ...optionColumns,
          isActive: true,
          overrides: null,
          createdAt: now,
          updatedAt: now,
        },
        flatEntityMaps: flatFieldMetadataOptionMaps,
      });
    }
  }

  return flatFieldMetadataOptionMaps;
};
