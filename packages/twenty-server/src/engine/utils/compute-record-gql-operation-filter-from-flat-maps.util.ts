import {
  FieldMetadataType,
  type RecordFilterValueDependencies,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  isMorphRelationHead,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { findAllOthersMorphRelationFlatFieldMetadatasOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-all-others-morph-relation-flat-field-metadatas-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

const findRecordFilterFlatFieldMetadatas = ({
  recordFilters,
  flatFieldMetadataMaps,
}: {
  recordFilters: Omit<RecordFilter, 'id'>[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): OrmFlatFieldMetadata[] =>
  [
    ...new Set(
      recordFilters
        .flatMap(({ fieldMetadataId, relationTargetFieldMetadataId }) => [
          fieldMetadataId,
          relationTargetFieldMetadataId,
        ])
        .filter(isDefined),
    ),
  ]
    .map((fieldMetadataId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined);

const addMorphRelationsToMorphRelationFlatFieldMetadata = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadata: OrmFlatFieldMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}) => {
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

  const morphRelationTargetFlatFieldMetadatas = [
    flatFieldMetadata,
    ...findAllOthersMorphRelationFlatFieldMetadatasOrThrow({
      flatFieldMetadataMaps,
      flatFieldMetadata,
      flatObjectMetadata: sourceFlatObjectMetadata,
    }),
  ].filter(isMorphOrRelationFlatFieldMetadata);

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
};

export const computeRecordGqlOperationFilterFromFlatMaps = ({
  recordFilters,
  recordFilterGroups,
  filterValueDependencies,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  recordFilters: Omit<RecordFilter, 'id'>[];
  recordFilterGroups: RecordFilterGroup[];
  filterValueDependencies: RecordFilterValueDependencies;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): RecordGqlOperationFilter =>
  computeRecordGqlOperationFilter({
    recordFilters,
    recordFilterGroups,
    filterValueDependencies,
    fieldMetadataItems: findRecordFilterFlatFieldMetadatas({
      recordFilters,
      flatFieldMetadataMaps,
    }).map((flatFieldMetadata) =>
      addMorphRelationsToMorphRelationFlatFieldMetadata({
        flatFieldMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      }),
    ),
  });
