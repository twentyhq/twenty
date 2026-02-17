import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { STANDARD_RECORD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardRecordPageLayoutConfig } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';
import { computeMyFirstDashboardWidgets } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-widget/compute-my-first-dashboard-widgets.util';
import {
  type CreateStandardPageLayoutWidgetArgs,
  type CreateStandardPageLayoutWidgetContext,
  createStandardPageLayoutWidgetFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-widget/create-standard-page-layout-widget-flat-metadata.util';
import { findObjectNameByUniversalIdentifier } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout/create-standard-page-layout-flat-metadata.util';

export type BuildStandardFlatPageLayoutWidgetMetadataMapsArgs = Omit<
  CreateStandardPageLayoutWidgetArgs,
  'context'
> & {
  shouldIncludeRecordPageLayouts?: boolean;
};

const RECORD_PAGE_LAYOUT_WIDGET_TYPES = [
  WidgetType.FIELDS,
  WidgetType.FIELD,
  WidgetType.STANDALONE_RICH_TEXT,
  WidgetType.TIMELINE,
  WidgetType.TASKS,
  WidgetType.NOTES,
  WidgetType.FILES,
  WidgetType.EMAILS,
  WidgetType.CALENDAR,
  WidgetType.FIELD_RICH_TEXT,
  WidgetType.WORKFLOW,
  WidgetType.WORKFLOW_VERSION,
  WidgetType.WORKFLOW_RUN,
];

const WIDGET_TYPE_TO_CONFIGURATION_TYPE: Partial<
  Record<WidgetType, WidgetConfigurationType>
> = {
  [WidgetType.FIELDS]: WidgetConfigurationType.FIELDS,
  [WidgetType.FIELD]: WidgetConfigurationType.FIELD,
  [WidgetType.STANDALONE_RICH_TEXT]:
    WidgetConfigurationType.STANDALONE_RICH_TEXT,
  [WidgetType.TIMELINE]: WidgetConfigurationType.TIMELINE,
  [WidgetType.TASKS]: WidgetConfigurationType.TASKS,
  [WidgetType.NOTES]: WidgetConfigurationType.NOTES,
  [WidgetType.FILES]: WidgetConfigurationType.FILES,
  [WidgetType.EMAILS]: WidgetConfigurationType.EMAILS,
  [WidgetType.CALENDAR]: WidgetConfigurationType.CALENDAR,
  [WidgetType.FIELD_RICH_TEXT]: WidgetConfigurationType.FIELD_RICH_TEXT,
  [WidgetType.WORKFLOW]: WidgetConfigurationType.WORKFLOW,
  [WidgetType.WORKFLOW_VERSION]: WidgetConfigurationType.WORKFLOW_VERSION,
  [WidgetType.WORKFLOW_RUN]: WidgetConfigurationType.WORKFLOW_RUN,
};

const RECORD_PAGE_FIELDS_VIEW_NAME_BY_OBJECT: Partial<
  Record<AllStandardObjectName, string>
> = {
  company: 'companyRecordPageFields',
  person: 'personRecordPageFields',
  opportunity: 'opportunityRecordPageFields',
  task: 'taskRecordPageFields',
  note: 'noteRecordPageFields',
  workflowRun: 'workflowRunRecordPageFields',
  workflowVersion: 'workflowVersionRecordPageFields',
};

const buildRecordPageWidgetConfigurations = ({
  widgetType,
  layoutObjectName,
  standardObjectMetadataRelatedEntityIds,
}: {
  widgetType: WidgetType;
  layoutObjectName: AllStandardObjectName | null;
  standardObjectMetadataRelatedEntityIds: BuildStandardFlatPageLayoutWidgetMetadataMapsArgs['standardObjectMetadataRelatedEntityIds'];
}): {
  configuration: AllPageLayoutWidgetConfiguration;
  universalConfiguration: CreateStandardPageLayoutWidgetContext['universalConfiguration'];
} => {
  if (widgetType === WidgetType.FIELDS && isDefined(layoutObjectName)) {
    return buildFieldsWidgetConfiguration({
      objectName: layoutObjectName,
      standardObjectMetadataRelatedEntityIds,
    });
  }

  const configurationType = WIDGET_TYPE_TO_CONFIGURATION_TYPE[widgetType];

  if (!configurationType) {
    throw new Error(
      `No configuration type mapping for widget type ${widgetType}`,
    );
  }

  const baseConfig = { configurationType };

  return {
    // @ts-expect-error ignore - configurationType is validated but TS can't match to discriminated union
    configuration: baseConfig,
    // @ts-expect-error ignore - we'd need to implement for each widget type (including unused GRAPH type) to be able to match to the discriminated union
    universalConfiguration: baseConfig,
  };
};

const buildFieldsWidgetConfiguration = ({
  objectName,
  standardObjectMetadataRelatedEntityIds,
}: {
  objectName: AllStandardObjectName;
  standardObjectMetadataRelatedEntityIds: BuildStandardFlatPageLayoutWidgetMetadataMapsArgs['standardObjectMetadataRelatedEntityIds'];
}): {
  configuration: AllPageLayoutWidgetConfiguration;
  universalConfiguration: CreateStandardPageLayoutWidgetContext['universalConfiguration'];
} => {
  const recordPageFieldsViewName =
    RECORD_PAGE_FIELDS_VIEW_NAME_BY_OBJECT[objectName];

  if (!recordPageFieldsViewName) {
    return {
      configuration: {
        configurationType: WidgetConfigurationType.FIELDS,
        viewId: null,
      },
      universalConfiguration: {
        configurationType: WidgetConfigurationType.FIELDS,
        viewId: null,
      },
    };
  }

  const views = standardObjectMetadataRelatedEntityIds[objectName]
    .views as Record<string, { id: string }>;

  const viewId = views[recordPageFieldsViewName]?.id ?? null;

  // @ts-expect-error ignore
  const viewDefinition = STANDARD_OBJECTS[objectName].views?.[
    recordPageFieldsViewName
  ] as { universalIdentifier: string } | undefined;

  const viewUniversalIdentifier = viewDefinition?.universalIdentifier ?? null;

  return {
    configuration: {
      configurationType: WidgetConfigurationType.FIELDS,
      viewId,
    },
    universalConfiguration: {
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: viewUniversalIdentifier,
    },
  };
};

const computeRecordPageWidgets = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  standardObjectMetadataRelatedEntityIds,
  standardPageLayoutMetadataRelatedEntityIds,
}: BuildStandardFlatPageLayoutWidgetMetadataMapsArgs): FlatPageLayoutWidget[] => {
  const allWidgets: FlatPageLayoutWidget[] = [];

  for (const layoutName of Object.keys(STANDARD_RECORD_PAGE_LAYOUTS)) {
    const layout = STANDARD_RECORD_PAGE_LAYOUTS[
      layoutName as keyof typeof STANDARD_RECORD_PAGE_LAYOUTS
    ] as StandardRecordPageLayoutConfig;

    let layoutObjectMetadataId: string | null = null;
    let layoutObjectName: AllStandardObjectName | null = null;

    if (layout.objectUniversalIdentifier) {
      const objectName = findObjectNameByUniversalIdentifier(
        layout.objectUniversalIdentifier,
      ) as AllStandardObjectName;

      layoutObjectName = objectName;
      layoutObjectMetadataId =
        standardObjectMetadataRelatedEntityIds[objectName]?.id ?? null;
    }

    for (const tabTitle of Object.keys(layout.tabs)) {
      const tab = layout.tabs[tabTitle];

      for (const widgetName of Object.keys(tab.widgets)) {
        const widget = tab.widgets[widgetName];

        const isRecordPageWidget = RECORD_PAGE_LAYOUT_WIDGET_TYPES.includes(
          widget.type,
        );

        const objectMetadataId = isRecordPageWidget
          ? layoutObjectMetadataId
          : null;

        const objectMetadataUniversalIdentifier = isRecordPageWidget
          ? (layout.objectUniversalIdentifier ?? null)
          : null;

        const { configuration, universalConfiguration } =
          buildRecordPageWidgetConfigurations({
            widgetType: widget.type,
            layoutObjectName,
            standardObjectMetadataRelatedEntityIds,
          });

        allWidgets.push(
          createStandardPageLayoutWidgetFlatMetadata({
            now,
            workspaceId,
            twentyStandardApplicationId,
            standardObjectMetadataRelatedEntityIds,
            standardPageLayoutMetadataRelatedEntityIds,
            objectMetadataUniversalIdentifier,
            context: {
              layoutName,
              tabTitle,
              widgetName,
              title: widget.title,
              type: widget.type,
              gridPosition: widget.gridPosition,
              position: widget.position ?? null,
              configuration,
              universalConfiguration,
              objectMetadataId,
              conditionalDisplay: widget.conditionalDisplay ?? null,
            },
          }),
        );
      }
    }
  }

  return allWidgets;
};

export const buildStandardFlatPageLayoutWidgetMetadataMaps = (
  args: BuildStandardFlatPageLayoutWidgetMetadataMapsArgs,
): FlatEntityMaps<FlatPageLayoutWidget> => {
  const allWidgetMetadatas: FlatPageLayoutWidget[] = [
    ...computeMyFirstDashboardWidgets(args),
    ...(args.shouldIncludeRecordPageLayouts
      ? computeRecordPageWidgets(args)
      : []),
  ];

  let flatPageLayoutWidgetMaps = createEmptyFlatEntityMaps();

  for (const widgetMetadata of allWidgetMetadatas) {
    flatPageLayoutWidgetMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: widgetMetadata,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });
  }

  return flatPageLayoutWidgetMaps;
};
