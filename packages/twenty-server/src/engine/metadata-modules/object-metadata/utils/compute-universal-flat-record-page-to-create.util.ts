import {
  getFieldsWidgetViewUniversalIdentifier,
  getPageLayoutTabUniversalIdentifier,
  getPageLayoutWidgetUniversalIdentifier,
  getRecordPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

const RECORD_PAGE_TAB_DEFINITIONS = [
  { key: 'home', widgetKey: 'fields' },
  { key: 'timeline', widgetKey: 'timeline' },
  { key: 'tasks', widgetKey: 'tasks' },
  { key: 'notes', widgetKey: 'notes' },
  { key: 'files', widgetKey: 'files' },
] as const;

export const computeUniversalFlatRecordPageToCreate = ({
  flatObjectMetadata,
  objectFlatFieldMetadatas,
  flatApplication,
  now,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  flatApplication: FlatApplication;
  now: string;
}): {
  view: UniversalFlatView & { id: string };
  viewFields: UniversalFlatViewField[];
  pageLayout: UniversalFlatPageLayout;
  pageLayoutTabs: UniversalFlatPageLayoutTab[];
  pageLayoutWidgets: UniversalFlatPageLayoutWidget[];
} => {
  const applicationUniversalIdentifier = flatApplication.universalIdentifier;
  const objectUniversalIdentifier = flatObjectMetadata.universalIdentifier;

  const pageLayoutUniversalIdentifier = getRecordPageLayoutUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier,
  });

  const homeTabUniversalIdentifier = getPageLayoutTabUniversalIdentifier({
    applicationUniversalIdentifier,
    pageLayoutUniversalIdentifier,
    title: TAB_PROPS.home.title,
  });

  const fieldsWidgetUniversalIdentifier =
    getPageLayoutWidgetUniversalIdentifier({
      applicationUniversalIdentifier,
      pageLayoutTabUniversalIdentifier: homeTabUniversalIdentifier,
      title: WIDGET_PROPS.fields.title,
    });

  const fieldsViewUniversalIdentifier = getFieldsWidgetViewUniversalIdentifier({
    applicationUniversalIdentifier,
    pageLayoutWidgetUniversalIdentifier: fieldsWidgetUniversalIdentifier,
  });

  const view: UniversalFlatView & { id: string } = {
    id: v4(),
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    name: `${flatObjectMetadata.labelSingular} Record Page Fields`,
    key: null,
    icon: 'IconList',
    type: ViewType.FIELDS_WIDGET,
    createdAt: now,
    updatedAt: now,
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
    universalIdentifier: fieldsViewUniversalIdentifier,
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

  const viewFields = computeFlatViewFieldsToCreate({
    flatApplication,
    objectFlatFieldMetadatas,
    labelIdentifierFieldMetadataUniversalIdentifier:
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
    viewUniversalIdentifier: fieldsViewUniversalIdentifier,
    excludeLabelIdentifier: true,
  });

  const pageLayoutTabs: UniversalFlatPageLayoutTab[] = [];
  const pageLayoutWidgets: UniversalFlatPageLayoutWidget[] = [];

  for (const { key, widgetKey } of RECORD_PAGE_TAB_DEFINITIONS) {
    const tabProps = TAB_PROPS[key];
    const widgetProps = WIDGET_PROPS[widgetKey];

    const tabUniversalIdentifier = getPageLayoutTabUniversalIdentifier({
      applicationUniversalIdentifier,
      pageLayoutUniversalIdentifier,
      title: tabProps.title,
    });
    const widgetUniversalIdentifier = getPageLayoutWidgetUniversalIdentifier({
      applicationUniversalIdentifier,
      pageLayoutTabUniversalIdentifier: tabUniversalIdentifier,
      title: widgetProps.title,
    });

    pageLayoutTabs.push({
      universalIdentifier: tabUniversalIdentifier,
      applicationUniversalIdentifier,
      title: tabProps.title,
      position: tabProps.position,
      pageLayoutUniversalIdentifier,
      icon: tabProps.icon,
      layoutMode: tabProps.layoutMode,
      isActive: true,
      isSystemSideEffect: true,
      widgetUniversalIdentifiers: [widgetUniversalIdentifier],
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      overrides: null,
    });

    const isFieldsWidget = widgetKey === 'fields';

    const universalConfiguration = isFieldsWidget
      ? {
          configurationType: WidgetConfigurationType.FIELDS,
          viewUniversalIdentifier: fieldsViewUniversalIdentifier,
          newFieldDefaultVisibility: true,
        }
      : {
          configurationType:
            WidgetConfigurationType[
              widgetKey.toUpperCase() as keyof typeof WidgetConfigurationType
            ],
        };

    pageLayoutWidgets.push({
      universalIdentifier: widgetUniversalIdentifier,
      applicationUniversalIdentifier,
      pageLayoutTabUniversalIdentifier: tabUniversalIdentifier,
      title: widgetProps.title,
      type: widgetProps.type,
      objectMetadataUniversalIdentifier: objectUniversalIdentifier,
      gridPosition: widgetProps.gridPosition,
      position: widgetProps.position,
      universalConfiguration:
        universalConfiguration as UniversalFlatPageLayoutWidget['universalConfiguration'],
      conditionalDisplay: null,
      conditionalAvailabilityExpression: null,
      isActive: true,
      isSystemSideEffect: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      universalOverrides: null,
    });
  }

  const pageLayout: UniversalFlatPageLayout = {
    universalIdentifier: pageLayoutUniversalIdentifier,
    applicationUniversalIdentifier,
    name: `Default ${flatObjectMetadata.labelSingular} Layout`,
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
    tabUniversalIdentifiers: pageLayoutTabs.map(
      (tab) => tab.universalIdentifier,
    ),
    isSystemSideEffect: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  return { view, viewFields, pageLayout, pageLayoutTabs, pageLayoutWidgets };
};
