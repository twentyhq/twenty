import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
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
  flatApplication,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  createViewInput: CreateViewInput;
  workspaceId: string;
  createdByUserWorkspaceId?: string;
  flatApplication: FlatApplication;
  flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
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

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatObjectMetadataMaps,
    flatEntityId: objectMetadataId,
  });

  let calendarFieldMetadataUniversalIdentifier: string | null = null;

  if (isDefined(createViewInput.calendarFieldMetadataId)) {
    const flatCalendarFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow(
      {
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: createViewInput.calendarFieldMetadataId,
      },
    );

    calendarFieldMetadataUniversalIdentifier =
      flatCalendarFieldMetadata.universalIdentifier;
  }

  let kanbanAggregateOperationFieldMetadataUniversalIdentifier: string | null =
    null;

  if (isDefined(createViewInput.kanbanAggregateOperationFieldMetadataId)) {
    const flatKanbanFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: createViewInput.kanbanAggregateOperationFieldMetadataId,
    });

    kanbanAggregateOperationFieldMetadataUniversalIdentifier =
      flatKanbanFieldMetadata.universalIdentifier;
  }

  let mainGroupByFieldMetadataUniversalIdentifier: string | null = null;

  if (isDefined(createViewInput.mainGroupByFieldMetadataId)) {
    const flatMainGroupByFieldMetadata =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: createViewInput.mainGroupByFieldMetadataId,
      });

    mainGroupByFieldMetadataUniversalIdentifier =
      flatMainGroupByFieldMetadata.universalIdentifier;
  }

  const flatViewToCreate = {
    id: viewId,
    objectMetadataId,
    objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    workspaceId,
    name: createViewInput.name,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    isCustom: true,
    anyFieldFilterValue: createViewInput.anyFieldFilterValue ?? null,
    calendarFieldMetadataId: createViewInput.calendarFieldMetadataId ?? null,
    calendarFieldMetadataUniversalIdentifier,
    calendarLayout: createViewInput.calendarLayout ?? null,
    icon: createViewInput.icon,
    isCompact: createViewInput.isCompact ?? false,
    shouldHideEmptyGroups: createViewInput.shouldHideEmptyGroups ?? false,
    kanbanAggregateOperation: createViewInput.kanbanAggregateOperation ?? null,
    kanbanAggregateOperationFieldMetadataId:
      createViewInput.kanbanAggregateOperationFieldMetadataId ?? null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    mainGroupByFieldMetadataId:
      createViewInput.mainGroupByFieldMetadataId ?? null,
    mainGroupByFieldMetadataUniversalIdentifier,
    key: createViewInput.key ?? null,
    openRecordIn: createViewInput.openRecordIn ?? ViewOpenRecordIn.SIDE_PANEL,
    position: createViewInput.position ?? 0,
    type: createViewInput.type ?? ViewType.TABLE,
    universalIdentifier: createViewInput.universalIdentifier ?? v4(),
    visibility: createViewInput.visibility ?? ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: createdByUserWorkspaceId ?? null,
    viewFieldIds: [],
    viewFieldUniversalIdentifiers: [],
    viewFilterIds: [],
    viewFilterUniversalIdentifiers: [],
    viewGroupIds: [],
    viewGroupUniversalIdentifiers: [],
    viewFilterGroupIds: [],
    viewFilterGroupUniversalIdentifiers: [],
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
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
