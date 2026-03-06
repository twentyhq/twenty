import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const computeFlatRecordPageFieldsViewToCreate = ({
  objectMetadata,
  flatApplication,
}: {
  flatApplication: FlatApplication;
  objectMetadata: UniversalFlatObjectMetadata & { id: string };
}): UniversalFlatView & { id: string } => {
  const createdAt = new Date().toISOString();

  return {
    id: v4(),
    objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    name: `${objectMetadata.labelSingular} Record Page Fields`,
    key: null,
    icon: 'IconList',
    type: ViewType.FIELDS_WIDGET,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    isCustom: true,
    anyFieldFilterValue: null,
    calendarFieldMetadataUniversalIdentifier: null,
    calendarLayout: null,
    isCompact: false,
    shouldHideEmptyGroups: false,
    kanbanAggregateOperation: null,
    kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
    mainGroupByFieldMetadataUniversalIdentifier: null,
    openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
    position: 0,
    universalIdentifier: v4(),
    visibility: ViewVisibility.WORKSPACE,
    createdByUserWorkspaceId: null,
    viewFieldUniversalIdentifiers: [],
    viewFieldGroupUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    viewGroupUniversalIdentifiers: [],
    viewFilterGroupUniversalIdentifiers: [],
    viewSortUniversalIdentifiers: [],
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
