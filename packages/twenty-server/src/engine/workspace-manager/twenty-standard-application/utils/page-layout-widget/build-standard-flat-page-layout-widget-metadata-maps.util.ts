import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { STANDARD_RECORD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type StandardRecordPageLayoutConfig } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';
import { computeMyFirstDashboardWidgets } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-widget/compute-my-first-dashboard-widgets.util';
import {
  type CreateStandardPageLayoutWidgetArgs,
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

    if (layout.objectUniversalIdentifier) {
      const objectName = findObjectNameByUniversalIdentifier(
        layout.objectUniversalIdentifier,
      );

      if (objectName) {
        layoutObjectMetadataId =
          standardObjectMetadataRelatedEntityIds[
            objectName as keyof typeof standardObjectMetadataRelatedEntityIds
          ]?.id ?? null;
      }
    }

    for (const tabTitle of Object.keys(layout.tabs)) {
      const tab = layout.tabs[tabTitle];

      for (const widgetName of Object.keys(tab.widgets)) {
        const widget = tab.widgets[widgetName];

        const objectMetadataId = RECORD_PAGE_LAYOUT_WIDGET_TYPES.includes(
          widget.type,
        )
          ? layoutObjectMetadataId
          : null;

        const objectMetadataUniversalIdentifier =
          RECORD_PAGE_LAYOUT_WIDGET_TYPES.includes(widget.type)
            ? (layout.objectUniversalIdentifier ?? null)
            : null;

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
              configuration: {
                configurationType: WidgetConfigurationType.FIELDS,
              },
              universalConfiguration: {
                configurationType: WidgetConfigurationType.FIELDS,
              },
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
