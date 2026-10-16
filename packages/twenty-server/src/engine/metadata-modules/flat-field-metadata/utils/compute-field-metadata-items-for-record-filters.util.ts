import { FieldMetadataType, type RelationType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationHead,
  type RecordFilter,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { computeFlatFieldMetadataArrayForRecordFilters } from 'src/engine/metadata-modules/flat-field-metadata/utils/compute-flat-field-metadata-array-for-record-filters.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

type RecordFilterMorphRelation = {
  type: RelationType;
  targetObjectMetadata: Pick<
    FlatObjectMetadata,
    'id' | 'nameSingular' | 'namePlural'
  >;
};

// Morph fields get the morph name and morphRelations the metadata API gives the frontend
export const computeFieldMetadataItemsForRecordFilters = <
  TFlatFieldMetadata extends OrmFlatFieldMetadata,
>({
  recordFilters,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  recordFilters: Pick<
    RecordFilter,
    'fieldMetadataId' | 'relationTargetFieldMetadataId'
  >[];
  flatFieldMetadataMaps: FlatEntityMaps<TFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): (TFlatFieldMetadata & { morphRelations?: RecordFilterMorphRelation[] })[] =>
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

    const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatFieldMetadata.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const morphRelationTargetFlatFieldMetadatas =
      sourceFlatObjectMetadata.fieldIds
        .map((fieldId) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldId,
            flatEntityMaps: flatFieldMetadataMaps,
          }),
        )
        .filter(isDefined)
        .filter(isMorphOrRelationFlatFieldMetadata)
        .filter(
          (morphRelationTargetFlatFieldMetadata) =>
            morphRelationTargetFlatFieldMetadata.type ===
              FieldMetadataType.MORPH_RELATION &&
            morphRelationTargetFlatFieldMetadata.morphId ===
              flatFieldMetadata.morphId,
        );

    const morphRelations = morphRelationTargetFlatFieldMetadatas.map(
      (morphRelationTargetFlatFieldMetadata) => {
        const { id, nameSingular, namePlural } =
          findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId:
              morphRelationTargetFlatFieldMetadata.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          });

        return {
          type: morphRelationTargetFlatFieldMetadata.settings.relationType,
          targetObjectMetadata: { id, nameSingular, namePlural },
        };
      },
    );

    const flatFieldMetadataWithMorphRelations = {
      ...flatFieldMetadata,
      morphRelations,
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
        morphRelationFlatFieldMetadata: {
          name: flatFieldMetadata.name,
          universalSettings: {
            relationType: flatFieldMetadata.settings.relationType,
          },
        },
        nameSingular: relationTargetFlatObjectMetadata.nameSingular,
        namePlural: relationTargetFlatObjectMetadata.namePlural,
      }),
    };
  });
