import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { computeUniqueFieldMetadataIdsFromIndexes } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-indexes.util';

export const computeUniqueFieldMetadataIdsFromIndexEntities = (
  indexEntities: ReadonlyArray<IndexMetadataEntity>,
): Set<string> => computeUniqueFieldMetadataIdsFromIndexes(indexEntities);
