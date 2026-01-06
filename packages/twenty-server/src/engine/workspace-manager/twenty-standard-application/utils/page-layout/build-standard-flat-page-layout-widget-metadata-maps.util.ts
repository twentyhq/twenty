import { v4 } from 'uuid';
import { CalendarStartDay } from 'twenty-shared/constants';

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
  // Using Record<string, unknown> for flexibility in defining configurations
  // Cast to AllPageLayoutWidgetConfiguration when creating FlatPageLayoutWidget
  configuration: Record<string, unknown>;
  objectMetadataId: string | null;
};

const createRichTextConfiguration = (headingText: string) => ({
  configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
  body: {
    blocknote: JSON.stringify([
      {
        id: v4(),
        type: 'heading',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
          level: 2,
        },
        content: [{ type: 'text', text: headingText, styles: {} }],
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
});

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

  // Get object and field IDs
  const opportunityObjectId = standardObjectMetadataRelatedEntityIds.opportunity.id;
  const opportunityFields = standardObjectMetadataRelatedEntityIds.opportunity.fields;
  const personObjectId = standardObjectMetadataRelatedEntityIds.person.id;
  const personFields = standardObjectMetadataRelatedEntityIds.person.fields;
  const companyObjectId = standardObjectMetadataRelatedEntityIds.company.id;
  const companyFields = standardObjectMetadataRelatedEntityIds.company.fields;

  // Tab 1: Revenue Overview
  const revenueOverviewTabId = layoutIds.tabs.revenueOverview.id;
  const revenueOverviewTabWidgets = layoutIds.tabs.revenueOverview.widgets;
  const revenueOverviewTabDef = layoutDef.tabs.revenueOverview.widgets;

  // Tab 2: Lead Exploration
  const leadExplorationTabId = layoutIds.tabs.leadExploration.id;
  const leadExplorationTabWidgets = layoutIds.tabs.leadExploration.widgets;
  const leadExplorationTabDef = layoutDef.tabs.leadExploration.widgets;

  const widgets: WidgetDefinition[] = [
    // ==========================================
    // TAB 1: Revenue Overview
    // ==========================================

    // Rich Text Header: Revenue to date
    {
      id: revenueOverviewTabWidgets.headerRevenueToDate.id,
      universalIdentifier: revenueOverviewTabDef.headerRevenueToDate.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Revenue to date header',
      type: WidgetType.STANDALONE_RICH_TEXT,
      gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 12 },
      configuration: createRichTextConfiguration('Revenue to date'),
      objectMetadataId: null,
    },

    // KPI: Amount Closed This Year
    {
      id: revenueOverviewTabWidgets.amountClosedThisYear.id,
      universalIdentifier: revenueOverviewTabDef.amountClosedThisYear.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Amount Closed this year',
      type: WidgetType.GRAPH,
      gridPosition: { row: 2, column: 0, rowSpan: 5, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.amount.id,
        aggregateOperation: AggregateOperations.SUM,
        filter: createFilterConfig([
          {
            type: 'SELECT',
            label: 'Stage',
            value: '["CUSTOMER"]',
            displayValue: 'Customer',
            operand: 'IS',
            fieldMetadataId: opportunityFields.stage.id,
          },
          {
            type: 'DATE_TIME',
            label: 'Close date',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.closeDate.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // KPI: Deals Won This Year
    {
      id: revenueOverviewTabWidgets.dealsWonThisYear.id,
      universalIdentifier: revenueOverviewTabDef.dealsWonThisYear.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Number of deals won this year',
      type: WidgetType.GRAPH,
      gridPosition: { row: 2, column: 4, rowSpan: 5, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        filter: createFilterConfig([
          {
            type: 'SELECT',
            label: 'Stage',
            value: '["CUSTOMER"]',
            displayValue: 'Customer',
            operand: 'IS',
            fieldMetadataId: opportunityFields.stage.id,
          },
          {
            type: 'DATE_TIME',
            label: 'Close date',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.closeDate.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // KPI: Won Rate This Year
    {
      id: revenueOverviewTabWidgets.wonRateThisYear.id,
      universalIdentifier: revenueOverviewTabDef.wonRateThisYear.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Won rate this year',
      type: WidgetType.GRAPH,
      gridPosition: { row: 2, column: 8, rowSpan: 5, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.stage.id,
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig([
          {
            type: 'DATE_TIME',
            label: 'Close date',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.closeDate.id,
          },
        ]),
        ratioAggregateConfig: {
          fieldMetadataId: opportunityFields.stage.id,
          optionValue: 'CUSTOMER',
        },
      },
      objectMetadataId: opportunityObjectId,
    },

    // Rich Text Header: Current Pipeline
    {
      id: revenueOverviewTabWidgets.headerCurrentPipeline.id,
      universalIdentifier: revenueOverviewTabDef.headerCurrentPipeline.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Current Pipeline header',
      type: WidgetType.STANDALONE_RICH_TEXT,
      gridPosition: { row: 7, column: 0, rowSpan: 2, columnSpan: 12 },
      configuration: createRichTextConfiguration('Current Pipeline'),
      objectMetadataId: null,
    },

    // Bar Chart: Deal Revenue by Stage
    {
      id: revenueOverviewTabWidgets.dealRevenueByStage.id,
      universalIdentifier: revenueOverviewTabDef.dealRevenueByStage.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Deal revenue by stage',
      type: WidgetType.GRAPH,
      gridPosition: { row: 9, column: 0, rowSpan: 6, columnSpan: 12 },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: opportunityFields.amount.id,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: opportunityFields.stage.id,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: true,
        displayLegend: true,
        color: 'blue',
        layout: BarChartLayout.VERTICAL,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig([
          {
            type: 'SELECT',
            label: 'Stage',
            value: '["CUSTOMER","LOST"]',
            displayValue: 'Customer, Lost',
            operand: 'IS_NOT',
            fieldMetadataId: opportunityFields.stage.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // Rich Text Header: Performance This Quarter
    {
      id: revenueOverviewTabWidgets.headerPerformanceThisQuarter.id,
      universalIdentifier: revenueOverviewTabDef.headerPerformanceThisQuarter.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Performance This Quarter header',
      type: WidgetType.STANDALONE_RICH_TEXT,
      gridPosition: { row: 15, column: 0, rowSpan: 2, columnSpan: 12 },
      configuration: createRichTextConfiguration('Performance This Quarter'),
      objectMetadataId: null,
    },

    // KPI: Leads Created This Quarter
    {
      id: revenueOverviewTabWidgets.leadsCreatedThisQuarter.id,
      universalIdentifier: revenueOverviewTabDef.leadsCreatedThisQuarter.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Leads created this quarter',
      type: WidgetType.GRAPH,
      gridPosition: { row: 17, column: 0, rowSpan: 3, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: personFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        filter: createFilterConfig([
          {
            type: 'DATE_TIME',
            label: 'Created',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: personFields.createdAt.id,
          },
        ]),
      },
      objectMetadataId: personObjectId,
    },

    // KPI: Opps Created This Quarter
    {
      id: revenueOverviewTabWidgets.oppsCreatedThisQuarter.id,
      universalIdentifier: revenueOverviewTabDef.oppsCreatedThisQuarter.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Opps created this quarter',
      type: WidgetType.GRAPH,
      gridPosition: { row: 17, column: 4, rowSpan: 3, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        filter: createFilterConfig([
          {
            type: 'DATE_TIME',
            label: 'Created',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.createdAt.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // KPI: Won Opps Created Count
    {
      id: revenueOverviewTabWidgets.wonOppsCreatedCount.id,
      universalIdentifier: revenueOverviewTabDef.wonOppsCreatedCount.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Won opps created count',
      type: WidgetType.GRAPH,
      gridPosition: { row: 17, column: 8, rowSpan: 3, columnSpan: 2 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        filter: createFilterConfig([
          {
            type: 'SELECT',
            label: 'Stage',
            value: '["CUSTOMER"]',
            displayValue: 'Customer',
            operand: 'IS',
            fieldMetadataId: opportunityFields.stage.id,
          },
          {
            type: 'DATE_TIME',
            label: 'Created',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.createdAt.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // KPI: Won Opps Created Amount
    {
      id: revenueOverviewTabWidgets.wonOppsCreatedAmount.id,
      universalIdentifier: revenueOverviewTabDef.wonOppsCreatedAmount.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Won opps created amount',
      type: WidgetType.GRAPH,
      gridPosition: { row: 17, column: 10, rowSpan: 3, columnSpan: 2 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.amount.id,
        aggregateOperation: AggregateOperations.SUM,
        filter: createFilterConfig([
          {
            type: 'SELECT',
            label: 'Stage',
            value: '["CUSTOMER"]',
            displayValue: 'Customer',
            operand: 'IS',
            fieldMetadataId: opportunityFields.stage.id,
          },
          {
            type: 'DATE_TIME',
            label: 'Created',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.createdAt.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // KPI: Opps Won Count
    {
      id: revenueOverviewTabWidgets.oppsWonCount.id,
      universalIdentifier: revenueOverviewTabDef.oppsWonCount.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Opps won count',
      type: WidgetType.GRAPH,
      gridPosition: { row: 20, column: 0, rowSpan: 3, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        filter: createFilterConfig([
          {
            type: 'SELECT',
            label: 'Stage',
            value: '["CUSTOMER"]',
            displayValue: 'Customer',
            operand: 'IS',
            fieldMetadataId: opportunityFields.stage.id,
          },
          {
            type: 'DATE_TIME',
            label: 'Close date',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.closeDate.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // KPI: Opps Won Amount
    {
      id: revenueOverviewTabWidgets.oppsWonAmount.id,
      universalIdentifier: revenueOverviewTabDef.oppsWonAmount.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Opps won amount',
      type: WidgetType.GRAPH,
      gridPosition: { row: 20, column: 4, rowSpan: 3, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityFields.amount.id,
        aggregateOperation: AggregateOperations.SUM,
        filter: createFilterConfig([
          {
            type: 'SELECT',
            label: 'Stage',
            value: '["CUSTOMER"]',
            displayValue: 'Customer',
            operand: 'IS',
            fieldMetadataId: opportunityFields.stage.id,
          },
          {
            type: 'DATE_TIME',
            label: 'Close date',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.closeDate.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // Bar Chart: Opps by Seller
    {
      id: revenueOverviewTabWidgets.oppsBySeller.id,
      universalIdentifier: revenueOverviewTabDef.oppsBySeller.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Opps by seller',
      type: WidgetType.GRAPH,
      gridPosition: { row: 23, column: 0, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: opportunityFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: opportunityFields.pointOfContact.id,
        primaryAxisGroupBySubFieldName: 'name.firstName',
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: true,
        displayLegend: true,
        color: 'blue',
        layout: BarChartLayout.HORIZONTAL,
        isCumulative: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig([
          {
            type: 'DATE_TIME',
            label: 'Created',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.createdAt.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // Bar Chart: Revenue by Seller
    {
      id: revenueOverviewTabWidgets.revenueBySeller.id,
      universalIdentifier: revenueOverviewTabDef.revenueBySeller.universalIdentifier,
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Revenue by seller',
      type: WidgetType.GRAPH,
      gridPosition: { row: 23, column: 6, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: opportunityFields.amount.id,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: opportunityFields.pointOfContact.id,
        primaryAxisGroupBySubFieldName: 'name.firstName',
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: true,
        displayLegend: true,
        color: 'blue',
        layout: BarChartLayout.HORIZONTAL,
        isCumulative: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig([
          {
            type: 'SELECT',
            label: 'Stage',
            value: '["CUSTOMER"]',
            displayValue: 'Customer',
            operand: 'IS',
            fieldMetadataId: opportunityFields.stage.id,
          },
          {
            type: 'DATE_TIME',
            label: 'Close date',
            value: '2025-01-01T00:00:00.000Z',
            displayValue: 'Jan 1, 2025',
            operand: 'IS_AFTER',
            fieldMetadataId: opportunityFields.closeDate.id,
          },
        ]),
      },
      objectMetadataId: opportunityObjectId,
    },

    // ==========================================
    // TAB 2: Lead Exploration
    // ==========================================

    // Line Chart: Lead Creation Over Time
    {
      id: leadExplorationTabWidgets.leadCreationOverTime.id,
      universalIdentifier: leadExplorationTabDef.leadCreationOverTime.universalIdentifier,
      pageLayoutTabId: leadExplorationTabId,
      title: 'Lead creation over time',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 0, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.LINE_CHART,
        aggregateFieldMetadataId: personFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: personFields.createdAt.id,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        omitNullValues: false,
        axisNameDisplay: AxisNameDisplay.X,
        displayDataLabel: false,
        displayLegend: true,
        color: 'blue',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: personObjectId,
    },

    // Line Chart: Company Creation Over Time
    {
      id: leadExplorationTabWidgets.companyCreationOverTime.id,
      universalIdentifier: leadExplorationTabDef.companyCreationOverTime.universalIdentifier,
      pageLayoutTabId: leadExplorationTabId,
      title: 'Company creation over time',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 6, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.LINE_CHART,
        aggregateFieldMetadataId: companyFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: companyFields.createdAt.id,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        omitNullValues: false,
        axisNameDisplay: AxisNameDisplay.X,
        displayDataLabel: false,
        displayLegend: true,
        color: 'blue',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: companyObjectId,
    },

    // Line Chart: Companies by Size
    {
      id: leadExplorationTabWidgets.companiesBySize.id,
      universalIdentifier: leadExplorationTabDef.companiesBySize.universalIdentifier,
      pageLayoutTabId: leadExplorationTabId,
      title: 'Companies by size',
      type: WidgetType.GRAPH,
      gridPosition: { row: 6, column: 0, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.LINE_CHART,
        aggregateFieldMetadataId: companyFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: companyFields.employees.id,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.X,
        displayDataLabel: false,
        displayLegend: true,
        color: 'blue',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: companyObjectId,
    },

    // Pie Chart: Companies by Industry (using idealCustomerProfile as proxy since industry doesn't exist)
    {
      id: leadExplorationTabWidgets.companiesByIndustry.id,
      universalIdentifier: leadExplorationTabDef.companiesByIndustry.universalIdentifier,
      pageLayoutTabId: leadExplorationTabId,
      title: 'Companies by industry',
      type: WidgetType.GRAPH,
      gridPosition: { row: 6, column: 6, rowSpan: 6, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.PIE_CHART,
        groupByFieldMetadataId: companyFields.idealCustomerProfile.id,
        aggregateFieldMetadataId: companyFields.id.id,
        aggregateOperation: AggregateOperations.COUNT,
        orderBy: GraphOrderBy.VALUE_DESC,
        displayDataLabel: false,
        showCenterMetric: false,
        displayLegend: true,
        color: 'auto',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: companyObjectId,
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
      configuration:
        widget.configuration as unknown as AllPageLayoutWidgetConfiguration,
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
