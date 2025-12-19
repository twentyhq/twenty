import { CalendarStartDay } from 'twenty-shared/constants';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PAGE_LAYOUT_TAB_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-seeds.constant';
import { PAGE_LAYOUT_WIDGET_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-widget-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';
import { getPageLayoutWidgetDataSeedsV2 } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-widget-data-seeds-v2.util';

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
  isDashboardV2Enabled: boolean,
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
  const companyEmployeesFieldId = getFieldId(companyObject, 'employees');
  const companyArrFieldId = getFieldId(companyObject, 'annualRecurringRevenue');
  const companyLinkedinLinkFieldId = getFieldId(companyObject, 'linkedinLink');
  const companyAddressFieldId = getFieldId(companyObject, 'address');

  const personIdFieldId = getFieldId(personObject, 'id');
  const personCityFieldId = getFieldId(personObject, 'city');

  const opportunityIdFieldId = getFieldId(opportunityObject, 'id');

  const taskIdFieldId = getFieldId(taskObject, 'id');

  const rocketIdFieldId = getFieldId(rocketObject, 'id');
  const rocketCreatedAtFieldId = getFieldId(rocketObject, 'createdAt');

  const v1Widgets = [
    // Sales Overview Tab Widgets
    isDefined(opportunityAmountFieldId)
      ? {
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
            graphType: 'AGGREGATE',
            aggregateFieldMetadataId: opportunityAmountFieldId,
            aggregateOperation: AggregateOperations.SUM,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: opportunityObject?.id ?? null,
        }
      : null,
    isDefined(rocketIdFieldId)
      ? {
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
          configuration: {
            graphType: 'AGGREGATE',
            aggregateFieldMetadataId: rocketIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: rocketObject?.id ?? null,
        }
      : null,
    isDefined(opportunityAmountFieldId) &&
    isDefined(opportunityCloseDateFieldId) &&
    isDefined(opportunityStageFieldId)
      ? {
          id: generateSeedId(
            workspaceId,
            PAGE_LAYOUT_WIDGET_SEEDS.SALES_DEALS_BY_STAGE,
          ),
          pageLayoutTabId: generateSeedId(
            workspaceId,
            PAGE_LAYOUT_TAB_SEEDS.SALES_OVERVIEW,
          ),
          title: 'Pipeline Value by Close Date (Stacked by Stage)',
          type: WidgetType.GRAPH,
          gridPosition: { row: 4, column: 0, rowSpan: 8, columnSpan: 6 },
          configuration: {
            graphType: GraphType.VERTICAL_BAR,
            aggregateFieldMetadataId: opportunityAmountFieldId,
            aggregateOperation: AggregateOperations.SUM,
            primaryAxisGroupByFieldMetadataId: opportunityCloseDateFieldId,
            secondaryAxisGroupByFieldMetadataId: opportunityStageFieldId,
            primaryAxisOrderBy: 'FIELD_ASC',
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            color: 'auto',
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: opportunityObject?.id ?? null,
        }
      : null,

    // Sales Details Tab Widgets
    isDefined(rocketIdFieldId) && isDefined(rocketCreatedAtFieldId)
      ? {
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
          configuration: {
            graphType: GraphType.VERTICAL_BAR,
            aggregateFieldMetadataId: rocketIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: rocketCreatedAtFieldId,
            primaryAxisOrderBy: 'FIELD_ASC',
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            color: 'auto',
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: rocketObject?.id ?? null,
        }
      : null,
    isDefined(opportunityIdFieldId)
      ? {
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
            graphType: 'AGGREGATE',
            aggregateFieldMetadataId: opportunityIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: opportunityObject?.id ?? null,
        }
      : null,

    // Customer Overview Tab Widgets
    isDefined(companyIdFieldId)
      ? {
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
            graphType: 'AGGREGATE',
            aggregateFieldMetadataId: companyIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        }
      : null,
    isDefined(companyIdFieldId) &&
    isDefined(companyEmployeesFieldId) &&
    isDefined(companyAddressFieldId)
      ? {
          id: generateSeedId(
            workspaceId,
            PAGE_LAYOUT_WIDGET_SEEDS.CUSTOMER_COMPANIES_BY_SIZE,
          ),
          pageLayoutTabId: generateSeedId(
            workspaceId,
            PAGE_LAYOUT_TAB_SEEDS.CUSTOMER_OVERVIEW,
          ),
          title: 'Companies by Size (Stacked by City)',
          type: WidgetType.GRAPH,
          gridPosition: { row: 0, column: 8, rowSpan: 10, columnSpan: 8 },
          configuration: {
            graphType: GraphType.VERTICAL_BAR,
            aggregateFieldMetadataId: companyIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: companyEmployeesFieldId,
            secondaryAxisGroupByFieldMetadataId: companyAddressFieldId,
            secondaryAxisGroupBySubFieldName: 'addressCity',
            secondaryAxisGroupByDateGranularity: 'DAY',
            primaryAxisOrderBy: 'FIELD_ASC',
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            color: 'auto',
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        }
      : null,

    // Customer Analytics Tab Widgets
    isDefined(companyArrFieldId)
      ? {
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
            graphType: 'AGGREGATE',
            aggregateFieldMetadataId: companyArrFieldId,
            aggregateOperation: AggregateOperations.SUM,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        }
      : null,
    isDefined(companyLinkedinLinkFieldId)
      ? {
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
          configuration: {
            graphType: 'AGGREGATE',
            aggregateFieldMetadataId: companyLinkedinLinkFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        }
      : null,

    // Team Overview Tab Widgets
    isDefined(personIdFieldId)
      ? {
          id: generateSeedId(workspaceId, PAGE_LAYOUT_WIDGET_SEEDS.TEAM_SIZE),
          pageLayoutTabId: generateSeedId(
            workspaceId,
            PAGE_LAYOUT_TAB_SEEDS.TEAM_OVERVIEW,
          ),
          title: 'Team Size',
          type: WidgetType.GRAPH,
          gridPosition: { row: 0, column: 0, rowSpan: 5, columnSpan: 6 },
          configuration: {
            graphType: 'AGGREGATE',
            aggregateFieldMetadataId: personIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: personObject?.id ?? null,
        }
      : null,
    isDefined(personIdFieldId) && isDefined(personCityFieldId)
      ? {
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
            graphType: GraphType.VERTICAL_BAR,
            aggregateFieldMetadataId: personIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: personCityFieldId,
            primaryAxisOrderBy: 'VALUE_DESC',
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            color: 'auto',
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: personObject?.id ?? null,
        }
      : null,

    // Team Metrics Tab Widgets
    isDefined(taskIdFieldId)
      ? {
          id: generateSeedId(
            workspaceId,
            PAGE_LAYOUT_WIDGET_SEEDS.TEAM_OPEN_TASKS,
          ),
          pageLayoutTabId: generateSeedId(
            workspaceId,
            PAGE_LAYOUT_TAB_SEEDS.TEAM_METRICS,
          ),
          title: 'Open Tasks',
          type: WidgetType.GRAPH,
          gridPosition: { row: 0, column: 6, rowSpan: 6, columnSpan: 6 },
          configuration: {
            graphType: 'AGGREGATE',
            aggregateFieldMetadataId: taskIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: taskObject?.id ?? null,
        }
      : null,
  ].filter(isDefined);

  const v2Widgets = isDashboardV2Enabled
    ? getPageLayoutWidgetDataSeedsV2(workspaceId, objectMetadataItems)
    : [];

  return [...v1Widgets, ...v2Widgets];
};
