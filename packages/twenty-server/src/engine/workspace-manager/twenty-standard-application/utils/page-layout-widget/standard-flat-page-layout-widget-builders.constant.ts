import { CalendarStartDay } from 'twenty-shared/constants';
import { v4 } from 'uuid';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { ObjectRecordGroupByDateGranularity } from 'src/engine/metadata-modules/page-layout-widget/enums/date-granularity.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllStandardPageLayoutName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-name.type';
import { type AllStandardPageLayoutTabName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-tab-name.type';
import { type AllStandardPageLayoutWidgetName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-widget-name.type';
import {
  type CreateStandardPageLayoutWidgetArgs,
  createStandardPageLayoutWidgetFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-widget/create-standard-page-layout-widget-flat-metadata.util';

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

type WidgetBuilderArgs = Omit<CreateStandardPageLayoutWidgetArgs, 'context'>;

export const STANDARD_FLAT_PAGE_LAYOUT_WIDGET_BUILDERS = {
  welcomeRichText: (args: WidgetBuilderArgs) =>
    createStandardPageLayoutWidgetFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        tabName: 'tab1',
        widgetName: 'welcomeRichText',
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
                  {
                    type: 'text',
                    text: 'Welcome to your workspace',
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
                      {
                        type: 'text',
                        text: 'our documentation',
                        styles: {},
                      },
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
    }),

  dealsByCompany: (args: WidgetBuilderArgs) => {
    const opportunityFields =
      args.standardObjectMetadataRelatedEntityIds.opportunity.fields;
    const opportunityObjectId =
      args.standardObjectMetadataRelatedEntityIds.opportunity.id;

    return createStandardPageLayoutWidgetFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        tabName: 'tab1',
        widgetName: 'dealsByCompany',
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
    });
  },

  pipelineValueByStage: (args: WidgetBuilderArgs) => {
    const opportunityFields =
      args.standardObjectMetadataRelatedEntityIds.opportunity.fields;
    const opportunityObjectId =
      args.standardObjectMetadataRelatedEntityIds.opportunity.id;

    return createStandardPageLayoutWidgetFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        tabName: 'tab1',
        widgetName: 'pipelineValueByStage',
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
    });
  },

  revenueTimeline: (args: WidgetBuilderArgs) => {
    const opportunityFields =
      args.standardObjectMetadataRelatedEntityIds.opportunity.fields;
    const opportunityObjectId =
      args.standardObjectMetadataRelatedEntityIds.opportunity.id;

    return createStandardPageLayoutWidgetFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        tabName: 'tab1',
        widgetName: 'revenueTimeline',
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
    });
  },

  opportunitiesByOwner: (args: WidgetBuilderArgs) => {
    const opportunityFields =
      args.standardObjectMetadataRelatedEntityIds.opportunity.fields;
    const opportunityObjectId =
      args.standardObjectMetadataRelatedEntityIds.opportunity.id;

    return createStandardPageLayoutWidgetFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        tabName: 'tab1',
        widgetName: 'opportunitiesByOwner',
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
    });
  },

  stockMarketIframe: (args: WidgetBuilderArgs) =>
    createStandardPageLayoutWidgetFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        tabName: 'tab1',
        widgetName: 'stockMarketIframe',
        title: 'Stock market (Iframe)',
        type: WidgetType.IFRAME,
        gridPosition: { row: 12, column: 6, rowSpan: 8, columnSpan: 6 },
        configuration: {
          configurationType: WidgetConfigurationType.IFRAME as const,
          url: 'https://www.tradingview.com/embed-widget/hotlists/?locale=en',
        },
        objectMetadataId: null,
      },
    }),

  dealsCreatedThisMonth: (args: WidgetBuilderArgs) => {
    const opportunityFields =
      args.standardObjectMetadataRelatedEntityIds.opportunity.fields;
    const opportunityObjectId =
      args.standardObjectMetadataRelatedEntityIds.opportunity.id;

    return createStandardPageLayoutWidgetFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        tabName: 'tab1',
        widgetName: 'dealsCreatedThisMonth',
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
    });
  },

  dealValueCreatedThisMonth: (args: WidgetBuilderArgs) => {
    const opportunityFields =
      args.standardObjectMetadataRelatedEntityIds.opportunity.fields;
    const opportunityObjectId =
      args.standardObjectMetadataRelatedEntityIds.opportunity.id;

    return createStandardPageLayoutWidgetFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        tabName: 'tab1',
        widgetName: 'dealValueCreatedThisMonth',
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
    });
  },
} satisfies {
  [T in AllStandardPageLayoutWidgetName<
    AllStandardPageLayoutName,
    AllStandardPageLayoutTabName
  >]: (args: WidgetBuilderArgs) => FlatPageLayoutWidget;
};
