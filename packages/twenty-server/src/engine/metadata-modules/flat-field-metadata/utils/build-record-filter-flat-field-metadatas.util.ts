import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, type RecordFilter } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveMorphRelationsFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-morph-relations-from-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// A morph relation head has no join column, so record filters on it need its targets to know which columns to check.
export const buildRecordFilterFlatFieldMetadatas = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  recordFilters,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  recordFilters: Pick<RecordFilter, 'fieldMetadataId'>[];
}) => {
  const filteredFieldMetadataIds = new Set(
    recordFilters.map(({ fieldMetadataId }) => fieldMetadataId),
  );

  return Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .map((flatFieldMetadata) =>
      filteredFieldMetadataIds.has(flatFieldMetadata.id) &&
      isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      ) &&
      flatFieldMetadata.universalIdentifier === flatFieldMetadata.morphId
        ? {
            ...flatFieldMetadata,
            morphRelations: resolveMorphRelationsFromFlatFieldMetadata({
              morphFlatFieldMetadata: flatFieldMetadata,
              flatFieldMetadataMaps,
              flatObjectMetadataMaps,
            }),
          }
        : flatFieldMetadata,
    );
};
