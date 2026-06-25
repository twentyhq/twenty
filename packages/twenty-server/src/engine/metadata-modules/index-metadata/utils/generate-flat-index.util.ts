import { computeIndexName } from 'src/engine/metadata-modules/index-metadata/utils/compute-index-name.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export type GenerateFlatIndexArgs = {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  flatIndex: Omit<UniversalFlatIndexMetadata, 'name'>;
};

export const generateFlatIndexMetadataWithNameOrThrow = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  flatIndex,
}: GenerateFlatIndexArgs): UniversalFlatIndexMetadata => ({
  ...flatIndex,
  name: computeIndexName({
    flatObjectMetadata,
    objectFlatFieldMetadatas,
    indexFieldDescriptors: flatIndex.universalFlatIndexFieldMetadatas,
    isUnique: flatIndex.isUnique,
    indexWhereClause: flatIndex.indexWhereClause,
  }),
});
