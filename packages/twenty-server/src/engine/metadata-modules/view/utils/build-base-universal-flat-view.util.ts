import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';
import { ViewOpenRecordIn } from 'twenty-shared/types';
import { isViewCompactByDefault } from 'twenty-shared/utils';
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
    anyFieldFilterValue: null,
    presetFilter: null,
    calendarFieldMetadataUniversalIdentifier: null,
    calendarEndFieldMetadataUniversalIdentifier: null,
    listPinnedFieldMetadataUniversalIdentifier: null,
    calendarLayout: null,
    isCompact: isViewCompactByDefault(type),
    shouldHideEmptyGroups: false,
    shouldDisplayGroupsAsTabs: false,
    kanbanColumnWidth: null,
    groupLoadLimit: DEFAULT_VIEW_GROUP_LOAD_LIMIT,
    kanbanAggregateOperation: null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
    mainGroupByFieldMetadataUniversalIdentifier: null,
    openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    position,
    universalIdentifier,
    isPrivate: false,
    createdByUserWorkspaceId: null,
    isActive: true,
    isSystemSideEffect,
    universalOverrides: null,
    viewFieldUniversalIdentifiers: [],
    viewFieldGroupUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    viewGroupUniversalIdentifiers: [],
    viewFilterGroupUniversalIdentifiers: [],
    navigationMenuItemUniversalIdentifiers: [],
    viewSortUniversalIdentifiers: [],
    applicationUniversalIdentifier,
  };
};
