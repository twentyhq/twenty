import { CalendarStartDay } from 'twenty-shared/constants';
import { v4 } from 'uuid';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { ObjectRecordGroupByDateGranularity } from 'src/engine/metadata-modules/page-layout-widget/enums/date-granularity.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type StandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type BuildStandardFlatPageLayoutWidgetMetadataMapsArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardObjectMetadataRelatedEntityIds: StandardObjectMetadataRelatedEntityIds;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
};

type WidgetDefinition = {
  id: string;
  universalIdentifier: string;
  pageLayoutTabId: string;
  title: string;
  type: WidgetType;
  gridPosition: GridPosition;
  configuration: AllPageLayoutWidgetConfiguration;
  objectMetadataId: string | null;
};

const createFilterConfig = (
  filters: Array<{
    type: string;
    label: string;
    value: string;
    displayValue: string;
    operand: string;
    fieldMetadataId: string;
  }>,
) => {
  const groupId = v4();

  return {
    recordFilters: filters.map((filter) => ({
      id: v4(),
      type: filter.type,
      label: filter.label,
      value: filter.value,
      displayValue: filter.displayValue,
      operand: filter.operand,
      fieldMetadataId: filter.fieldMetadataId,
      recordFilterGroupId: groupId,
    })),
    recordFilterGroups: [
      {
        id: groupId,
        logicalOperator: 'AND',
      },
    ],
  };
};

