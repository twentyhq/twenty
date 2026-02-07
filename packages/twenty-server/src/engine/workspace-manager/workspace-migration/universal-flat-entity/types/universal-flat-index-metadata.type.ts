import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

// Note: IndexFieldMetadataEntity is just in between a SyncableEntity and a jsonb we should decide one of both
export type UniversalFlatIndexFieldMetadata = Omit<
  IndexFieldMetadataEntity,
  'indexMetadataId' | 'indexMetadata' | 'fieldMetadataId' | 'fieldMetadata'
> & {
  indexMetadataUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
};

export type UniversalFlatIndexMetadata =
  UniversalFlatEntityFrom<IndexMetadataEntity> & {
    universalFlatIndexFieldMetadatas: UniversalFlatIndexFieldMetadata[];
  };
