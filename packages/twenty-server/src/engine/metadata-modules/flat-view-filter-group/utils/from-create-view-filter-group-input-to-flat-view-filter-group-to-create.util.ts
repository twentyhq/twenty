import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';

export const fromCreateViewFilterGroupInputToFlatViewFilterGroupToCreate = ({
  createViewFilterGroupInput: rawCreateViewFilterGroupInput,
  workspaceId,
  workspaceCustomApplicationId,
}: {
  createViewFilterGroupInput: CreateViewFilterGroupInput;
  workspaceId: string;
  workspaceCustomApplicationId: string;
}): FlatViewFilterGroup => {
  const { viewId, ...createViewFilterGroupInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFilterGroupInput,
      ['id', 'viewId', 'parentViewFilterGroupId'],
    );

  const createdAt = new Date().toISOString();
  const viewFilterGroupId = createViewFilterGroupInput.id ?? v4();

  return {
    id: viewFilterGroupId,
    viewId,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: viewFilterGroupId,
    logicalOperator:
      createViewFilterGroupInput.logicalOperator ??
      ViewFilterGroupLogicalOperator.AND,
    parentViewFilterGroupId:
      createViewFilterGroupInput.parentViewFilterGroupId ?? null,
    positionInViewFilterGroup:
      createViewFilterGroupInput.positionInViewFilterGroup ?? null,
    applicationId: workspaceCustomApplicationId,
    viewFilterIds: [],
    childViewFilterGroupIds: [],
  };
};
