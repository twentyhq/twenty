import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
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

export const handleIndexChangesDuringFieldUpdate = (
  originalFieldMetadata: FlatFieldMetadata,
  updatedFieldMetadata: FlatFieldMetadata,
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>,
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): IndexChanges => {
  if (!hasIndexRelevantChanges(originalFieldMetadata, updatedFieldMetadata)) {
    return NO_INDEX_CHANGES;
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    flatEntityId: originalFieldMetadata.objectMetadataId,
  });

  const relatedIndexes = findRelatedIndexes(
    originalFieldMetadata,
    flatIndexMaps,
  );

  if (relatedIndexes.length === 0) {
    return handleNoExistingIndexes(updatedFieldMetadata, flatObjectMetadata);
  }

  return handleExistingIndexes(
    updatedFieldMetadata,
    originalFieldMetadata,
    relatedIndexes,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );
};

const hasIndexRelevantChanges = (
  original: FlatFieldMetadata,
  updated: FlatFieldMetadata,
): boolean => {
  return (
    original.name !== updated.name || original.isUnique !== updated.isUnique
  );
};

const findRelatedIndexes = (
  fieldMetadata: FlatFieldMetadata,
  flatIndexMaps: AllFlatEntityMaps['flatIndexMaps'],
): FlatIndexMetadata[] => {
  return Object.values(flatIndexMaps.byId).filter(
    (index): index is FlatIndexMetadata =>
      isDefined(index) &&
      index.objectMetadataId === fieldMetadata.objectMetadataId &&
      index.flatIndexFieldMetadatas.some(
        (indexField) => indexField.fieldMetadataId === fieldMetadata.id,
      ),
  );
};

const handleNoExistingIndexes = (
  updatedFieldMetadata: FlatFieldMetadata,
  flatObjectMetadata: FlatObjectMetadata,
): IndexChanges => {
  if (!updatedFieldMetadata.isUnique) {
    return NO_INDEX_CHANGES;
  }

  const newIndex = generateIndexForFlatFieldMetadata({
    flatFieldMetadata: updatedFieldMetadata,
    flatObjectMetadata,
    workspaceId: flatObjectMetadata.workspaceId,
  });

  return {
    ...NO_INDEX_CHANGES,
    flatIndexMetadatasToCreate: [newIndex],
  };
};

const handleExistingIndexes = (
  updatedFieldMetadata: FlatFieldMetadata,
  originalFieldMetadata: FlatFieldMetadata,
  relatedIndexes: FlatIndexMetadata[],
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'],
): IndexChanges => {
  if (updatedFieldMetadata.isUnique === false) {
    return {
      ...NO_INDEX_CHANGES,
      flatIndexMetadatasToDelete: relatedIndexes,
    };
  }

  const updatedIndexes = recomputeIndexOnFlatFieldMetadataNameUpdate({
    flatFieldMetadataMaps,
    flatObjectMetadata,
    fromFlatFieldMetadata: originalFieldMetadata,
    toFlatFieldMetadata: {
      name: updatedFieldMetadata.name,
      isUnique: updatedFieldMetadata.isUnique,
    },
    relatedFlatIndexMetadata: relatedIndexes,
  });

  return {
    ...NO_INDEX_CHANGES,
    flatIndexMetadataToUpdate: updatedIndexes,
  };
};
