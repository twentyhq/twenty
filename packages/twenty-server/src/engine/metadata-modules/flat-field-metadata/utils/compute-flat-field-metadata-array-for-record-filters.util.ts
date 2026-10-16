import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationHead,
  type FieldShared,
  type RecordFilter,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const computeMorphRelations = ({
  morphRelationHead,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  morphRelationHead: FlatFieldMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): NonNullable<FieldShared['morphRelations']> => {
  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: morphRelationHead.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  return (flatObjectMetadata?.fieldIds ?? []).flatMap((fieldId) => {
    const morphRelationTarget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (
      !isDefined(morphRelationTarget) ||
      morphRelationTarget.id === morphRelationHead.id ||
      morphRelationTarget.morphId !== morphRelationHead.morphId ||
      !isFlatFieldMetadataOfType(
        morphRelationTarget,
        FieldMetadataType.MORPH_RELATION,
      ) ||
      !isDefined(morphRelationTarget.relationTargetObjectMetadataId)
    ) {
      return [];
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: morphRelationTarget.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(targetFlatObjectMetadata)) {
      return [];
    }

    return [
      {
        type: morphRelationTarget.settings.relationType,
        targetObjectMetadata: {
          id: targetFlatObjectMetadata.id,
          nameSingular: targetFlatObjectMetadata.nameSingular,
          namePlural: targetFlatObjectMetadata.namePlural,
        },
      },
    ];
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
            morphRelations: computeMorphRelations({
              morphRelationHead: flatFieldMetadata,
              flatFieldMetadataMaps,
              flatObjectMetadataMaps,
            }),
          }
        : flatFieldMetadata,
    );
};