export const buildStandardFlatPageLayoutWidgetMetadataMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  standardObjectMetadataRelatedEntityIds,
  standardPageLayoutMetadataRelatedEntityIds,
}: BuildStandardFlatPageLayoutWidgetMetadataMapsArgs): FlatEntityMaps<FlatPageLayoutWidget> => {
  let flatPageLayoutWidgetMaps = createEmptyFlatEntityMaps();

  const layoutIds = standardPageLayoutMetadataRelatedEntityIds.revenueOverview;
  const layoutDef = STANDARD_PAGE_LAYOUTS.revenueOverview;

  const opportunityObjectId =
    standardObjectMetadataRelatedEntityIds.opportunity.id;
  const opportunityFields =
    standardObjectMetadataRelatedEntityIds.opportunity.fields;

  const tab1Id = layoutIds.tabs.tab1.id;
  const tab1Widgets = layoutIds.tabs.tab1.widgets;
  const tab1Def = layoutDef.tabs.tab1.widgets;

  const widgets: WidgetDefinition[] = [
    {
      id: tab1Widgets.welcomeRichText.id,
      universalIdentifier: tab1Def.welcomeRichText.universalIdentifier,
      pageLayoutTabId: tab1Id,
      title: 'Untitled Rich Text',
      type: WidgetType.STANDALONE_RICH_TEXT,
      gridPosition: { row: 0, column: 0, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType:
          WidgetConfigurationType.STANDALONE_RICH_TEXT as const,
        body: {
          blocknote: JSON.stringify([
            {
              id: v4(),
              type: 'heading',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
                level: 3,
              },
              content: [
                { type: 'text', text: 'Welcome to your workspace', styles: {} },
              ],
              children: [],
            },
            {
              id: v4(),
              type: 'paragraph',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
              content: [],
              children: [],
            },
            {
              id: v4(),
              type: 'paragraph',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
              content: [
                {
                  type: 'text',
                  text: 'You can edit this dashboard by clicking the ',
                  styles: {},
                },
                { type: 'text', text: 'Edit', styles: { code: true } },
                {
                  type: 'text',
                  text: ' button in the top-right corner to add your own charts or customize this one.',
                  styles: {},
                },
              ],
              children: [],
            },
            {
              id: v4(),
              type: 'paragraph',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
              content: [],
              children: [],
            },
            {
              id: v4(),
              type: 'paragraph',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
              content: [
                {
                  type: 'text',
                  text: "Don't forget to replace the sample data with your own.",
                  styles: {},
                },
              ],
              children: [],
            },
            {
              id: v4(),
              type: 'paragraph',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
              content: [],
              children: [],
            },
            {
              id: v4(),
              type: 'paragraph',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
              content: [
                {
                  type: 'text',
                  text: 'If you have any issues, you can check ',
                  styles: {},
                },
                {
                  type: 'link',
                  href: 'https://docs.twenty.com/user-guide/introduction',
                  content: [
                    { type: 'text', text: 'our documentation', styles: {} },
                  ],
                },
                {
                  type: 'text',
                  text: ' or contact us through the Support section in Settings.',
                  styles: {},
                },
              ],
              children: [],
            },
            {
              id: v4(),
              type: 'paragraph',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
              content: [],
              children: [],
            },
          ]),
          markdown: null,
        },
      },
      objectMetadataId: null,
    },

    {
      id: tab1Widgets.dealsByCompany.id,
      universalIdentifier: tab1Def.dealsByCompany.universalIdentifier,
      pageLayoutTabId: tab1Id,
      title: 'Deals by Company',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 6, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.PIE_CHART,
        groupByFieldMetadataId: opportunityFields.company.id,
        groupBySubFieldName: 'name',
        aggregateFieldMetadataId: opportunityFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        orderBy: GraphOrderBy.FIELD_ASC,
        displayDataLabel: false,
        showCenterMetric: true,
        displayLegend: true,
        color: 'orange',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: opportunityObjectId,
    },

    {
      id: tab1Widgets.pipelineValueByStage.id,
      universalIdentifier: tab1Def.pipelineValueByStage.universalIdentifier,
      pageLayoutTabId: tab1Id,
      title: 'Pipeline Value by Stage',
      type: WidgetType.GRAPH,
      gridPosition: { row: 6, column: 0, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: opportunityFields.amount.id,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: opportunityFields.stage.id,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_POSITION_ASC,
        secondaryAxisGroupByFieldMetadataId: opportunityFields.company.id,
        secondaryAxisGroupBySubFieldName: 'name',
        secondaryAxisGroupByDateGranularity:
          ObjectRecordGroupByDateGranularity.DAY,
        secondaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: true,
        displayLegend: true,
        color: 'green',
        layout: BarChartLayout.VERTICAL,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: opportunityObjectId,
    },

    {
      id: tab1Widgets.revenueTimeline.id,
      universalIdentifier: tab1Def.revenueTimeline.universalIdentifier,
      pageLayoutTabId: tab1Id,
      title: 'Revenue Timeline',
      type: WidgetType.GRAPH,
      gridPosition: { row: 6, column: 6, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.LINE_CHART,
        aggregateFieldMetadataId: opportunityFields.amount.id,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: opportunityFields.closeDate.id,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: false,
        displayLegend: true,
        color: 'crimson',
        isCumulative: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: opportunityObjectId,
    },

    {
      id: tab1Widgets.opportunitiesByOwner.id,
      universalIdentifier: tab1Def.opportunitiesByOwner.universalIdentifier,
      pageLayoutTabId: tab1Id,
      title: 'Opportunities by Owner',
      type: WidgetType.GRAPH,
      gridPosition: { row: 12, column: 0, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: opportunityFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: opportunityFields.owner.id,
        primaryAxisGroupBySubFieldName: 'name.firstName',
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        secondaryAxisGroupByFieldMetadataId: opportunityFields.owner.id,
        secondaryAxisGroupBySubFieldName: 'name.firstName',
        secondaryAxisGroupByDateGranularity:
          ObjectRecordGroupByDateGranularity.DAY,
        secondaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: false,
        displayLegend: true,
        color: 'blue',
        layout: BarChartLayout.HORIZONTAL,
        isCumulative: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: opportunityObjectId,
    },

    {
      id: tab1Widgets.stockMarketIframe.id,
      universalIdentifier: tab1Def.stockMarketIframe.universalIdentifier,
      pageLayoutTabId: tab1Id,
      title: 'Stock market (Iframe)',
      type: WidgetType.IFRAME,
      gridPosition: { row: 12, column: 6, rowSpan: 8, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.IFRAME as const,
        url: 'https://www.tradingview.com/embed-widget/hotlists/?locale=en',
      },
      objectMetadataId: null,
    },

    {
      id: tab1Widgets.dealsCreatedThisMonth.id,
      universalIdentifier: tab1Def.dealsCreatedThisMonth.universalIdentifier,
      pageLayoutTabId: tab1Id,
      title: 'Deals created this month',
      type: WidgetType.GRAPH,
      gridPosition: { row: 18, column: 0, rowSpan: 2, columnSpan: 3 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: false,
        filter: createFilterConfig([
          {
            type: 'DATE_TIME',
            label: 'Creation date',
            value: 'THIS_1_MONTH;;UTC;;SUNDAY;;',
            displayValue: 'THIS_1_MONTH;;UTC;;SUNDAY;;',
            operand: 'IS_RELATIVE',
            fieldMetadataId: opportunityFields.createdAt.id,
          },
        ]),
        prefix: '',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: opportunityObjectId,
    },

    {
      id: tab1Widgets.dealValueCreatedThisMonth.id,
      universalIdentifier:
        tab1Def.dealValueCreatedThisMonth.universalIdentifier,
      pageLayoutTabId: tab1Id,
      title: 'Deal value created this month',
      type: WidgetType.GRAPH,
      gridPosition: { row: 18, column: 3, rowSpan: 2, columnSpan: 3 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.amount.id,
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
        filter: createFilterConfig([
          {
            type: 'DATE_TIME',
            label: 'Creation date',
            value: 'THIS_1_MONTH;;UTC;;SUNDAY;;',
            displayValue: 'THIS_1_MONTH;;UTC;;SUNDAY;;',
            operand: 'IS_RELATIVE',
            fieldMetadataId: opportunityFields.createdAt.id,
          },
        ]),
        prefix: '$',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: opportunityObjectId,
    },
  ];

  for (const widget of widgets) {
    const flatPageLayoutWidget: FlatPageLayoutWidget = {
      id: widget.id,
      universalIdentifier: widget.universalIdentifier,
      applicationId: twentyStandardApplicationId,
      workspaceId,
      pageLayoutTabId: widget.pageLayoutTabId,
      title: widget.title,
      type: widget.type,
      gridPosition: widget.gridPosition,
      configuration: widget.configuration,
      objectMetadataId: widget.objectMetadataId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    flatPageLayoutWidgetMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatPageLayoutWidget,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });
  }

  return flatPageLayoutWidgetMaps;
};
