import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';

export const fromCreateViewGroupInputToFlatViewGroupToCreate = ({
  createViewGroupInput: rawCreateViewGroupInput,
  workspaceId,
  workspaceCustomApplicationId,
}: {
  createViewGroupInput: CreateViewGroupInput;
  workspaceId: string;
  workspaceCustomApplicationId: string;
}): FlatViewGroup => {
  const { fieldMetadataId, viewId, ...createViewGroupInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewGroupInput,
      ['fieldMetadataId', 'fieldValue', 'id', 'viewId'],
    );

  const createdAt = new Date();
  const viewGroupId = createViewGroupInput.id ?? v4();

  return {
    id: viewGroupId,
    fieldMetadataId,
    viewId,
    workspaceId,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier:
      createViewGroupInput.universalIdentifier ?? viewGroupId,
    isVisible: createViewGroupInput.isVisible ?? true,
    fieldValue: createViewGroupInput.fieldValue,
    position: createViewGroupInput.position ?? 0,
    applicationId: workspaceCustomApplicationId,
  };
};
