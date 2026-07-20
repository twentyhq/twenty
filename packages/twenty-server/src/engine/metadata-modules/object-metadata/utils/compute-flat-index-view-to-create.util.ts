import { getSystemViewUniversalIdentifier } from 'twenty-shared/application';
import {
  ViewKey,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

// The INDEX view universal identifier is keyed on the object universal
// identifier + the singleton INDEX view key, so an object rename (with a pinned
// object universal identifier) keeps the same INDEX view identifier, and a user
// renaming the view never mutates its identity.
export const computeFlatIndexViewToCreate = ({
  objectMetadata,
  applicationUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectMetadata: Pick<UniversalFlatObjectMetadata, 'universalIdentifier'>;
}): UniversalFlatView & { id: string } => {
  const createdAt = new Date().toISOString();

  return {
    id: v4(),
    objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    name: `All {objectLabelPlural}`,
    key: ViewKey.INDEX,
    icon: 'IconList',
    type: ViewType.TABLE,
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
    position: 0,
    universalIdentifier: getSystemViewUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadata.universalIdentifier,
      viewKey: ViewKey.INDEX,
    }),
    visibility: ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: null,
    isActive: true,
    isSystemSideEffect: true,
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
