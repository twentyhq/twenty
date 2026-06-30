import { type FromTo } from 'twenty-shared/types';
import { isDefined, isSearchableFieldType } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

export type LabelIdentifierUpdateSearchFieldMetadataSideEffect = {
  searchFieldMetadatasToCreate: UniversalFlatSearchFieldMetadata[];
};

type ComputeSearchFieldMetadataToCreateOnLabelIdentifierUpdateArgs = FromTo<
  FlatObjectMetadata,
  'flatObjectMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    'flatFieldMetadataMaps' | 'flatSearchFieldMetadataMaps'
  >;

const EMPTY_SIDE_EFFECT: LabelIdentifierUpdateSearchFieldMetadataSideEffect = {
  searchFieldMetadatasToCreate: [],
};

// Relabeling is additive: it indexes the new label identifier field while preserving the
// existing search surface (e.g. the provisioned name row). We never drop a row here so the
// previous label identifier stays searchable. The searchVector column itself is rebuilt
// from the resulting rows by the rebuildSearchVector marker in the migration runner.
export const computeSearchFieldMetadataToCreateOnLabelIdentifierUpdate = ({
  fromFlatObjectMetadata,
  toFlatObjectMetadata,
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
}: ComputeSearchFieldMetadataToCreateOnLabelIdentifierUpdateArgs): LabelIdentifierUpdateSearchFieldMetadataSideEffect => {
  const newLabelIdentifierFieldMetadataId =
    toFlatObjectMetadata.labelIdentifierFieldMetadataId;

  if (
    !toFlatObjectMetadata.isSearchable ||
    !isDefined(newLabelIdentifierFieldMetadataId) ||
    fromFlatObjectMetadata.labelIdentifierFieldMetadataId ===
      newLabelIdentifierFieldMetadataId
  ) {
    return EMPTY_SIDE_EFFECT;
  }

  const existingSearchFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow<FlatSearchFieldMetadata>({
      flatEntityMaps: flatSearchFieldMetadataMaps,
      flatEntityIds: fromFlatObjectMetadata.searchFieldMetadataIds,
    });

  const newLabelIdentifierAlreadyIndexed = existingSearchFieldMetadatas.some(
    (searchFieldMetadata) =>
      searchFieldMetadata.fieldMetadataId === newLabelIdentifierFieldMetadataId,
  );

  const newLabelIdentifierField = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: newLabelIdentifierFieldMetadataId,
  });

  const shouldIndexNewLabelIdentifier =
    isDefined(newLabelIdentifierField) &&
    isSearchableFieldType(newLabelIdentifierField.type) &&
    !newLabelIdentifierAlreadyIndexed;

  if (!shouldIndexNewLabelIdentifier) {
    return EMPTY_SIDE_EFFECT;
  }

  const tsVectorFlatFieldMetadata = findTsVectorFlatFieldMetadataForObject({
    fieldUniversalIdentifiers: fromFlatObjectMetadata.fieldUniversalIdentifiers,
    flatFieldMetadataMaps,
  });

  if (!isDefined(tsVectorFlatFieldMetadata)) {
    return EMPTY_SIDE_EFFECT;
  }

  const newLabelIdentifierPosition =
    existingSearchFieldMetadatas.reduce(
      (maxPosition, searchFieldMetadata) =>
        Math.max(maxPosition, searchFieldMetadata.position),
      -1,
    ) + 1;

  const newSearchFieldMetadata = buildFlatSearchFieldMetadataForField({
    flatObjectMetadata: fromFlatObjectMetadata,
    flatFieldMetadata: newLabelIdentifierField,
    tsVectorFlatFieldMetadata,
    position: newLabelIdentifierPosition,
  });

  return {
    searchFieldMetadatasToCreate: [newSearchFieldMetadata],
  };
};
