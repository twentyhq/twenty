import { CalendarStartDay } from 'twenty-shared/constants';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { ObjectRecordGroupByDateGranularity } from 'src/engine/metadata-modules/page-layout-widget/enums/date-granularity.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';
import {
  REVENUE_OVERVIEW_PAGE_LAYOUT_SEED,
  REVENUE_OVERVIEW_TAB_SEEDS,
  REVENUE_OVERVIEW_WIDGET_SEEDS,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/dashboards/revenue-overview-dashboard.constants';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
  OPPORTUNITY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export type PageLayoutDefinition = {
  id: string;
  name: string;
  type: PageLayoutType;
  objectMetadataId: null;
  workspaceId: string;
  applicationId: string;
};

type PageLayoutTabDefinition = {
  id: string;
  title: string;
  position: number;
  pageLayoutId: string;
  workspaceId: string;
  applicationId: string;
};

export type PageLayoutWidgetDefinition = {
  id: string;
  pageLayoutTabId: string;
  title: string;
  type: WidgetType;
  gridPosition: GridPosition;
  configuration: Record<string, unknown>;
  objectMetadataId: string | null;
  workspaceId: string;
  applicationId: string;
};

type DashboardRecordDefinition = {
  id: string;
  title: string;
  pageLayoutId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: null;
  createdByName: string;
  updatedBySource: string;
  updatedByWorkspaceMemberId: null;
  updatedByName: string;
  position: number;
};

type RevenueOverviewDashboardDefinition = {
  pageLayout: PageLayoutDefinition;
  tabs: PageLayoutTabDefinition[];
  widgets: PageLayoutWidgetDefinition[];
  dashboardRecord: DashboardRecordDefinition;
};

const getFieldIdByStandardId = (
  objectMetadata: ObjectMetadataEntity | undefined,
  standardFieldId: string,
): string | undefined => {
  return objectMetadata?.fields?.find(
    (field) => field.standardId === standardFieldId,
  )?.id;
};

const getFieldIdByName = (
  objectMetadata: ObjectMetadataEntity | undefined,
  fieldName: string,
): string | undefined => {
  return objectMetadata?.fields?.find((field) => field.name === fieldName)?.id;
};

type FilterDefinition = {
  type: string;
  label: string;
  value: string;
  displayValue: string;
  operand: string;
  fieldMetadataId: string;
};

type FilterConfiguration = {
  recordFilters: Array<
    FilterDefinition & {
      id: string;
      recordFilterGroupId: string;
    }
  >;
  recordFilterGroups: Array<{
    id: string;
    logicalOperator: 'AND' | 'OR';
  }>;
};

const createFilterConfig = (
  workspaceId: string,
  widgetSeedId: string,
  filters: FilterDefinition[],
): FilterConfiguration => {
  const groupId = generateSeedId(workspaceId, `${widgetSeedId}_FILTER_GROUP`);

  return {
    recordFilters: filters.map((filter, index) => ({
      id: generateSeedId(workspaceId, `${widgetSeedId}_FILTER_${index}`),
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

const createRichTextWidget = (
  id: string,
  pageLayoutTabId: string,
  title: string,
  gridPosition: GridPosition,
  headingText: string,
  workspaceId: string,
  applicationId: string,
): PageLayoutWidgetDefinition => ({
  id,
  pageLayoutTabId,
  title,
  type: WidgetType.STANDALONE_RICH_TEXT,
  gridPosition,
  configuration: {
    configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
    body: {
      blocknote: JSON.stringify([
        {
          id: crypto.randomUUID(),
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
          id: crypto.randomUUID(),
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
  workspaceId,
  applicationId,
});

export const getRevenueOverviewDashboardDefinition = (
  objectMetadataItems: ObjectMetadataEntity[],
  workspaceId: string,
  applicationId: string,
): RevenueOverviewDashboardDefinition => {
  // Find object metadata
  const opportunityObject = objectMetadataItems.find(
    (obj) => obj.standardId === STANDARD_OBJECT_IDS.opportunity,
  );
  const personObject = objectMetadataItems.find(
    (obj) => obj.standardId === STANDARD_OBJECT_IDS.person,
  );
  const companyObject = objectMetadataItems.find(
    (obj) => obj.standardId === STANDARD_OBJECT_IDS.company,
  );

  // Resolve field IDs for Opportunity
  const opportunityIdFieldId = getFieldIdByName(opportunityObject, 'id');
  const opportunityAmountFieldId = getFieldIdByStandardId(
    opportunityObject,
    OPPORTUNITY_STANDARD_FIELD_IDS.amount,
  );
  const opportunityStageFieldId = getFieldIdByStandardId(
    opportunityObject,
    OPPORTUNITY_STANDARD_FIELD_IDS.stage,
  );
  const opportunityCloseDateFieldId = getFieldIdByStandardId(
    opportunityObject,
    OPPORTUNITY_STANDARD_FIELD_IDS.closeDate,
  );
  const opportunityCreatedAtFieldId = getFieldIdByStandardId(
    opportunityObject,
    BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
  );
  const opportunityPointOfContactFieldId = getFieldIdByStandardId(
    opportunityObject,
    OPPORTUNITY_STANDARD_FIELD_IDS.pointOfContact,
  );

  // Resolve field IDs for Person
  const personIdFieldId = getFieldIdByName(personObject, 'id');
  const personCreatedAtFieldId = getFieldIdByStandardId(
    personObject,
    BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
  );

  // Resolve field IDs for Company
  const companyIdFieldId = getFieldIdByName(companyObject, 'id');
  const companyCreatedAtFieldId = getFieldIdByStandardId(
    companyObject,
    BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
  );
  const companyEmployeesFieldId = getFieldIdByStandardId(
    companyObject,
    COMPANY_STANDARD_FIELD_IDS.employees,
  );
  // Industry field doesn't exist in Company standard object - checking if available
  const companyIndustryFieldId = getFieldIdByName(companyObject, 'industry');

  // Generate IDs
  const pageLayoutId = generateSeedId(
    workspaceId,
    REVENUE_OVERVIEW_PAGE_LAYOUT_SEED,
  );
  const revenueOverviewTabId = generateSeedId(
    workspaceId,
    REVENUE_OVERVIEW_TAB_SEEDS.REVENUE_OVERVIEW,
  );
  const leadExplorationTabId = generateSeedId(
    workspaceId,
    REVENUE_OVERVIEW_TAB_SEEDS.LEAD_EXPLORATION,
  );

  // Page Layout
  const pageLayout: PageLayoutDefinition = {
    id: pageLayoutId,
    name: 'Revenue Overview Dashboard',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    workspaceId,
    applicationId,
  };

  // Tabs
  const tabs: PageLayoutTabDefinition[] = [
    {
      id: revenueOverviewTabId,
      title: 'Revenue Overview',
      position: 0,
      pageLayoutId,
      workspaceId,
      applicationId,
    },
    {
      id: leadExplorationTabId,
      title: 'Lead exploration',
      position: 1,
      pageLayoutId,
      workspaceId,
      applicationId,
    },
  ];

  // Widgets
  const widgets: PageLayoutWidgetDefinition[] = [];

  // ==========================================
  // TAB 1: Revenue Overview
  // ==========================================

  // Header: Revenue to date this year (row 0)
  widgets.push(
    createRichTextWidget(
      generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.HEADER_REVENUE_TO_DATE,
      ),
      revenueOverviewTabId,
      'Revenue to date this year',
      { row: 0, column: 0, rowSpan: 2, columnSpan: 12 },
      'Revenue to date this year',
      workspaceId,
      applicationId,
    ),
  );

  // Amount Closed this year (row 2, col 0)
  if (
    isDefined(opportunityAmountFieldId) &&
    isDefined(opportunityStageFieldId) &&
    isDefined(opportunityCloseDateFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.AMOUNT_CLOSED_THIS_YEAR,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Amount Closed this year',
      type: WidgetType.GRAPH,
      gridPosition: { row: 2, column: 0, rowSpan: 4, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityAmountFieldId,
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
        prefix: '$',
        suffix: null,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.AMOUNT_CLOSED_THIS_YEAR,
          [
            {
              type: 'SELECT',
              label: 'Stage',
              value: '["CUSTOMER"]',
              displayValue: 'Customer',
              operand: 'IS',
              fieldMetadataId: opportunityStageFieldId,
            },
            {
              type: 'DATE_TIME',
              label: 'Close date',
              value: '2025-01-01T00:00:00.000Z',
              displayValue: 'Jan 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCloseDateFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Number of deals won this year (row 2, col 4)
  if (
    isDefined(opportunityIdFieldId) &&
    isDefined(opportunityStageFieldId) &&
    isDefined(opportunityCloseDateFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.DEALS_WON_THIS_YEAR,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Number of deals won this year',
      type: WidgetType.GRAPH,
      gridPosition: { row: 2, column: 4, rowSpan: 4, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.DEALS_WON_THIS_YEAR,
          [
            {
              type: 'DATE_TIME',
              label: 'Close date',
              value: '2025-01-01T00:00:00.000Z',
              displayValue: 'Jan 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCloseDateFieldId,
            },
            {
              type: 'SELECT',
              label: 'Stage',
              value: '["CUSTOMER"]',
              displayValue: 'Customer',
              operand: 'IS',
              fieldMetadataId: opportunityStageFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Won Rate this year (row 2, col 8)
  if (
    isDefined(opportunityStageFieldId) &&
    isDefined(opportunityCloseDateFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.WON_RATE_THIS_YEAR,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Won Rate this year',
      type: WidgetType.GRAPH,
      gridPosition: { row: 2, column: 8, rowSpan: 4, columnSpan: 4 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityStageFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.WON_RATE_THIS_YEAR,
          [
            {
              type: 'DATE_TIME',
              label: 'Close date',
              value: '2025-01-01T00:00:00.000Z',
              displayValue: 'Jan 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCloseDateFieldId,
            },
          ],
        ),
        ratioAggregateConfig: {
          fieldMetadataId: opportunityStageFieldId,
          optionValue: 'CUSTOMER',
        },
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Header: Current Pipeline (row 6)
  widgets.push(
    createRichTextWidget(
      generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.HEADER_CURRENT_PIPELINE,
      ),
      revenueOverviewTabId,
      'Current Pipeline',
      { row: 6, column: 0, rowSpan: 2, columnSpan: 12 },
      'Current Pipeline',
      workspaceId,
      applicationId,
    ),
  );

  // Deal Revenue by Stage (row 8)
  if (
    isDefined(opportunityAmountFieldId) &&
    isDefined(opportunityStageFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.DEAL_REVENUE_BY_STAGE,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Deal Revenue by Stage',
      type: WidgetType.GRAPH,
      gridPosition: { row: 8, column: 0, rowSpan: 5, columnSpan: 12 },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: opportunityAmountFieldId,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: opportunityStageFieldId,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        axisNameDisplay: AxisNameDisplay.NONE,
        displayDataLabel: true,
        displayLegend: true,
        color: 'blue',
        layout: BarChartLayout.VERTICAL,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.DEAL_REVENUE_BY_STAGE,
          [
            {
              type: 'SELECT',
              label: 'Stage',
              value: '["CUSTOMER","LOST"]',
              displayValue: 'Customer, Lost',
              operand: 'IS_NOT',
              fieldMetadataId: opportunityStageFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Header: Performance this quarter (row 13)
  widgets.push(
    createRichTextWidget(
      generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.HEADER_PERFORMANCE_THIS_QUARTER,
      ),
      revenueOverviewTabId,
      'Performance this quarter',
      { row: 13, column: 0, rowSpan: 2, columnSpan: 12 },
      'Performance this quarter',
      workspaceId,
      applicationId,
    ),
  );

  // Leads created this quarter (row 15, col 0)
  if (isDefined(personIdFieldId) && isDefined(personCreatedAtFieldId)) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.LEADS_CREATED_THIS_QUARTER,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Leads created this quarter',
      type: WidgetType.GRAPH,
      gridPosition: { row: 15, column: 0, rowSpan: 5, columnSpan: 2 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: personIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.LEADS_CREATED_THIS_QUARTER,
          [
            {
              type: 'DATE_TIME',
              label: 'Creation date',
              value: '2025-10-01T00:00:00.000Z',
              displayValue: 'Oct 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: personCreatedAtFieldId,
            },
          ],
        ),
      },
      objectMetadataId: personObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Opps created this quarter (row 15, col 2)
  if (
    isDefined(opportunityIdFieldId) &&
    isDefined(opportunityCreatedAtFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.OPPS_CREATED_THIS_QUARTER,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Opps created this quarter',
      type: WidgetType.GRAPH,
      gridPosition: { row: 15, column: 2, rowSpan: 5, columnSpan: 2 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.OPPS_CREATED_THIS_QUARTER,
          [
            {
              type: 'DATE_TIME',
              label: 'Creation date',
              value: '2025-10-01T00:00:00.000Z',
              displayValue: 'Oct 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCreatedAtFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Won Opps created count (row 15, col 4)
  if (
    isDefined(opportunityIdFieldId) &&
    isDefined(opportunityCreatedAtFieldId) &&
    isDefined(opportunityStageFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.WON_OPPS_CREATED_COUNT,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Won Opps created this quarter',
      type: WidgetType.GRAPH,
      gridPosition: { row: 15, column: 4, rowSpan: 5, columnSpan: 2 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.WON_OPPS_CREATED_COUNT,
          [
            {
              type: 'DATE_TIME',
              label: 'Creation date',
              value: '2025-10-01T00:00:00.000Z',
              displayValue: 'Oct 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCreatedAtFieldId,
            },
            {
              type: 'SELECT',
              label: 'Stage',
              value: '["CUSTOMER"]',
              displayValue: 'Customer',
              operand: 'IS',
              fieldMetadataId: opportunityStageFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Won Opps created amount (row 15, col 6)
  if (
    isDefined(opportunityAmountFieldId) &&
    isDefined(opportunityCreatedAtFieldId) &&
    isDefined(opportunityStageFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.WON_OPPS_CREATED_AMOUNT,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Won Opps created this quarter',
      type: WidgetType.GRAPH,
      gridPosition: { row: 15, column: 6, rowSpan: 5, columnSpan: 2 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityAmountFieldId,
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
        prefix: '$',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.WON_OPPS_CREATED_AMOUNT,
          [
            {
              type: 'DATE_TIME',
              label: 'Creation date',
              value: '2025-10-01T00:00:00.000Z',
              displayValue: 'Oct 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCreatedAtFieldId,
            },
            {
              type: 'SELECT',
              label: 'Stage',
              value: '["CUSTOMER"]',
              displayValue: 'Customer',
              operand: 'IS',
              fieldMetadataId: opportunityStageFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Opps won count (row 15, col 8)
  if (
    isDefined(opportunityIdFieldId) &&
    isDefined(opportunityCloseDateFieldId) &&
    isDefined(opportunityStageFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.OPPS_WON_COUNT,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Opps won this quarter',
      type: WidgetType.GRAPH,
      gridPosition: { row: 15, column: 8, rowSpan: 5, columnSpan: 2 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        displayDataLabel: false,
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.OPPS_WON_COUNT,
          [
            {
              type: 'DATE_TIME',
              label: 'Close date',
              value: '2025-10-01T00:00:00.000Z',
              displayValue: 'Oct 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCloseDateFieldId,
            },
            {
              type: 'SELECT',
              label: 'Stage',
              value: '["CUSTOMER"]',
              displayValue: 'Customer',
              operand: 'IS',
              fieldMetadataId: opportunityStageFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Opps won amount (row 15, col 10)
  if (
    isDefined(opportunityAmountFieldId) &&
    isDefined(opportunityCloseDateFieldId) &&
    isDefined(opportunityStageFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.OPPS_WON_AMOUNT,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Opps won this quarter',
      type: WidgetType.GRAPH,
      gridPosition: { row: 15, column: 10, rowSpan: 5, columnSpan: 2 },
      configuration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: opportunityAmountFieldId,
        aggregateOperation: AggregateOperations.SUM,
        displayDataLabel: false,
        prefix: '$',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.OPPS_WON_AMOUNT,
          [
            {
              type: 'DATE_TIME',
              label: 'Close date',
              value: '2025-10-01T00:00:00.000Z',
              displayValue: 'Oct 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCloseDateFieldId,
            },
            {
              type: 'SELECT',
              label: 'Stage',
              value: '["CUSTOMER"]',
              displayValue: 'Customer',
              operand: 'IS',
              fieldMetadataId: opportunityStageFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Opps by seller (row 20, col 0)
  if (
    isDefined(opportunityIdFieldId) &&
    isDefined(opportunityCreatedAtFieldId) &&
    isDefined(opportunityPointOfContactFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.OPPS_BY_SELLER,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Opp opened this quarter by seller',
      type: WidgetType.GRAPH,
      gridPosition: { row: 20, column: 0, rowSpan: 8, columnSpan: 7 },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: opportunityIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: opportunityPointOfContactFieldId,
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
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.OPPS_BY_SELLER,
          [
            {
              type: 'DATE_TIME',
              label: 'Creation date',
              value: '2025-10-01T00:00:00.000Z',
              displayValue: 'Oct 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCreatedAtFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Revenue by seller (row 20, col 7)
  if (
    isDefined(opportunityAmountFieldId) &&
    isDefined(opportunityCloseDateFieldId) &&
    isDefined(opportunityStageFieldId) &&
    isDefined(opportunityPointOfContactFieldId)
  ) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.REVENUE_BY_SELLER,
      ),
      pageLayoutTabId: revenueOverviewTabId,
      title: 'Revenue closed this quarter by sellers',
      type: WidgetType.GRAPH,
      gridPosition: { row: 20, column: 7, rowSpan: 8, columnSpan: 5 },
      configuration: {
        configurationType: WidgetConfigurationType.BAR_CHART,
        aggregateFieldMetadataId: opportunityAmountFieldId,
        aggregateOperation: AggregateOperations.SUM,
        primaryAxisGroupByFieldMetadataId: opportunityPointOfContactFieldId,
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
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.REVENUE_BY_SELLER,
          [
            {
              type: 'SELECT',
              label: 'Stage',
              value: '["CUSTOMER"]',
              displayValue: 'Customer',
              operand: 'IS',
              fieldMetadataId: opportunityStageFieldId,
            },
            {
              type: 'DATE_TIME',
              label: 'Close date',
              value: '2025-10-01T00:00:00.000Z',
              displayValue: 'Oct 1, 2025',
              operand: 'IS_AFTER',
              fieldMetadataId: opportunityCloseDateFieldId,
            },
          ],
        ),
      },
      objectMetadataId: opportunityObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // ==========================================
  // TAB 2: Lead Exploration
  // ==========================================

  // Lead creation over time (row 0, col 0)
  if (isDefined(personIdFieldId) && isDefined(personCreatedAtFieldId)) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.LEAD_CREATION_OVER_TIME,
      ),
      pageLayoutTabId: leadExplorationTabId,
      title: 'Lead creation over time',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 0, rowSpan: 7, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.LINE_CHART,
        aggregateFieldMetadataId: personIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: personCreatedAtFieldId,
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
      objectMetadataId: personObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Company creation over time (row 0, col 6)
  if (isDefined(companyIdFieldId) && isDefined(companyCreatedAtFieldId)) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.COMPANY_CREATION_OVER_TIME,
      ),
      pageLayoutTabId: leadExplorationTabId,
      title: 'Company creation over time',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 6, rowSpan: 7, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.LINE_CHART,
        aggregateFieldMetadataId: companyIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: companyCreatedAtFieldId,
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
      objectMetadataId: companyObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Companies by company size (row 7, col 0)
  if (isDefined(companyIdFieldId) && isDefined(companyEmployeesFieldId)) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.COMPANIES_BY_SIZE,
      ),
      pageLayoutTabId: leadExplorationTabId,
      title: 'Companies by company size',
      type: WidgetType.GRAPH,
      gridPosition: { row: 7, column: 0, rowSpan: 7, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.LINE_CHART,
        aggregateFieldMetadataId: companyIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        primaryAxisGroupByFieldMetadataId: companyEmployeesFieldId,
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        axisNameDisplay: AxisNameDisplay.X,
        displayDataLabel: false,
        displayLegend: true,
        color: 'blue',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
      },
      objectMetadataId: companyObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Companies by industry (row 7, col 6) - Only if industry field exists
  if (isDefined(companyIdFieldId) && isDefined(companyIndustryFieldId)) {
    widgets.push({
      id: generateSeedId(
        workspaceId,
        REVENUE_OVERVIEW_WIDGET_SEEDS.COMPANIES_BY_INDUSTRY,
      ),
      pageLayoutTabId: leadExplorationTabId,
      title: 'Companies by industry',
      type: WidgetType.GRAPH,
      gridPosition: { row: 7, column: 6, rowSpan: 7, columnSpan: 6 },
      configuration: {
        configurationType: WidgetConfigurationType.PIE_CHART,
        groupByFieldMetadataId: companyIndustryFieldId,
        aggregateFieldMetadataId: companyIdFieldId,
        aggregateOperation: AggregateOperations.COUNT,
        orderBy: GraphOrderBy.VALUE_DESC,
        displayDataLabel: false,
        showCenterMetric: false,
        displayLegend: true,
        color: 'auto',
        timezone: 'UTC',
        firstDayOfTheWeek: CalendarStartDay.SUNDAY,
        filter: createFilterConfig(
          workspaceId,
          REVENUE_OVERVIEW_WIDGET_SEEDS.COMPANIES_BY_INDUSTRY,
          [
            {
              type: 'TEXT',
              label: 'Industry',
              value: '',
              displayValue: '',
              operand: 'IS_NOT_EMPTY',
              fieldMetadataId: companyIndustryFieldId,
            },
          ],
        ),
      },
      objectMetadataId: companyObject?.id ?? null,
      workspaceId,
      applicationId,
    });
  }

  // Dashboard record
  const dashboardRecord: DashboardRecordDefinition = {
    id: generateSeedId(workspaceId, 'REVENUE_OVERVIEW_DASHBOARD_RECORD'),
    title: 'Revenue Overview',
    pageLayoutId,
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
    updatedBySource: 'SYSTEM',
    updatedByWorkspaceMemberId: null,
    updatedByName: 'System',
    position: 0,
  };

  return {
    pageLayout,
    tabs,
    widgets,
    dashboardRecord,
  };
};
