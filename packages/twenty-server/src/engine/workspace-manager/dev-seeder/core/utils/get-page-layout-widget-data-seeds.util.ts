import { isDefined } from 'twenty-shared/utils';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PAGE_LAYOUT_TAB_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-seeds.constant';
import { PAGE_LAYOUT_WIDGET_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-widget-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';
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

const getFieldId = (
  object: ObjectMetadataEntity | undefined,
  fieldName: string,
): string | undefined => {
  return object?.fields?.find((field) => field.name === fieldName)?.id;
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

  const opportunityAmountFieldId = getFieldId(opportunityObject, 'amount');
  const opportunityCloseDateFieldId = getFieldId(
    opportunityObject,
    'closeDate',
  );
  const opportunityStageFieldId = getFieldId(opportunityObject, 'stage');

  const companyIdFieldId = getFieldId(companyObject, 'id');
  const companyCreatedAtFieldId = getFieldId(companyObject, 'createdAt');
  const companyEmployeesFieldId = getFieldId(companyObject, 'employees');
  const companyArrFieldId = getFieldId(companyObject, 'annualRecurringRevenue');
  const companyNameFieldId = getFieldId(companyObject, 'name');
  const companyLinkedinLinkFieldId = getFieldId(companyObject, 'linkedinLink');

  const personIdFieldId = getFieldId(personObject, 'id');
  const personCityFieldId = getFieldId(personObject, 'city');
  const personJobTitleFieldId = getFieldId(personObject, 'jobTitle');

  const opportunityIdFieldId = getFieldId(opportunityObject, 'id');

  const taskIdFieldId = getFieldId(taskObject, 'id');

  const rocketIdFieldId = getFieldId(rocketObject, 'id');
  const rocketCreatedAtFieldId = getFieldId(rocketObject, 'createdAt');

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
      configuration: isDefined(opportunityAmountFieldId)
        ? {
            graphType: 'NUMBER',
            aggregateFieldMetadataId: opportunityAmountFieldId,
            aggregateOperation: AggregateOperations.SUM,
          }
        : null,
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
      title: 'Rocket Count (Object Permission Test)',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 3, rowSpan: 4, columnSpan: 4 },
      configuration: isDefined(rocketIdFieldId)
        ? {
            graphType: 'NUMBER',
            aggregateFieldMetadataId: rocketIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
          }
        : null,
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
      configuration:
        isDefined(opportunityAmountFieldId) &&
        isDefined(opportunityCloseDateFieldId)
          ? {
              graphType: 'LINE',
              aggregateFieldMetadataId: opportunityAmountFieldId,
              aggregateOperation: AggregateOperations.SUM,
              groupByFieldMetadataIdX: opportunityCloseDateFieldId,
              orderByX: 'FIELD_ASC',
            }
          : null,
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
      configuration:
        isDefined(opportunityAmountFieldId) &&
        isDefined(opportunityStageFieldId)
          ? {
              graphType: 'BAR',
              aggregateFieldMetadataId: opportunityAmountFieldId,
              aggregateOperation: AggregateOperations.SUM,
              groupByFieldMetadataIdX: opportunityStageFieldId,
              orderByX: 'FIELD_DESC',
            }
          : null,
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
      title: 'Rockets by Created Date (Object Permission Test)',
      type: WidgetType.GRAPH,
      gridPosition: { row: 0, column: 0, rowSpan: 5, columnSpan: 5 },
      configuration:
        isDefined(rocketIdFieldId) && isDefined(rocketCreatedAtFieldId)
          ? {
              graphType: 'BAR',
              aggregateFieldMetadataId: rocketIdFieldId,
              aggregateOperation: AggregateOperations.COUNT,
              groupByFieldMetadataIdX: rocketCreatedAtFieldId,
              orderByX: 'FIELD_ASC',
            }
          : null,
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
      configuration: isDefined(opportunityIdFieldId)
        ? {
            graphType: 'NUMBER',
            aggregateFieldMetadataId: opportunityIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
          }
        : null,
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
      configuration: isDefined(companyIdFieldId)
        ? {
            graphType: 'NUMBER',
            aggregateFieldMetadataId: companyIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
          }
        : null,
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
      configuration:
        isDefined(companyIdFieldId) && isDefined(companyCreatedAtFieldId)
          ? {
              graphType: 'LINE',
              aggregateFieldMetadataId: companyIdFieldId,
              aggregateOperation: AggregateOperations.COUNT,
              groupByFieldMetadataIdX: companyCreatedAtFieldId,
              orderByX: 'FIELD_ASC',
            }
          : null,
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
      configuration:
        isDefined(companyIdFieldId) && isDefined(companyEmployeesFieldId)
          ? {
              graphType: 'BAR',
              aggregateFieldMetadataId: companyIdFieldId,
              aggregateOperation: AggregateOperations.COUNT,
              groupByFieldMetadataIdX: companyEmployeesFieldId,
              orderByX: 'FIELD_ASC',
            }
          : null,
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
      configuration: isDefined(companyArrFieldId)
        ? {
            graphType: 'NUMBER',
            aggregateFieldMetadataId: companyArrFieldId,
            aggregateOperation: AggregateOperations.SUM,
          }
        : null,
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
      configuration:
        isDefined(companyArrFieldId) && isDefined(companyNameFieldId)
          ? {
              graphType: 'PIE',
              aggregateFieldMetadataId: companyArrFieldId,
              aggregateOperation: AggregateOperations.SUM,
              groupByFieldMetadataId: companyNameFieldId,
              orderBy: 'VALUE_DESC',
            }
          : null,
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
      configuration: isDefined(companyArrFieldId)
        ? {
            graphType: 'GAUGE',
            aggregateFieldMetadataId: companyArrFieldId,
            aggregateOperation: AggregateOperations.AVG,
            aggregateFieldMetadataIdTotal: companyArrFieldId,
            aggregateOperationTotal: AggregateOperations.MAX,
          }
        : null,
      objectMetadataId: companyObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_LINKEDIN_COUNT,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
      ),
      title: 'LinkedIn Profiles Count (Field Permission Test)',
      type: WidgetType.GRAPH,
      gridPosition: { row: 2, column: 0, rowSpan: 4, columnSpan: 3 },
      configuration: isDefined(companyLinkedinLinkFieldId)
        ? {
            graphType: 'NUMBER',
            aggregateFieldMetadataId: companyLinkedinLinkFieldId,
            aggregateOperation: AggregateOperations.COUNT,
          }
        : null,
      objectMetadataId: companyObject?.id ?? null,
    },
    {
      id: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_LINKEDIN_DISTRIBUTION,
      ),
      pageLayoutTabId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
      ),
      title: 'Companies by LinkedIn (Field Permission Test)',
      type: WidgetType.GRAPH,
      gridPosition: { row: 6, column: 0, rowSpan: 4, columnSpan: 6 },
      configuration:
        isDefined(companyIdFieldId) && isDefined(companyLinkedinLinkFieldId)
          ? {
              graphType: 'PIE',
              aggregateFieldMetadataId: companyIdFieldId,
              aggregateOperation: AggregateOperations.COUNT,
              groupByFieldMetadataId: companyLinkedinLinkFieldId,
              orderBy: 'VALUE_DESC',
            }
          : null,
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
      configuration: isDefined(personIdFieldId)
        ? {
            graphType: 'NUMBER',
            aggregateFieldMetadataId: personIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
          }
        : null,
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
      configuration:
        isDefined(personIdFieldId) && isDefined(personCityFieldId)
          ? {
              graphType: 'BAR',
              aggregateFieldMetadataId: personIdFieldId,
              aggregateOperation: AggregateOperations.COUNT,
              groupByFieldMetadataIdX: personCityFieldId,
              orderByX: 'FIELD_DESC',
            }
          : null,
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
      configuration:
        isDefined(personIdFieldId) && isDefined(personJobTitleFieldId)
          ? {
              graphType: 'PIE',
              aggregateFieldMetadataId: personIdFieldId,
              aggregateOperation: AggregateOperations.COUNT,
              groupByFieldMetadataId: personJobTitleFieldId,
              orderBy: 'VALUE_DESC',
            }
          : null,
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
      configuration: isDefined(taskIdFieldId)
        ? {
            graphType: 'NUMBER',
            aggregateFieldMetadataId: taskIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
          }
        : null,
      objectMetadataId: taskObject?.id ?? null,
    },
  ];
};
