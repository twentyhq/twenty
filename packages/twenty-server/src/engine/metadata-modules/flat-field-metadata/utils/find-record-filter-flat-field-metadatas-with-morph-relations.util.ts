import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationHead,
  type RecordFilter,
} from 'twenty-shared/utils';

import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveMorphRelationsFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-morph-relations-from-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const findRecordFilterFlatFieldMetadatasWithMorphRelations = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  recordFilters,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  recordFilters: Pick<
    RecordFilter,
    'fieldMetadataId' | 'relationTargetFieldMetadataId'
  >[];
}): (FlatFieldMetadata & { morphRelations?: RelationDTO[] })[] => {
  const recordFilterFieldMetadataIds = new Set(
    recordFilters
      .flatMap(({ fieldMetadataId, relationTargetFieldMetadataId }) => [
        fieldMetadataId,
        relationTargetFieldMetadataId,
      ])
      .filter(isDefined),
  );

  const flatFieldMetadatas = [...recordFilterFieldMetadataIds]
    .map((fieldMetadataId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined);

  const morphRelationHeadIds = new Set(
    flatFieldMetadatas
      .filter((flatFieldMetadata): boolean =>
        isMorphRelationHead(flatFieldMetadata),
      )
      .map(({ id }) => id),
  );

  return flatFieldMetadatas.map((flatFieldMetadata) =>
    morphRelationHeadIds.has(flatFieldMetadata.id) &&
    isFlatFieldMetadataOfType(
      flatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
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
