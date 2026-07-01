import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';

export const getObjectMetadataIdByName = ({
  flatObjectMetadataMaps,
  objectName,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  objectName: string;
}): string | undefined => {
  const { idByNameSingular, idByNamePlural } = buildObjectIdByNameMaps(
    flatObjectMetadataMaps,
  );

  return idByNameSingular[objectName] ?? idByNamePlural[objectName];
};
