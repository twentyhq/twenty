import {
  getPageLayoutTabUniversalIdentifier,
  getPageLayoutWidgetUniversalIdentifier,
  getRecordPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { computeFlatRecordPageFieldsViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-record-page-fields-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const computeFlatDefaultRecordPageLayoutToCreate = ({
  objectMetadata,
  flatApplication,
  objectFlatFieldMetadatas,
  labelIdentifierFieldMetadataUniversalIdentifier,
  workspaceId,
}: {
  flatApplication: FlatApplication;
  objectMetadata: UniversalFlatObjectMetadata & { id: string };
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  workspaceId: string;
}): {
  pageLayouts: FlatPageLayout[];
  pageLayoutTabs: FlatPageLayoutTab[];
  pageLayoutWidgets: FlatPageLayoutWidget[];
  recordPageFieldsView: UniversalFlatView & { id: string };
  recordPageFieldsViewFields: UniversalFlatViewField[];
} => {
  const now = new Date().toISOString();
  const pageLayoutId = v4();
  const pageLayoutUniversalIdentifier = getRecordPageLayoutUniversalIdentifier({
    ownerApplicationUniversalIdentifier: flatApplication.universalIdentifier,
    objectUniversalIdentifier: objectMetadata.universalIdentifier,
  });

  const tabDefinitions = [
    { key: 'home' as const, widgetKey: 'fields' as const },
    { key: 'timeline' as const, widgetKey: 'timeline' as const },
    { key: 'tasks' as const, widgetKey: 'tasks' as const },
    { key: 'notes' as const, widgetKey: 'notes' as const },
    { key: 'files' as const, widgetKey: 'files' as const },
  ];

  const pageLayoutTabs: FlatPageLayoutTab[] = [];
  const pageLayoutWidgets: FlatPageLayoutWidget[] = [];
  let recordPageFieldsView: (UniversalFlatView & { id: string }) | undefined;
  let recordPageFieldsViewFields: UniversalFlatViewField[] = [];

  for (const { key, widgetKey } of tabDefinitions) {
    const tabProps = TAB_PROPS[key];
    const widgetProps = WIDGET_PROPS[widgetKey];
    const tabId = v4();
    const tabUniversalIdentifier = getPageLayoutTabUniversalIdentifier({
      ownerApplicationUniversalIdentifier: flatApplication.universalIdentifier,
      pageLayoutUniversalIdentifier,
      title: tabProps.title,
    });
    const widgetId = v4();
    const widgetUniversalIdentifier = getPageLayoutWidgetUniversalIdentifier({
      ownerApplicationUniversalIdentifier: flatApplication.universalIdentifier,
      pageLayoutTabUniversalIdentifier: tabUniversalIdentifier,
      title: widgetProps.title,
    });

    pageLayoutTabs.push({
      id: tabId,
      universalIdentifier: tabUniversalIdentifier,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      workspaceId,
      title: tabProps.title,
      position: tabProps.position,
      pageLayoutId,
      pageLayoutUniversalIdentifier,
      widgetIds: [widgetId],
      widgetUniversalIdentifiers: [widgetUniversalIdentifier],
      isActive: true,
      isSystemSideEffect: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      icon: tabProps.icon,
      layoutMode: tabProps.layoutMode,
      overrides: null,
    });

    const isFieldsWidget = widgetKey === 'fields';

    if (isFieldsWidget) {
      recordPageFieldsView = computeFlatRecordPageFieldsViewToCreate({
        objectMetadata,
        flatApplication,
        pageLayoutWidgetUniversalIdentifier: widgetUniversalIdentifier,
      });
      recordPageFieldsViewFields = computeFlatViewFieldsToCreate({
        flatApplication,
        objectFlatFieldMetadatas,
        labelIdentifierFieldMetadataUniversalIdentifier,
        viewUniversalIdentifier: recordPageFieldsView.universalIdentifier,
        excludeLabelIdentifier: true,
      });
    }

    const configuration =
      isFieldsWidget && recordPageFieldsView
        ? {
            configurationType: WidgetConfigurationType.FIELDS,
            viewId: recordPageFieldsView.id,
            newFieldDefaultVisibility: true,
          }
        : {
            configurationType:
              WidgetConfigurationType[
                widgetKey.toUpperCase() as keyof typeof WidgetConfigurationType
              ],
          };

    const universalConfiguration =
      isFieldsWidget && recordPageFieldsView
        ? {
            configurationType: WidgetConfigurationType.FIELDS,
            viewUniversalIdentifier: recordPageFieldsView.universalIdentifier,
            newFieldDefaultVisibility: true,
          }
        : {
            configurationType:
              WidgetConfigurationType[
                widgetKey.toUpperCase() as keyof typeof WidgetConfigurationType
              ],
          };

    pageLayoutWidgets.push({
      id: widgetId,
      universalIdentifier: widgetUniversalIdentifier,
      applicationId: flatApplication.id,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
      workspaceId,
      pageLayoutTabId: tabId,
      pageLayoutTabUniversalIdentifier: tabUniversalIdentifier,
      title: widgetProps.title,
      type: widgetProps.type,
      gridPosition: widgetProps.gridPosition,
      position: widgetProps.position,
      // @ts-expect-error - configurationType is validated but TS can't match to discriminated union
      configuration,
      // @ts-expect-error - configurationType is validated but TS can't match to discriminated union
      universalConfiguration,
      objectMetadataId: objectMetadata.id,
      objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
      isActive: true,
      isSystemSideEffect: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      conditionalDisplay: null,
      overrides: null,
    });
  }

  if (!recordPageFieldsView) {
    throw new Error(
      'Record page fields widget is missing from the default record page layout',
    );
  }

  const pageLayout: FlatPageLayout = {
    id: pageLayoutId,
    universalIdentifier: pageLayoutUniversalIdentifier,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    workspaceId,
    name: `Default ${objectMetadata.labelSingular} Layout`,
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataId: objectMetadata.id,
    objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    tabIds: pageLayoutTabs.map((tab) => tab.id),
    tabUniversalIdentifiers: pageLayoutTabs.map(
      (tab) => tab.universalIdentifier,
    ),
    isSystemSideEffect: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    defaultTabToFocusOnMobileAndSidePanelId: null,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
  };

  return {
    pageLayouts: [pageLayout],
    pageLayoutTabs,
    pageLayoutWidgets,
    recordPageFieldsView,
    recordPageFieldsViewFields,
  };
};
