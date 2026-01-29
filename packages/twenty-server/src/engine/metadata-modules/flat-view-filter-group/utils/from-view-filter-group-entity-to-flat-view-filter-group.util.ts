import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

type FromViewFilterGroupEntityToFlatViewFilterGroupArgs =
  FromEntityToFlatEntityArgs<'viewFilterGroup'> & {
    viewFilterGroupIdToUniversalIdentifierMap: Map<string, string>;
  };

export const fromViewFilterGroupEntityToFlatViewFilterGroup = ({
  entity: viewFilterGroupEntity,
  applicationIdToUniversalIdentifierMap,
  viewFilterGroupIdToUniversalIdentifierMap,
  viewIdToUniversalIdentifierMap,
}: FromViewFilterGroupEntityToFlatViewFilterGroupArgs): FlatViewFilterGroup => {
  const viewFilterGroupEntityWithoutRelations = removePropertiesFromRecord(
    viewFilterGroupEntity,
    getMetadataEntityRelationProperties('viewFilterGroup'),
  );

  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      viewFilterGroupEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${viewFilterGroupEntity.applicationId} not found for viewFilterGroup ${viewFilterGroupEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  let parentViewFilterGroupUniversalIdentifier: string | null = null;

  if (isDefined(viewFilterGroupEntity.parentViewFilterGroupId)) {
    parentViewFilterGroupUniversalIdentifier =
      viewFilterGroupIdToUniversalIdentifierMap.get(
        viewFilterGroupEntity.parentViewFilterGroupId,
      ) ?? null;

    if (!isDefined(parentViewFilterGroupUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        `ViewFilterGroup with id ${viewFilterGroupEntity.parentViewFilterGroupId} not found for viewFilterGroup ${viewFilterGroupEntity.id}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }
  }

  const viewUniversalIdentifier = viewIdToUniversalIdentifierMap.get(
    viewFilterGroupEntity.viewId,
  );

  if (!isDefined(viewUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `View with id ${viewFilterGroupEntity.viewId} not found for viewFilterGroup ${viewFilterGroupEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    ...viewFilterGroupEntityWithoutRelations,
    createdAt: viewFilterGroupEntity.createdAt.toISOString(),
    updatedAt: viewFilterGroupEntity.updatedAt.toISOString(),
    deletedAt: viewFilterGroupEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier:
      viewFilterGroupEntityWithoutRelations.universalIdentifier,
    viewFilterIds: viewFilterGroupEntity.viewFilters?.map(({ id }) => id) ?? [],
    childViewFilterGroupIds:
      viewFilterGroupEntity.childViewFilterGroups?.map(({ id }) => id) ?? [],
    applicationUniversalIdentifier,
    parentViewFilterGroupUniversalIdentifier,
    viewUniversalIdentifier,
    viewFilterUniversalIdentifiers:
      viewFilterGroupEntity.viewFilters?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
    childViewFilterGroupUniversalIdentifiers:
      viewFilterGroupEntity.childViewFilterGroups?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
  };
};
