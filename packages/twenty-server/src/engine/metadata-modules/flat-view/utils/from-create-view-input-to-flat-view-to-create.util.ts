import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { computeFlatViewGroupsOnViewCreate } from 'src/engine/metadata-modules/flat-view-group/utils/compute-flat-view-groups-on-view-create.util';
import { type CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const fromCreateViewInputToFlatViewToCreate = ({
  createViewInput: rawCreateViewInput,
  createdByUserWorkspaceId,
  flatApplication,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  createViewInput: CreateViewInput;
  createdByUserWorkspaceId?: string;
  flatApplication: FlatApplication;
  flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
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

  const createdAt = new Date().toISOString();
  const viewId = createViewInput.id ?? v4();

  const {
    objectMetadataUniversalIdentifier,
    calendarFieldMetadataUniversalIdentifier,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    mainGroupByFieldMetadataUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'view',
    foreignKeyValues: {
      objectMetadataId,
      calendarFieldMetadataId: createViewInput.calendarFieldMetadataId,
      kanbanAggregateOperationFieldMetadataId:
        createViewInput.kanbanAggregateOperationFieldMetadataId,
      mainGroupByFieldMetadataId: createViewInput.mainGroupByFieldMetadataId,
    },
    flatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
  });

  const mainGroupByFieldMetadataId =
    createViewInput.mainGroupByFieldMetadataId ?? null;

  const flatViewToCreate: UniversalFlatView & { id: string } = {
    id: viewId,
    objectMetadataUniversalIdentifier,
    name: createViewInput.name,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    isCustom: true,
    anyFieldFilterValue: createViewInput.anyFieldFilterValue ?? null,
    calendarFieldMetadataUniversalIdentifier,
    calendarLayout: createViewInput.calendarLayout ?? null,
    icon: createViewInput.icon,
    isCompact: createViewInput.isCompact ?? false,
    shouldHideEmptyGroups: createViewInput.shouldHideEmptyGroups ?? false,
    kanbanAggregateOperation: createViewInput.kanbanAggregateOperation ?? null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier,
    mainGroupByFieldMetadataUniversalIdentifier,
    key: createViewInput.key ?? null,
    openRecordIn: createViewInput.openRecordIn ?? ViewOpenRecordIn.SIDE_PANEL,
    position: createViewInput.position ?? 0,
    type: createViewInput.type ?? ViewType.TABLE,
    universalIdentifier: createViewInput.universalIdentifier ?? v4(),
    visibility: createViewInput.visibility ?? ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: createdByUserWorkspaceId ?? null,
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    viewGroupUniversalIdentifiers: [],
    viewFilterGroupUniversalIdentifiers: [],
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };

  let flatViewGroupsToCreate: UniversalFlatViewGroup[] = [];

  if (isDefined(mainGroupByFieldMetadataId)) {
    flatViewGroupsToCreate = computeFlatViewGroupsOnViewCreate({
      flatViewToCreateUniversalIdentifier: flatViewToCreate.universalIdentifier,
      mainGroupByFieldMetadataId,
      flatFieldMetadataMaps,
    });
  }

  return {
    flatViewToCreate,
    flatViewGroupsToCreate,
  };
};
