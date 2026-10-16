import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationHead,
  type FieldShared,
  type RecordFilter,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const computeMorphRelationHeadTargetRelations = ({
  morphRelationHead,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  morphRelationHead: FlatFieldMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): NonNullable<FieldShared['morphRelations']> => {
  if (
    !isFlatFieldMetadataOfType(
      morphRelationHead,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    return [];
  }

  const morphRelationTargets =
    findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
      flatFieldMetadata: morphRelationHead,
      flatFieldMetadataMaps,
      flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: morphRelationHead.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      }),
    });

  return morphRelationTargets.map((morphRelationTarget) => {
    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: morphRelationTarget.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    return {
      type: morphRelationTarget.settings.relationType,
      targetObjectMetadata: {
        id: targetFlatObjectMetadata.id,
        nameSingular: targetFlatObjectMetadata.nameSingular,
        namePlural: targetFlatObjectMetadata.namePlural,
      },
    };
  });
};

export const computeFlatFieldMetadataArrayForRecordFilters = ({
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
}): (FlatFieldMetadata & Pick<FieldShared, 'morphRelations'>)[] => {
  const recordFilterFieldMetadataIds = new Set(
    recordFilters
      .flatMap(({ fieldMetadataId, relationTargetFieldMetadataId }) => [
        fieldMetadataId,
        relationTargetFieldMetadataId,
      ])
      .filter(isDefined),
  );

  return [...recordFilterFieldMetadataIds]
    .map((fieldMetadataId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined)
    .map((flatFieldMetadata) =>
      isMorphRelationHead<FlatFieldMetadata>(flatFieldMetadata)
        ? {
            ...flatFieldMetadata,
            morphRelations: computeMorphRelationHeadTargetRelations({
              morphRelationHead: flatFieldMetadata,
              flatFieldMetadataMaps,
              flatObjectMetadataMaps,
            }),
          }
        : flatFieldMetadata,
    );
};
