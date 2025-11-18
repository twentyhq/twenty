import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';

export const fromCreateViewInputToFlatViewToCreate = ({
  createViewInput: rawCreateViewInput,
  workspaceId,
  createdByUserWorkspaceId,
  workspaceCustomApplicationId,
}: {
  createViewInput: CreateViewInput;
  workspaceId: string;
  createdByUserWorkspaceId?: string;
  workspaceCustomApplicationId: string;
}): FlatView => {
  const { objectMetadataId, ...createViewInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewInput,
      ['id', 'name', 'objectMetadataId'],
    );

  const createdAt = new Date();
  const viewId = createViewInput.id ?? v4();

  return {
    id: viewId,
    objectMetadataId,
    workspaceId,
    name: createViewInput.name,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    isCustom: true,
    anyFieldFilterValue: createViewInput.anyFieldFilterValue ?? null,
    calendarFieldMetadataId: createViewInput.calendarFieldMetadataId ?? null,
    calendarLayout: createViewInput.calendarLayout ?? null,
    icon: createViewInput.icon,
    isCompact: createViewInput.isCompact ?? false,
    kanbanAggregateOperation: createViewInput.kanbanAggregateOperation ?? null,
    kanbanAggregateOperationFieldMetadataId:
      createViewInput.kanbanAggregateOperationFieldMetadataId ?? null,
    key: createViewInput.key ?? null,
    openRecordIn: createViewInput.openRecordIn ?? ViewOpenRecordIn.SIDE_PANEL,
    position: createViewInput.position ?? 0,
    type: createViewInput.type ?? ViewType.TABLE,
    universalIdentifier: createViewInput.universalIdentifier ?? viewId,
    visibility: createViewInput.visibility ?? ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: createdByUserWorkspaceId ?? null,
    viewFieldIds: [],
    viewFilterIds: [],
    viewGroupIds: [],
    applicationId: workspaceCustomApplicationId,
  };
};
