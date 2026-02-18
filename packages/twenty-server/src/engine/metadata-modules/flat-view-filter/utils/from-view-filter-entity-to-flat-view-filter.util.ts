import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromViewFilterEntityToFlatViewFilter = ({
  entity: viewFilterEntity,
  applicationIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
  viewFilterGroupIdToUniversalIdentifierMap,
  viewIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'viewFilter'>): FlatViewFilter => {
  const viewFilterEntityWithoutRelations = removePropertiesFromRecord(
    viewFilterEntity,
    getMetadataEntityRelationProperties('viewFilter'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(viewFilterEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${viewFilterEntity.applicationId} not found for viewFilter ${viewFilterEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const fieldMetadataUniversalIdentifier =
    fieldMetadataIdToUniversalIdentifierMap.get(
      viewFilterEntity.fieldMetadataId,
    );

  if (!isDefined(fieldMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `FieldMetadata with id ${viewFilterEntity.fieldMetadataId} not found for viewFilter ${viewFilterEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  let viewFilterGroupUniversalIdentifier: string | null = null;

  if (isDefined(viewFilterEntity.viewFilterGroupId)) {
    viewFilterGroupUniversalIdentifier =
      viewFilterGroupIdToUniversalIdentifierMap.get(
        viewFilterEntity.viewFilterGroupId,
      ) ?? null;

    if (!isDefined(viewFilterGroupUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `ViewFilterGroup with id ${viewFilterEntity.viewFilterGroupId} not found for viewFilter ${viewFilterEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  const viewUniversalIdentifier = viewIdToUniversalIdentifierMap.get(
    viewFilterEntity.viewId,
  );

  if (!isDefined(viewUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `View with id ${viewFilterEntity.viewId} not found for viewFilter ${viewFilterEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...viewFilterEntityWithoutRelations,
    createdAt: viewFilterEntity.createdAt.toISOString(),
    updatedAt: viewFilterEntity.updatedAt.toISOString(),
    deletedAt: viewFilterEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewFilterEntityWithoutRelations.universalIdentifier,
    applicationUniversalIdentifier,
    fieldMetadataUniversalIdentifier,
    viewFilterGroupUniversalIdentifier,
    viewUniversalIdentifier,
  };
};
