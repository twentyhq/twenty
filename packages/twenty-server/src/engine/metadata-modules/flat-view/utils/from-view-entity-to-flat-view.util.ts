import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

export const fromViewEntityToFlatView = ({
  viewEntity,
  applicationIdToUniversalIdentifierMap,
  objectMetadataIdToUniversalIdentifierMap,
  fieldMetadataIdToUniversalIdentifierMap,
}: {
  viewEntity: EntityWithRegroupedOneToManyRelations<ViewEntity>;
  applicationIdToUniversalIdentifierMap: Map<string, string>;
  objectMetadataIdToUniversalIdentifierMap: Map<string, string>;
  fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
}): FlatView => {
  const viewEntityWithoutRelations = removePropertiesFromRecord(
    viewEntity,
    getMetadataEntityRelationProperties('view'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(viewEntity.applicationId);

  if (!applicationUniversalIdentifier) {
    throw new FlatEntityMapsException(
      `Application with id ${viewEntity.applicationId} not found for view ${viewEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  const objectMetadataUniversalIdentifier =
    objectMetadataIdToUniversalIdentifierMap.get(viewEntity.objectMetadataId);

  if (!objectMetadataUniversalIdentifier) {
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

    if (!kanbanAggregateOperationFieldMetadataUniversalIdentifier) {
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

    if (!calendarFieldMetadataUniversalIdentifier) {
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

    if (!mainGroupByFieldMetadataUniversalIdentifier) {
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
    __universal: {
      universalIdentifier: viewEntity.universalIdentifier,
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
    },
  };
};
