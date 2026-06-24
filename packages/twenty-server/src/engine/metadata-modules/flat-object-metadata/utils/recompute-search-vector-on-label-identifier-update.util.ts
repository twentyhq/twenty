import { type FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { isDefined, isSearchableFieldType } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { recomputeSearchVectorFieldFromSearchFieldMetadatas } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-search-vector-field-from-search-field-metadatas.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

export type LabelIdentifierUpdateSearchVectorSideEffect = {
  flatSearchVectorFieldToUpdate:
    | FlatFieldMetadata<FieldMetadataType.TS_VECTOR>
    | undefined;
  searchFieldMetadatasToCreate: UniversalFlatSearchFieldMetadata[];
};

type RecomputeSearchVectorOnLabelIdentifierUpdateArgs = FromTo<
  FlatObjectMetadata,
  'flatObjectMetadata'
> &
  Pick<
    AllFlatEntityMaps,
    'flatFieldMetadataMaps' | 'flatSearchFieldMetadataMaps'
  >;

const EMPTY_SIDE_EFFECT: LabelIdentifierUpdateSearchVectorSideEffect = {
  flatSearchVectorFieldToUpdate: undefined,
  searchFieldMetadatasToCreate: [],
};

// Relabeling is additive: it indexes the new label identifier field while preserving the
// existing search surface (e.g. the provisioned name row). We never drop a row here so the
// previous label identifier stays searchable. Removal of fields from the search surface is
// deferred to a follow-up PR.
export const recomputeSearchVectorOnLabelIdentifierUpdate = ({
  fromFlatObjectMetadata,
  toFlatObjectMetadata,
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
}: RecomputeSearchVectorOnLabelIdentifierUpdateArgs): LabelIdentifierUpdateSearchVectorSideEffect => {
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

  const nextSearchFieldMetadatas = [
    ...existingSearchFieldMetadatas,
    {
      fieldMetadataId: newLabelIdentifierFieldMetadataId,
      position: newLabelIdentifierPosition,
      universalIdentifier: newSearchFieldMetadata.universalIdentifier,
      tsVectorFieldMetadataId: tsVectorFlatFieldMetadata.id,
    },
  ];

  return {
    flatSearchVectorFieldToUpdate:
      recomputeSearchVectorFieldFromSearchFieldMetadatas({
        flatObjectMetadata: fromFlatObjectMetadata,
        flatFieldMetadataMaps,
        searchFieldMetadatas: nextSearchFieldMetadatas,
      }),
    searchFieldMetadatasToCreate: [newSearchFieldMetadata],
  };
};
