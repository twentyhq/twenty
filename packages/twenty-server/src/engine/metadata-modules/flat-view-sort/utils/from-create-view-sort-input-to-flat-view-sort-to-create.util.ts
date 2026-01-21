import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type CreateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/create-view-sort.input';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';

export const fromCreateViewSortInputToFlatViewSortToCreate = ({
  createViewSortInput: rawCreateViewSortInput,
  workspaceId,
  workspaceCustomApplicationId,
}: {
  createViewSortInput: CreateViewSortInput;
  workspaceId: string;
  workspaceCustomApplicationId: string;
}): FlatViewSort => {
  const { viewId, fieldMetadataId, ...createViewSortInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewSortInput,
      ['id', 'viewId', 'fieldMetadataId'],
    );

  const createdAt = new Date().toISOString();
  const viewSortId = createViewSortInput.id ?? v4();

  return {
    id: viewSortId,
    viewId,
    fieldMetadataId,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: viewSortId,
    direction: createViewSortInput.direction ?? ViewSortDirection.ASC,
    applicationId: workspaceCustomApplicationId,
  };
};
