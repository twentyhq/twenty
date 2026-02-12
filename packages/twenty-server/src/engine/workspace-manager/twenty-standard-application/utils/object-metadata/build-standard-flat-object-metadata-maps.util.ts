import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_FLAT_OBJECT_METADATA_BUILDERS_BY_OBJECT_NAME } from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/create-standard-flat-object-metadata.util';
import { type CreateStandardObjectArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/create-standard-object-flat-metadata.util';

export const buildStandardFlatObjectMetadataMaps = (
  args: Omit<CreateStandardObjectArgs, 'context' | 'objectName'>,
): FlatEntityMaps<FlatObjectMetadata> => {
  const allObjectMetadatas: FlatObjectMetadata[] = Object.values(
    STANDARD_FLAT_OBJECT_METADATA_BUILDERS_BY_OBJECT_NAME,
  ).map((builder) => builder(args));

  let flatObjectMetadataMaps = createEmptyFlatEntityMaps();

  for (const objectMetadata of allObjectMetadatas) {
    flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: objectMetadata,
      flatEntityMaps: flatObjectMetadataMaps,
    });
  }

  return flatObjectMetadataMaps;
};
