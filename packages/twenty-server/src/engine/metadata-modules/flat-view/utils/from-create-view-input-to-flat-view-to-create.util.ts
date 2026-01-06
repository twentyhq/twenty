import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { computeFlatViewGroupsOnViewCreate } from 'src/engine/metadata-modules/flat-view-group/utils/compute-flat-view-groups-on-view-create.util';
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
  flatFieldMetadataMaps,
}: {
  createViewInput: CreateViewInput;
  workspaceId: string;
  createdByUserWorkspaceId?: string;
  workspaceCustomApplicationId: string;
  flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
}): {
  flatViewToCreate: FlatView;
  flatViewGroupsToCreate: FlatViewGroup[];
} => {
  const { objectMetadataId, ...createViewInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewInput,
      ['id', 'name', 'objectMetadataId'],
    );

  const createdAt = new Date().toISOString();
  const viewId = createViewInput.id ?? v4();

  const flatViewToCreate = {
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
    shouldHideEmptyGroups: createViewInput.shouldHideEmptyGroups ?? false,
    kanbanAggregateOperation: createViewInput.kanbanAggregateOperation ?? null,
    kanbanAggregateOperationFieldMetadataId:
      createViewInput.kanbanAggregateOperationFieldMetadataId ?? null,
    mainGroupByFieldMetadataId:
      createViewInput.mainGroupByFieldMetadataId ?? null,
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
    viewFilterGroupIds: [],
    applicationId: workspaceCustomApplicationId,
  };

  let flatViewGroupsToCreate: FlatViewGroup[] = [];

  if (isDefined(flatViewToCreate.mainGroupByFieldMetadataId)) {
    flatViewGroupsToCreate = computeFlatViewGroupsOnViewCreate({
      flatViewToCreateId: flatViewToCreate.id,
      mainGroupByFieldMetadataId: flatViewToCreate.mainGroupByFieldMetadataId,
      flatFieldMetadataMaps,
    });
  }

  return {
    flatViewToCreate,
    flatViewGroupsToCreate,
  };
};
