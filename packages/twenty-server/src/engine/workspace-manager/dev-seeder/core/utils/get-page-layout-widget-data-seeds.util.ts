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
import { PAGE_LAYOUT_TAB_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-seeds.constant';
import { PAGE_LAYOUT_WIDGET_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-widget-seeds.constant';
import { type SeederFlatPageLayoutWidget } from 'src/engine/workspace-manager/dev-seeder/core/types/seeder-flat-page-layout-widget.type';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';
import { getPageLayoutWidgetDataSeedsV2 } from 'src/engine/workspace-manager/dev-seeder/core/utils/get-page-layout-widget-data-seeds-v2.util';

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
): SeederFlatPageLayoutWidget[] => {
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

  const v1Widgets: SeederFlatPageLayoutWidget[] = [
    // Sales Overview Tab Widgets
    isDefined(opportunityAmountFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: opportunityAmountFieldId,
            aggregateOperation: AggregateOperations.SUM,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: opportunityObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,
    isDefined(rocketIdFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: rocketIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: rocketObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,
    isDefined(opportunityAmountFieldId) &&
    isDefined(opportunityCloseDateFieldId) &&
    isDefined(opportunityStageFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: opportunityAmountFieldId,
            aggregateOperation: AggregateOperations.SUM,
            primaryAxisGroupByFieldMetadataId: opportunityCloseDateFieldId,
            secondaryAxisGroupByFieldMetadataId: opportunityStageFieldId,
            primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            color: 'auto',
            layout: BarChartLayout.VERTICAL,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: opportunityObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // Sales Details Tab Widgets
    isDefined(rocketIdFieldId) && isDefined(rocketCreatedAtFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: rocketIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: rocketCreatedAtFieldId,
            primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            color: 'auto',
            layout: BarChartLayout.VERTICAL,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: rocketObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,
    isDefined(opportunityIdFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: opportunityIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: opportunityObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // Customer Overview Tab Widgets
    isDefined(companyIdFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: companyIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,
    isDefined(companyIdFieldId) &&
    isDefined(companyEmployeesFieldId) &&
    isDefined(companyAddressFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: companyIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: companyEmployeesFieldId,
            secondaryAxisGroupByFieldMetadataId: companyAddressFieldId,
            secondaryAxisGroupBySubFieldName: 'addressCity',
            secondaryAxisGroupByDateGranularity:
              ObjectRecordGroupByDateGranularity.DAY,
            primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            color: 'auto',
            layout: BarChartLayout.VERTICAL,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // Customer Analytics Tab Widgets
    isDefined(companyArrFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: companyArrFieldId,
            aggregateOperation: AggregateOperations.SUM,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,
    isDefined(companyLinkedinLinkFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: companyLinkedinLinkFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // Team Overview Tab Widgets
    isDefined(personIdFieldId)
      ? ({
          id: generateSeedId(workspaceId, PAGE_LAYOUT_WIDGET_SEEDS.TEAM_SIZE),
          pageLayoutTabId: generateSeedId(
            workspaceId,
            PAGE_LAYOUT_TAB_SEEDS.TEAM_OVERVIEW,
          ),
          title: 'Team Size',
          type: WidgetType.GRAPH,
          gridPosition: { row: 0, column: 0, rowSpan: 5, columnSpan: 6 },
          configuration: {
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: personIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: personObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,
    isDefined(personIdFieldId) && isDefined(personCityFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.BAR_CHART,
            aggregateFieldMetadataId: personIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: personCityFieldId,
            primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            color: 'auto',
            layout: BarChartLayout.VERTICAL,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: personObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // Team Metrics Tab Widgets
    isDefined(taskIdFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: taskIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: taskObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,
  ].filter(isDefined);

  const v2Widgets = isDashboardV2Enabled
    ? getPageLayoutWidgetDataSeedsV2(workspaceId, objectMetadataItems)
    : [];

  return [...v1Widgets, ...v2Widgets];
};
