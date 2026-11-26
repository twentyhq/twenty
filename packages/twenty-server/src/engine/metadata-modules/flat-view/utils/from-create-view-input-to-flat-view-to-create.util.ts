import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';
import {
  isDefined,
  isViewCompactByDefault,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { ViewOpenRecordIn, ViewType } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { computeFlatViewGroupsOnViewCreate } from 'src/engine/metadata-modules/flat-view-group/utils/compute-flat-view-groups-on-view-create.util';
import { validateViewGroupLoadLimitOrThrow } from 'src/engine/metadata-modules/flat-view/utils/validate-view-group-load-limit-or-throw.util';
import { type CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const fromCreateViewInputToFlatViewToCreate = ({
  createViewInput: rawCreateViewInput,
  createdByUserWorkspaceId,
  flatApplication,
  flatFieldMetadataMaps,
  flatFieldMetadataOptionMaps,
  flatObjectMetadataMaps,
}: {
  createViewInput: CreateViewInput;
  createdByUserWorkspaceId?: string;
  flatApplication: FlatApplication;
  flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  flatFieldMetadataOptionMaps: AllFlatEntityMaps['flatFieldMetadataOptionMaps'];
  flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
}): {
  flatViewToCreate: UniversalFlatView & { id: string };
  flatViewGroupsToCreate: UniversalFlatViewGroup[];
} => {
  const { objectMetadataId, ...createViewInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewInput,
      ['id', 'name', 'objectMetadataId'],
    );

  validateViewGroupLoadLimitOrThrow(createViewInput.groupLoadLimit);

  const createdAt = new Date().toISOString();
  const viewId = createViewInput.id ?? v4();

  const {
    objectMetadataUniversalIdentifier,
    calendarFieldMetadataUniversalIdentifier,
    calendarEndFieldMetadataUniversalIdentifier,
    listDateFieldMetadataUniversalIdentifier,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    mainGroupByFieldMetadataUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'view',
    foreignKeyValues: {
      objectMetadataId,
      calendarFieldMetadataId: createViewInput.calendarFieldMetadataId,
      calendarEndFieldMetadataId: createViewInput.calendarEndFieldMetadataId,
      listDateFieldMetadataId: createViewInput.listDateFieldMetadataId,
      kanbanAggregateOperationFieldMetadataId:
        createViewInput.kanbanAggregateOperationFieldMetadataId,
      mainGroupByFieldMetadataId: createViewInput.mainGroupByFieldMetadataId,
    },
    flatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
  });

  const mainGroupByFieldMetadataId =
    createViewInput.mainGroupByFieldMetadataId ?? null;
  const viewType = createViewInput.type ?? ViewType.TABLE;

  const flatViewToCreate: UniversalFlatView & { id: string } = {
    id: viewId,
    objectMetadataUniversalIdentifier,
    name: createViewInput.name,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    anyFieldFilterValue: createViewInput.anyFieldFilterValue ?? null,
    presetFilter: createViewInput.presetFilter ?? null,
    calendarFieldMetadataUniversalIdentifier,
    calendarEndFieldMetadataUniversalIdentifier,
    listDateFieldMetadataUniversalIdentifier,
    calendarLayout: createViewInput.calendarLayout ?? null,
    icon: createViewInput.icon,
    isCompact: createViewInput.isCompact ?? isViewCompactByDefault(viewType),
    shouldHideEmptyGroups: createViewInput.shouldHideEmptyGroups ?? false,
    shouldDisplayGroupsAsTabs:
      createViewInput.shouldDisplayGroupsAsTabs ?? false,
    kanbanColumnWidth: createViewInput.kanbanColumnWidth ?? null,
    groupLoadLimit:
      createViewInput.groupLoadLimit ?? DEFAULT_VIEW_GROUP_LOAD_LIMIT,
    kanbanAggregateOperation: createViewInput.kanbanAggregateOperation ?? null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    mainGroupByFieldMetadataUniversalIdentifier,
    key: createViewInput.key ?? null,
    openRecordIn: createViewInput.openRecordIn ?? ViewOpenRecordIn.SIDE_PANEL,
    position: createViewInput.position ?? 0,
    type: viewType,
    universalIdentifier: createViewInput.universalIdentifier ?? v4(),
    isPrivate: createViewInput.isPrivate ?? false,
    createdByUserWorkspaceId: createdByUserWorkspaceId ?? null,
    isActive: true,
    isSystemSideEffect: false,
    universalOverrides: null,
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    viewGroupUniversalIdentifiers: [],
    viewFieldGroupUniversalIdentifiers: [],
    viewFilterGroupUniversalIdentifiers: [],
    navigationMenuItemUniversalIdentifiers: [],
    viewSortUniversalIdentifiers: [],
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };

  let flatViewGroupsToCreate: UniversalFlatViewGroup[] = [];

  if (isDefined(mainGroupByFieldMetadataId)) {
    flatViewGroupsToCreate = computeFlatViewGroupsOnViewCreate({
      flatViewToCreateUniversalIdentifier: flatViewToCreate.universalIdentifier,
      mainGroupByFieldMetadataId,
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
    });
  }

  return {
    flatViewToCreate,
    flatViewGroupsToCreate,
  };
};
