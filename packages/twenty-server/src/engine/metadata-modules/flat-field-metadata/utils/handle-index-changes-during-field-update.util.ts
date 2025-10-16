import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateIndexForFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-index-for-flat-field-metadata.util';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type IndexChanges = {
  flatIndexMetadataToUpdate: FlatIndexMetadata[];
  flatIndexMetadatasToDelete: FlatIndexMetadata[];
  flatIndexMetadatasToCreate: FlatIndexMetadata[];
};

const NO_INDEX_CHANGES: IndexChanges = {
  flatIndexMetadataToUpdate: [],
  flatIndexMetadatasToDelete: [],
  flatIndexMetadatasToCreate: [],
};

export const handleIndexChangesDuringFieldUpdate = ({
  originalFlatFieldMetadata,
  updatedFlatFieldMetadata,
  flatIndexMaps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  originalFlatFieldMetadata: FlatFieldMetadata;
  updatedFlatFieldMetadata: FlatFieldMetadata;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): IndexChanges => {
  if (
    !hasIndexRelevantChanges({
      originalFlatFieldMetadata,
      updatedFlatFieldMetadata,
    })
  ) {
    return NO_INDEX_CHANGES;
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    flatEntityId: originalFlatFieldMetadata.objectMetadataId,
  });

  const relatedIndexes = findRelatedIndexes({
    flatFieldMetadata: originalFlatFieldMetadata,
    flatObjectMetadata,
    flatIndexMaps,
  });

  if (relatedIndexes.length === 0) {
    return handleNoExistingIndexes({
      updatedFlatFieldMetadata,
      flatObjectMetadata,
    });
  }

  return handleExistingIndexes({
    updatedFlatFieldMetadata,
    originalFlatFieldMetadata,
    relatedIndexes,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });
};

const hasIndexRelevantChanges = ({
  originalFlatFieldMetadata,
  updatedFlatFieldMetadata,
}: {
  originalFlatFieldMetadata: FlatFieldMetadata;
  updatedFlatFieldMetadata: FlatFieldMetadata;
}): boolean =>
  originalFlatFieldMetadata.name !== updatedFlatFieldMetadata.name ||
  originalFlatFieldMetadata.isUnique !== updatedFlatFieldMetadata.isUnique;

const findRelatedIndexes = ({
  flatFieldMetadata,
  flatObjectMetadata,
  flatIndexMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
}): FlatIndexMetadata[] => {
  const objectIndexes = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatIndexMaps,
    flatEntityIds: flatObjectMetadata.indexMetadataIds,
  });

  return objectIndexes.filter((index) =>
    index.flatIndexFieldMetadatas.some(
      (indexField) => indexField.fieldMetadataId === flatFieldMetadata.id,
    ),
  );
};

const handleNoExistingIndexes = ({
  updatedFlatFieldMetadata,
  flatObjectMetadata,
}: {
  updatedFlatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
}): IndexChanges => {
  if (!updatedFlatFieldMetadata.isUnique) {
    return NO_INDEX_CHANGES;
  }

  const newIndex = generateIndexForFlatFieldMetadata({
    flatFieldMetadata: updatedFlatFieldMetadata,
    flatObjectMetadata,
    workspaceId: flatObjectMetadata.workspaceId,
  });

  return {
    ...NO_INDEX_CHANGES,
    flatIndexMetadatasToCreate: [newIndex],
  };
};

const handleExistingIndexes = ({
  updatedFlatFieldMetadata,
  originalFlatFieldMetadata,
  relatedIndexes,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  updatedFlatFieldMetadata: FlatFieldMetadata;
  originalFlatFieldMetadata: FlatFieldMetadata;
  relatedIndexes: FlatIndexMetadata[];
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
}): IndexChanges => {
  if (updatedFlatFieldMetadata.isUnique === false) {
    const expectedUniqueIndex = generateIndexForFlatFieldMetadata({
      flatFieldMetadata: {
        ...originalFlatFieldMetadata,
        isUnique: true,
      },
      flatObjectMetadata,
      workspaceId: flatObjectMetadata.workspaceId,
    });

    const uniqueIndexToDelete = relatedIndexes.find(
      (index) => index.name === expectedUniqueIndex.name,
    );

    return {
      ...NO_INDEX_CHANGES,
      flatIndexMetadatasToDelete: uniqueIndexToDelete
        ? [uniqueIndexToDelete]
        : [],
    };
  }

  const updatedIndexes = recomputeIndexOnFlatFieldMetadataNameUpdate({
    flatFieldMetadataMaps,
    flatObjectMetadata,
    fromFlatFieldMetadata: originalFlatFieldMetadata,
    toFlatFieldMetadata: {
      name: updatedFlatFieldMetadata.name,
      isUnique: updatedFlatFieldMetadata.isUnique,
    },
    relatedFlatIndexMetadata: relatedIndexes,
  });

  return {
    ...NO_INDEX_CHANGES,
    flatIndexMetadataToUpdate: updatedIndexes,
  };
};
