import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type CreateStandardPermissionFlagArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/permission-flag-metadata/create-standard-permission-flag-flat-metadata.util';
import { STANDARD_FLAT_PERMISSION_FLAG_METADATA_BUILDERS_BY_KEY } from 'src/engine/workspace-manager/twenty-standard-application/utils/permission-flag-metadata/create-standard-flat-permission-flag-metadata.util';

export const buildStandardFlatPermissionFlagMetadataMaps = (
  args: Omit<CreateStandardPermissionFlagArgs, 'context'>,
): FlatEntityMaps<FlatPermissionFlag> => {
  const allPermissionFlagMetadatas: FlatPermissionFlag[] =
    Object.values(
      STANDARD_FLAT_PERMISSION_FLAG_METADATA_BUILDERS_BY_KEY,
    ).map((builder) => builder(args));

  let flatPermissionFlagMaps = createEmptyFlatEntityMaps();

  for (const definitionMetadata of allPermissionFlagMetadatas) {
    flatPermissionFlagMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: definitionMetadata,
      flatEntityMaps: flatPermissionFlagMaps,
    });
  }

  return flatPermissionFlagMaps;
};
