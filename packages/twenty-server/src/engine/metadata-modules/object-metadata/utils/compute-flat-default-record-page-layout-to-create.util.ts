import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export const computeFlatDefaultRecordPageLayoutToCreate = ({
  objectMetadata,
  flatApplication,
  recordPageFieldsView,
  workspaceId,
}: {
  flatApplication: FlatApplication;
  objectMetadata: UniversalFlatObjectMetadata & { id: string };
  recordPageFieldsView: UniversalFlatView & { id: string };
  workspaceId: string;
}): {
  pageLayouts: FlatPageLayout[];
  pageLayoutTabs: FlatPageLayoutTab[];
  pageLayoutWidgets: FlatPageLayoutWidget[];
} => {
  const now = new Date().toISOString();
  const pageLayoutId = v4();
  const pageLayoutUniversalIdentifier = v4();

  const tabDefinitions = [
    { key: 'home' as const, widgetKey: 'fields' as const },
    { key: 'timeline' as const, widgetKey: 'timeline' as const },
    { key: 'tasks' as const, widgetKey: 'tasks' as const },
    { key: 'notes' as const, widgetKey: 'notes' as const },
    { key: 'files' as const, widgetKey: 'files' as const },
    { key: 'emails' as const, widgetKey: 'emails' as const },
    { key: 'calendar' as const, widgetKey: 'calendar' as const },
  ];

  const pageLayoutTabs: FlatPageLayoutTab[] = [];
  const pageLayoutWidgets: FlatPageLayoutWidget[] = [];

  for (const { key, widgetKey } of tabDefinitions) {
    const tabProps = TAB_PROPS[key];
    const widgetProps = WIDGET_PROPS[widgetKey];
    const tabId = v4();
    const tabUniversalIdentifier = v4();
    const widgetId = v4();
    const widgetUniversalIdentifier = v4();

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
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      icon: tabProps.icon,
      layoutMode: tabProps.layoutMode,
      overrides: null,
    });

    const isFieldsWidget = widgetKey === 'fields';

    const configuration = isFieldsWidget
      ? {
          configurationType: WidgetConfigurationType.FIELDS,
          viewId: recordPageFieldsView.id,
        }
      : {
          configurationType:
            WidgetConfigurationType[
              widgetKey.toUpperCase() as keyof typeof WidgetConfigurationType
            ],
        };

    const universalConfiguration = isFieldsWidget
      ? {
          configurationType: WidgetConfigurationType.FIELDS,
          viewId: recordPageFieldsView.universalIdentifier,
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
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      conditionalDisplay: null,
      overrides: null,
    });
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
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    defaultTabToFocusOnMobileAndSidePanelId: null,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
  };

  return { pageLayouts: [pageLayout], pageLayoutTabs, pageLayoutWidgets };
};
