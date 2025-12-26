import { ViewFilterOperand } from 'twenty-shared/types';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';

export const fromCreateViewFilterInputToFlatViewFilterToCreate = ({
  createViewFilterInput: rawCreateViewFilterInput,
  workspaceId,
  workspaceCustomApplicationId,
}: {
  createViewFilterInput: CreateViewFilterInput;
  workspaceId: string;
  workspaceCustomApplicationId: string;
}): FlatViewFilter => {
  const { fieldMetadataId, viewId, value, ...createViewFilterInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFilterInput,
      [
        'fieldMetadataId',
        'id',
        'viewId',
        'viewFilterGroupId',
        'operand',
        'subFieldName',
      ],
    );

  const createdAt = new Date().toISOString();
  const viewFilterId = createViewFilterInput.id ?? v4();

  return {
    id: viewFilterId,
    fieldMetadataId,
    viewId,
    workspaceId,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier:
      createViewFilterInput.universalIdentifier ?? viewFilterId,
    operand: createViewFilterInput.operand ?? ViewFilterOperand.CONTAINS,
    value: value,
    viewFilterGroupId: createViewFilterInput.viewFilterGroupId ?? null,
    positionInViewFilterGroup:
      createViewFilterInput.positionInViewFilterGroup ?? null,
    subFieldName: createViewFilterInput.subFieldName ?? null,
    applicationId: workspaceCustomApplicationId,
  };
};
