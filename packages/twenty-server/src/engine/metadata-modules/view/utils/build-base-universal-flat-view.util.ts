import { ViewOpenRecordIn, ViewVisibility } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const buildBaseUniversalFlatView = ({
  objectMetadataUniversalIdentifier,
  applicationUniversalIdentifier,
  universalIdentifier,
  name,
  key,
  icon,
  type,
  position,
  isSystemSideEffect,
}: Pick<
  UniversalFlatView,
  | 'objectMetadataUniversalIdentifier'
  | 'applicationUniversalIdentifier'
  | 'universalIdentifier'
  | 'name'
  | 'key'
  | 'icon'
  | 'type'
  | 'position'
  | 'isSystemSideEffect'
>): UniversalFlatView & { id: string } => {
  const createdAt = new Date().toISOString();

  return {
    id: v4(),
    objectMetadataUniversalIdentifier,
    name,
    key,
    icon,
    type,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    isCustom: true,
    anyFieldFilterValue: null,
    calendarFieldMetadataUniversalIdentifier: null,
    calendarEndFieldMetadataUniversalIdentifier: null,
    calendarLayout: null,
    isCompact: false,
    shouldHideEmptyGroups: false,
    kanbanColumnWidth: null,
    kanbanAggregateOperation: null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
    mainGroupByFieldMetadataUniversalIdentifier: null,
    openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    position,
    universalIdentifier,
    visibility: ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: null,
    isActive: true,
    isSystemSideEffect,
    universalOverrides: null,
    viewFieldUniversalIdentifiers: [],
    viewFieldGroupUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    viewGroupUniversalIdentifiers: [],
    viewFilterGroupUniversalIdentifiers: [],
    viewSortUniversalIdentifiers: [],
    applicationUniversalIdentifier,
  };
};
