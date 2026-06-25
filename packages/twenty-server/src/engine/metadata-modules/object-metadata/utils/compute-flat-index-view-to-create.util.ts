import { getIndexViewUniversalIdentifier } from 'twenty-shared/application';
import {
  ViewKey,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const computeFlatIndexViewToCreate = ({
  objectMetadata,
  flatApplication,
}: {
  objectMetadata: UniversalFlatObjectMetadata;
  flatApplication: FlatApplication;
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
    calendarLayout: null,
    isCompact: false,
    shouldHideEmptyGroups: false,
    kanbanColumnWidth: null,
    kanbanAggregateOperation: null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
    mainGroupByFieldMetadataUniversalIdentifier: null,
    openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    position: 0,
    universalIdentifier: getIndexViewUniversalIdentifier({
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      objectUniversalIdentifier: objectMetadata.universalIdentifier,
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
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
