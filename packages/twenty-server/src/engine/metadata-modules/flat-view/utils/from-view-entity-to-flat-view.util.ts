import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromViewEntityToFlatView = ({
  entity: viewEntity,
  applicationIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'view'>): FlatView => {
  const viewEntityWithoutRelations = removePropertiesFromRecord(
    viewEntity,
    getMetadataEntityRelationProperties('view'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(viewEntity.applicationId);

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${viewEntity.applicationId} not found for view ${viewEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const objectMetadataUniversalIdentifier =
    objectMetadataIdToUniversalIdentifierMap.get(viewEntity.objectMetadataId);

  if (!isDefined(objectMetadataUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `ObjectMetadata with id ${viewEntity.objectMetadataId} not found for view ${viewEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  let kanbanAggregateOperationFieldMetadataUniversalIdentifier: string | null =
    null;

  if (isDefined(viewEntity.kanbanAggregateOperationFieldMetadataId)) {
    kanbanAggregateOperationFieldMetadataUniversalIdentifier =
      fieldMetadataIdToUniversalIdentifierMap.get(
        viewEntity.kanbanAggregateOperationFieldMetadataId,
      ) ?? null;

    if (!isDefined(kanbanAggregateOperationFieldMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `FieldMetadata with id ${viewEntity.kanbanAggregateOperationFieldMetadataId} not found for view ${viewEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  let calendarFieldMetadataUniversalIdentifier: string | null = null;

  if (isDefined(viewEntity.calendarFieldMetadataId)) {
    calendarFieldMetadataUniversalIdentifier =
      fieldMetadataIdToUniversalIdentifierMap.get(
        viewEntity.calendarFieldMetadataId,
      ) ?? null;

    if (!isDefined(calendarFieldMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `FieldMetadata with id ${viewEntity.calendarFieldMetadataId} not found for view ${viewEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  let mainGroupByFieldMetadataUniversalIdentifier: string | null = null;

  if (isDefined(viewEntity.mainGroupByFieldMetadataId)) {
    mainGroupByFieldMetadataUniversalIdentifier =
      fieldMetadataIdToUniversalIdentifierMap.get(
        viewEntity.mainGroupByFieldMetadataId,
      ) ?? null;

    if (!isDefined(mainGroupByFieldMetadataUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `FieldMetadata with id ${viewEntity.mainGroupByFieldMetadataId} not found for view ${viewEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  return {
    ...viewEntityWithoutRelations,
    createdAt: viewEntity.createdAt.toISOString(),
    updatedAt: viewEntity.updatedAt.toISOString(),
    deletedAt: viewEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: viewEntityWithoutRelations.universalIdentifier,
    viewFieldIds: viewEntity.viewFields.map(({ id }) => id),
    viewFilterIds: viewEntity.viewFilters.map(({ id }) => id),
    viewGroupIds: viewEntity.viewGroups.map(({ id }) => id),
    viewFilterGroupIds: viewEntity.viewFilterGroups?.map(({ id }) => id) ?? [],
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    calendarFieldMetadataUniversalIdentifier,
    mainGroupByFieldMetadataUniversalIdentifier,
    viewFieldUniversalIdentifiers: viewEntity.viewFields.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewFilterUniversalIdentifiers: viewEntity.viewFilters.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewGroupUniversalIdentifiers: viewEntity.viewGroups.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    viewFilterGroupUniversalIdentifiers:
      viewEntity.viewFilterGroups?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
  };
};
