import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import type { FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromSearchFieldMetadataEntityToFlatSearchFieldMetadata = ({
  entity: searchFieldMetadataEntity,
  applicationIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'searchFieldMetadata'>): FlatSearchFieldMetadata => {
  const searchFieldMetadataEntityWithoutRelations = removePropertiesFromRecord(
    searchFieldMetadataEntity,
    getMetadataEntityRelationProperties('searchFieldMetadata'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      searchFieldMetadataEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${searchFieldMetadataEntity.applicationId} not found for searchFieldMetadata ${searchFieldMetadataEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const objectMetadataUniversalIdentifier =
    objectMetadataIdToUniversalIdentifierMap.get(
      searchFieldMetadataEntity.objectMetadataId,
    );

  if (!isDefined(objectMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Object metadata with id ${searchFieldMetadataEntity.objectMetadataId} not found for searchFieldMetadata ${searchFieldMetadataEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const fieldMetadataUniversalIdentifier =
    fieldMetadataIdToUniversalIdentifierMap.get(
      searchFieldMetadataEntity.fieldMetadataId,
    );

  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Field metadata with id ${searchFieldMetadataEntity.fieldMetadataId} not found for searchFieldMetadata ${searchFieldMetadataEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  // Non-null by contract; the cache layer backfills a fallback for legacy rows
  // still NULL before the 2.16 slow command enforces NOT NULL.
  const tsVectorFieldMetadataUniversalIdentifier =
    fieldMetadataIdToUniversalIdentifierMap.get(
      searchFieldMetadataEntity.tsVectorFieldMetadataId,
    );

  if (!isDefined(tsVectorFieldMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `TS_VECTOR field metadata with id ${searchFieldMetadataEntity.tsVectorFieldMetadataId} not found for searchFieldMetadata ${searchFieldMetadataEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...searchFieldMetadataEntityWithoutRelations,
    createdAt: searchFieldMetadataEntity.createdAt.toISOString(),
    updatedAt: searchFieldMetadataEntity.updatedAt.toISOString(),
    universalIdentifier:
      searchFieldMetadataEntityWithoutRelations.universalIdentifier,
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
    tsVectorFieldMetadataUniversalIdentifier,
  };
};
