import { CalendarStartDay } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { AxisNameDisplay } from 'src/engine/core-modules/page-layout/enums/axis-name-display.enum';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PAGE_LAYOUT_TAB_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-seeds.constant';
import { PAGE_LAYOUT_WIDGET_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-widget-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

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

export const getPageLayoutWidgetDataSeedsV2 = (
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

  const opportunityAmountFieldId = getFieldId(opportunityObject, 'amount');
  const opportunityCloseDateFieldId = getFieldId(
    opportunityObject,
    'closeDate',
  );

  const companyIdFieldId = getFieldId(companyObject, 'id');
  const companyCreatedAtFieldId = getFieldId(companyObject, 'createdAt');
  const companyArrFieldId = getFieldId(companyObject, 'annualRecurringRevenue');
  const companyNameFieldId = getFieldId(companyObject, 'name');
  const companyLinkedinLinkFieldId = getFieldId(companyObject, 'linkedinLink');

  const personIdFieldId = getFieldId(personObject, 'id');
  const personJobTitleFieldId = getFieldId(personObject, 'jobTitle');

  return [
    // LINE chart: Revenue Forecast (Sales Overview)
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
              primaryAxisGroupByFieldMetadataId: opportunityCloseDateFieldId,
              primaryAxisOrderBy: 'FIELD_ASC',
              axisNameDisplay: AxisNameDisplay.NONE,
              displayDataLabel: false,
              timezone: 'UTC',
              firstDayOfTheWeek: CalendarStartDay.MONDAY,
            }
          : null,
      objectMetadataId: opportunityObject?.id ?? null,
    },

    // LINE chart: New Customers Over Time (Customer Overview)
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
              primaryAxisGroupByFieldMetadataId: companyCreatedAtFieldId,
              primaryAxisOrderBy: 'FIELD_ASC',
              axisNameDisplay: AxisNameDisplay.NONE,
              displayDataLabel: false,
              timezone: 'UTC',
              firstDayOfTheWeek: CalendarStartDay.MONDAY,
            }
          : null,
      objectMetadataId: companyObject?.id ?? null,
    },

    // PIE chart: Revenue Distribution (Customer Analytics)
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
              displayDataLabel: true,
              timezone: 'UTC',
              firstDayOfTheWeek: CalendarStartDay.MONDAY,
            }
          : null,
      objectMetadataId: companyObject?.id ?? null,
    },

    // WAFFLE chart: Revenue Distribution (Customer Analytics)
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
              graphType: 'WAFFLE',
              aggregateFieldMetadataId: companyArrFieldId,
              aggregateOperation: AggregateOperations.SUM,
              groupByFieldMetadataId: companyNameFieldId,
              orderBy: 'VALUE_DESC',
              displayDataLabel: true,
              timezone: 'UTC',
              firstDayOfTheWeek: CalendarStartDay.MONDAY,
            }
          : null,
      objectMetadataId: companyObject?.id ?? null,
    },
	
    // GAUGE chart: Average ARR (Customer Analytics)
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
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          }
        : null,
      objectMetadataId: companyObject?.id ?? null,
    },

    // PIE chart: Companies by LinkedIn (Customer Overview)
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
              displayDataLabel: true,
              timezone: 'UTC',
              firstDayOfTheWeek: CalendarStartDay.MONDAY,
            }
          : null,
      objectMetadataId: companyObject?.id ?? null,
    },

    // PIE chart: Contact Roles (Team Metrics)
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
              displayDataLabel: true,
              timezone: 'UTC',
              firstDayOfTheWeek: CalendarStartDay.MONDAY,
            }
          : null,
      objectMetadataId: personObject?.id ?? null,
    },
  ];
};
