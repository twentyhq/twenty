import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type BuildStandardFlatObjectMetadatasArgs,
  STANDARD_FLAT_OBJECT_METADATA_BUILDERS_BY_OBJECT_NAME,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-flat-object-metadata.util';

const createEmptyFlatObjectMetadataMaps =
  (): FlatEntityMaps<FlatObjectMetadata> => ({
    byId: {},
    idByUniversalIdentifier: {},
    universalIdentifiersByApplicationId: {},
  });

export const buildStandardFlatObjectMetadataMaps = (
  args: BuildStandardFlatObjectMetadatasArgs,
): FlatEntityMaps<FlatObjectMetadata> => {
  // Collect all object metadatas from all standard objects
  const allObjectMetadatas: FlatObjectMetadata[] = Object.values(
    STANDARD_FLAT_OBJECT_METADATA_BUILDERS_BY_OBJECT_NAME,
  ).map((builder) => builder(args));

  // Build maps using addFlatEntityToFlatEntityMapsOrThrow to prevent duplicate IDs
  let flatObjectMetadataMaps = createEmptyFlatObjectMetadataMaps();

  for (const objectMetadata of allObjectMetadatas) {
    flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: objectMetadata,
      flatEntityMaps: flatObjectMetadataMaps,
    });
  }

  return flatObjectMetadataMaps;
};
