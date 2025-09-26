import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PAGE_LAYOUT_TAB_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-seeds.constant';
import { PAGE_LAYOUT_WIDGET_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-widget-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  COMPANY_STANDARD_FIELD_IDS,
  OPPORTUNITY_STANDARD_FIELD_IDS,
  PERSON_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

type PageLayoutWidgetDataSeed = {
  id: string;
  pageLayoutTabId: string;
  title: string;
  type: WidgetType;
  gridPosition: {
    row: number;
    column: number;
    rowSpan: number;
    columnSpan: number;
  };
  configuration: Record<string, unknown> | null;
  objectMetadataId: string | null;
};

export const getPageLayoutWidgetDataSeeds = (
  workspaceId: string,
  objectMetadataItems: ObjectMetadataEntity[],
): PageLayoutWidgetDataSeed[] => {
  const opportunityObject = objectMetadataItems.find(
    (obj) => obj.standardId === STANDARD_OBJECT_IDS.opportunity,
  );
  const companyObject = objectMetadataItems.find(
    (obj) => obj.standardId === STANDARD_OBJECT_IDS.company,
  );
  const personObject = objectMetadataItems.find(
    (obj) => obj.standardId === STANDARD_OBJECT_IDS.person,
  );
  const taskObject = objectMetadataItems.find(
    (obj) => obj.standardId === STANDARD_OBJECT_IDS.task,
  );
  const rocketObject = objectMetadataItems.find(
    (obj) => obj.nameSingular === 'rocket',
  );

  return [
    // Sales Overview Tab Widgets
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.SALES_PIPELINE_VALUE,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
      ),
      title: 'Total Pipeline Value',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
      configuration: {
        graphType: 'NUMBER',
        aggregateFieldMetadataId: OPPORTUNITY_STANDARD_FIELD_IDS.amount,
        aggregateOperation: AggregateOperations.SUM,
      },
      objectMetadataId: opportunityObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.SALES_AVERAGE_DEAL_SIZE,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
      ),
      title: 'Average Deal Size',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 3, rowSpan: 4, columnSpan: 4 },
      configuration: {
        graphType: 'GAUGE',
        aggregateFieldMetadataId: OPPORTUNITY_STANDARD_FIELD_IDS.amount,
        aggregateOperation: AggregateOperations.AVG,
        aggregateFieldMetadataIdTotal: OPPORTUNITY_STANDARD_FIELD_IDS.amount,
        aggregateOperationTotal: AggregateOperations.MAX,
      },
      objectMetadataId: rocketObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.SALES_REVENUE_FORECAST,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
      ),
      title: 'Revenue Forecast',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 7, rowSpan: 8, columnSpan: 5 },
      configuration: {
        graphType: 'LINE',
        aggregateFieldMetadataId: OPPORTUNITY_STANDARD_FIELD_IDS.amount,
        aggregateOperation: AggregateOperations.SUM,
        groupByFieldMetadataIdX: OPPORTUNITY_STANDARD_FIELD_IDS.closeDate,
        orderByX: 'FIELD_ASC',
      },
      objectMetadataId: opportunityObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.SALES_DEALS_BY_STAGE,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
      ),
      title: 'Deals by Stage',
      type: WidgetType.GRAPH,
      gridPosition: { row: 4, column: 0, rowSpan: 4, columnSpan: 6 },
      configuration: {
        graphType: 'BAR',
        aggregateFieldMetadataId: OPPORTUNITY_STANDARD_FIELD_IDS.amount,
        aggregateOperation: AggregateOperations.SUM,
        groupByFieldMetadataIdX: OPPORTUNITY_STANDARD_FIELD_IDS.stage,
        orderByX: 'FIELD_DESC',
      },
      objectMetadataId: opportunityObject?.id ?? null,
    },

    // Sales Details Tab Widgets
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.SALES_DEAL_DISTRIBUTION,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.SALES_DETAILS,
      ),
      title: 'Deal Distribution',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 0, rowSpan: 5, columnSpan: 5 },
      configuration: {
        graphType: 'PIE',
        aggregateFieldMetadataId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
        aggregateOperation: AggregateOperations.COUNT,
        groupByFieldMetadataId: OPPORTUNITY_STANDARD_FIELD_IDS.stage,
        orderBy: 'VALUE_DESC',
      },
      objectMetadataId: rocketObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.SALES_OPPORTUNITY_COUNT,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.SALES_DETAILS,
      ),
      title: 'Opportunity Count',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 5, rowSpan: 5, columnSpan: 7 },
      configuration: {
        graphType: 'NUMBER',
        aggregateFieldMetadataId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
        aggregateOperation: AggregateOperations.COUNT,
      },
      objectMetadataId: opportunityObject?.id ?? null,
    },

    // Customer Overview Tab Widgets
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_TOTAL_COUNT,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
      ),
      title: 'Total Customers',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 3 },
      configuration: {
        graphType: 'NUMBER',
        aggregateFieldMetadataId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
        aggregateOperation: AggregateOperations.COUNT,
      },
      objectMetadataId: companyObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_NEW_OVER_TIME,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
      ),
      title: 'New Customers Over Time',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 3, rowSpan: 6, columnSpan: 5 },
      configuration: {
        graphType: 'LINE',
        aggregateFieldMetadataId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
        aggregateOperation: AggregateOperations.COUNT,
        groupByFieldMetadataIdX: BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
        orderByX: 'FIELD_ASC',
      },
      objectMetadataId: companyObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_COMPANIES_BY_SIZE,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
      ),
      title: 'Companies by Size',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 8, rowSpan: 6, columnSpan: 4 },
      configuration: {
        graphType: 'BAR',
        aggregateFieldMetadataId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
        aggregateOperation: AggregateOperations.COUNT,
        groupByFieldMetadataIdX: COMPANY_STANDARD_FIELD_IDS.employees,
        orderByX: 'FIELD_ASC',
      },
      objectMetadataId: companyObject?.id ?? null,
    },

    // Customer Analytics Tab Widgets
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_ANNUAL_RECURRING_REVENUE,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_ANALYTICS,
      ),
      title: 'Annual Recurring Revenue',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
      configuration: {
        graphType: 'NUMBER',
        aggregateFieldMetadataId:
          COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
        aggregateOperation: AggregateOperations.SUM,
      },
      objectMetadataId: companyObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_REVENUE_DISTRIBUTION,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_ANALYTICS,
      ),
      title: 'Revenue Distribution',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 4, rowSpan: 2, columnSpan: 3 },
      configuration: {
        graphType: 'PIE',
        aggregateFieldMetadataId:
          COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
        aggregateOperation: AggregateOperations.SUM,
        groupByFieldMetadataId: COMPANY_STANDARD_FIELD_IDS.name,
        orderBy: 'VALUE_DESC',
      },
      objectMetadataId: companyObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_AVERAGE_ARR,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_ANALYTICS,
      ),
      title: 'Average ARR',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 7, rowSpan: 6, columnSpan: 5 },
      configuration: {
        graphType: 'GAUGE',
        aggregateFieldMetadataId:
          COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
        aggregateOperation: AggregateOperations.AVG,
        aggregateFieldMetadataIdTotal:
          COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
        aggregateOperationTotal: AggregateOperations.MAX,
      },
      objectMetadataId: companyObject?.id ?? null,
    },

    // Team Overview Tab Widgets
    {
      id: generateSeedId(workspaceId, PAGE_LAYOUT_WIDGET_SEEDS.TEAM_SIZE),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.TEAM_OVERVIEW,
      ),
      title: 'Team Size',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 0, rowSpan: 5, columnSpan: 6 },
      configuration: {
        graphType: 'NUMBER',
        aggregateFieldMetadataId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
        aggregateOperation: AggregateOperations.COUNT,
      },
      objectMetadataId: personObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.TEAM_GEOGRAPHIC_DISTRIBUTION,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.TEAM_OVERVIEW,
      ),
      title: 'Geographic Distribution',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 6, rowSpan: 5, columnSpan: 6 },
      configuration: {
        graphType: 'BAR',
        aggregateFieldMetadataId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
        aggregateOperation: AggregateOperations.COUNT,
        groupByFieldMetadataIdX: PERSON_STANDARD_FIELD_IDS.city,
        orderByX: 'FIELD_DESC',
      },
      objectMetadataId: personObject?.id ?? null,
    },

    // Team Metrics Tab Widgets
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.TEAM_CONTACT_ROLES,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.TEAM_METRICS,
      ),
      title: 'Contact Roles',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 6 },
      configuration: {
        graphType: 'PIE',
        aggregateFieldMetadataId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
        aggregateOperation: AggregateOperations.COUNT,
        groupByFieldMetadataId: PERSON_STANDARD_FIELD_IDS.jobTitle,
        orderBy: 'VALUE_DESC',
      },
      objectMetadataId: personObject?.id ?? null,
    },
    {
      id: generateSeedId(workspaceId, PAGE_LAYOUT_WIDGET_SEEDS.TEAM_OPEN_TASKS),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.TEAM_METRICS,
      ),
      title: 'Open Tasks',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 6, rowSpan: 6, columnSpan: 6 },
      configuration: {
        graphType: 'NUMBER',
        aggregateFieldMetadataId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
        aggregateOperation: AggregateOperations.COUNT,
      },
      objectMetadataId: taskObject?.id ?? null,
    },
  ];
};
