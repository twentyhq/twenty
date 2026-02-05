import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type CreateViewGroupInput } from 'src/engine/metadata-modules/view-group/dtos/inputs/create-view-group.input';

export const fromCreateViewGroupInputToFlatViewGroupToCreate = ({
  createViewGroupInput: rawCreateViewGroupInput,
  workspaceId,
  flatApplication,
}: {
  createViewGroupInput: CreateViewGroupInput;
  workspaceId: string;
  flatApplication: FlatApplication;
}): FlatViewGroup => {
  const { viewId, ...createViewGroupInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewGroupInput,
      ['fieldValue', 'id', 'viewId'],
    );

  const createdAt = new Date().toISOString();
  const viewGroupId = createViewGroupInput.id ?? v4();

  return {
    id: viewGroupId,
    viewId,
    workspaceId,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewGroupInput.universalIdentifier ?? v4(),
    isVisible: createViewGroupInput.isVisible ?? true,
    fieldValue: createViewGroupInput.fieldValue,
    position: createViewGroupInput.position ?? 0,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
