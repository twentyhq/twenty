import { FieldMetadataType } from 'twenty-shared/types';
import { isMorphRelationHead, type RecordFilter } from 'twenty-shared/utils';

import { type RelationDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation.dto';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeFlatFieldMetadataArrayForRecordFilters } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-array-for-record-filters.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveMorphRelationsFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-morph-relations-from-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

// Morph fields get the morph name and morphRelations the metadata API gives the frontend
export const computeFieldMetadataItemsForRecordFilters = ({
  recordFilters,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  recordFilters: Pick<
    RecordFilter,
    'fieldMetadataId' | 'relationTargetFieldMetadataId'
  >[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): (FlatFieldMetadata & { morphRelations?: RelationDTO[] })[] =>
  computeFlatFieldMetadataArrayForRecordFilters({
    flatFieldMetadataMaps,
    recordFilters,
  }).map((flatFieldMetadata) => {
    if (
      !isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
    ) {
      return flatFieldMetadata;
    }

    const flatFieldMetadataWithMorphRelations = {
      ...flatFieldMetadata,
      morphRelations: resolveMorphRelationsFromFlatFieldMetadata({
        morphFlatFieldMetadata: flatFieldMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      }),
    };

    if (isMorphRelationHead(flatFieldMetadata)) {
      return flatFieldMetadataWithMorphRelations;
    }

    const relationTargetFlatObjectMetadata =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

    return {
      ...flatFieldMetadataWithMorphRelations,
      name: getMorphNameFromMorphFieldMetadataName({
        morphRelationFlatFieldMetadata: flatFieldMetadata,
        nameSingular: relationTargetFlatObjectMetadata.nameSingular,
        namePlural: relationTargetFlatObjectMetadata.namePlural,
      }),
    };
  });
