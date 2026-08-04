import {
  getPageLayoutTabUniversalIdentifier,
  getPageLayoutWidgetUniversalIdentifier,
  getRecordPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';

const DEFAULT_RECORD_PAGE_TAB_DEFINITIONS = [
  { key: 'home', widgetKey: 'fields' },
  { key: 'timeline', widgetKey: 'timeline' },
  { key: 'tasks', widgetKey: 'tasks' },
  { key: 'notes', widgetKey: 'notes' },
  { key: 'files', widgetKey: 'files' },
] as const;

export const computeFlatDefaultRecordPageLayoutToCreate = ({
  objectMetadata,
  applicationUniversalIdentifier,
  recordPageFieldsViewUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  objectMetadata: Pick<
    UniversalFlatObjectMetadata,
    'universalIdentifier' | 'labelSingular'
  >;
  recordPageFieldsViewUniversalIdentifier: string;
}): {
  pageLayouts: UniversalFlatPageLayout[];
  pageLayoutTabs: UniversalFlatPageLayoutTab[];
  pageLayoutWidgets: UniversalFlatPageLayoutWidget[];
} => {
  const now = new Date().toISOString();
  const pageLayoutUniversalIdentifier = getRecordPageLayoutUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier: objectMetadata.universalIdentifier,
  });

  const pageLayoutTabs: UniversalFlatPageLayoutTab[] = [];
  const pageLayoutWidgets: UniversalFlatPageLayoutWidget[] = [];

  for (const { key, widgetKey } of DEFAULT_RECORD_PAGE_TAB_DEFINITIONS) {
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

    const universalConfiguration = isFieldsWidget
      ? {
          configurationType: WidgetConfigurationType.FIELDS,
          viewUniversalIdentifier: recordPageFieldsViewUniversalIdentifier,
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
      gridPosition: widgetProps.gridPosition,
      position: widgetProps.position,
      // @ts-expect-error - configurationType is validated but TS can't match to discriminated union
      universalConfiguration,
      objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
      isActive: true,
      isSystemSideEffect: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      conditionalDisplay: null,
      universalOverrides: null,
    });
  }

  const pageLayout: UniversalFlatPageLayout = {
    universalIdentifier: pageLayoutUniversalIdentifier,
    applicationUniversalIdentifier,
    name: `Default ${objectMetadata.labelSingular} Layout`,
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    tabUniversalIdentifiers: pageLayoutTabs.map(
      (tab) => tab.universalIdentifier,
    ),
    isSystemSideEffect: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
  };

  return { pageLayouts: [pageLayout], pageLayoutTabs, pageLayoutWidgets };
};
