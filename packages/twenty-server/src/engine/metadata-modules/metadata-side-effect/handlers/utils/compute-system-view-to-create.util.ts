import {
  FIELDS_WIDGET_SYSTEM_VIEW_KEY,
  getSystemViewUniversalIdentifier,
  type SystemViewKey,
} from 'twenty-shared/application';
import {
  ViewKey,
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

type SystemViewObjectMetadata = Pick<
  UniversalFlatObjectMetadata,
  'universalIdentifier' | 'labelSingular'
>;

// The INDEX view name is a template resolved at display time; the record-page
// view name is materialized at creation.
const SYSTEM_VIEW_PROPERTIES_BY_VIEW_KEY = {
  [ViewKey.INDEX]: {
    type: ViewType.TABLE,
    computeName: () => 'All {objectLabelPlural}',
  },
  [FIELDS_WIDGET_SYSTEM_VIEW_KEY]: {
    type: ViewType.FIELDS_WIDGET,
    computeName: (objectMetadata: SystemViewObjectMetadata) =>
      `${objectMetadata.labelSingular} Record Page Fields`,
  },
} as const satisfies Record<
  SystemViewKey,
  {
    type: ViewType;
    computeName: (objectMetadata: SystemViewObjectMetadata) => string;
  }
>;

export const computeSystemViewToCreate = ({
  objectMetadata,
  applicationUniversalIdentifier,
  viewKey,
}: {
  applicationUniversalIdentifier: string;
  objectMetadata: SystemViewObjectMetadata;
  viewKey: SystemViewKey;
}): UniversalFlatView & { id: string } => {
  const { type, computeName } = SYSTEM_VIEW_PROPERTIES_BY_VIEW_KEY[viewKey];
  const createdAt = new Date().toISOString();

  return {
    id: v4(),
    objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    name: computeName(objectMetadata),
    // Only INDEX is a persisted key; FIELDS_WIDGET exists solely in the
    // universal identifier derivation.
    key: viewKey === ViewKey.INDEX ? viewKey : null,
    icon: 'IconList',
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
    position: 0,
    universalIdentifier: getSystemViewUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadata.universalIdentifier,
      viewKey,
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
