import { CalendarStartDay } from 'twenty-shared/constants';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PAGE_LAYOUT_TAB_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-tab-seeds.constant';
import { PAGE_LAYOUT_WIDGET_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-widget-seeds.constant';
import { type SeederFlatPageLayoutWidget } from 'src/engine/workspace-manager/dev-seeder/core/types/seeder-flat-page-layout-widget.type';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

const getFieldId = (
  object: ObjectMetadataEntity | undefined,
  fieldName: string,
): string | undefined => {
  return object?.fields?.find((field) => field.name === fieldName)?.id;
};

export const getPageLayoutWidgetDataSeedsV2 = (
  workspaceId: string,
  objectMetadataItems: ObjectMetadataEntity[],
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
    isDefined(opportunityAmountFieldId) &&
    isDefined(opportunityCloseDateFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.LINE_CHART,
            aggregateFieldMetadataId: opportunityAmountFieldId,
            aggregateOperation: AggregateOperations.SUM,
            primaryAxisGroupByFieldMetadataId: opportunityCloseDateFieldId,
            primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: opportunityObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // LINE chart: New Customers Over Time (Customer Overview)
    isDefined(companyIdFieldId) && isDefined(companyCreatedAtFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.LINE_CHART,
            aggregateFieldMetadataId: companyIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId: companyCreatedAtFieldId,
            primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
            axisNameDisplay: AxisNameDisplay.NONE,
            displayDataLabel: false,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // PIE chart: Revenue Distribution (Customer Analytics)
    isDefined(companyArrFieldId) && isDefined(companyNameFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.PIE_CHART,
            aggregateFieldMetadataId: companyArrFieldId,
            aggregateOperation: AggregateOperations.SUM,
            groupByFieldMetadataId: companyNameFieldId,
            orderBy: GraphOrderBy.VALUE_DESC,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // GAUGE chart: Average ARR (Customer Analytics)
    isDefined(companyArrFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.GAUGE_CHART,
            aggregateFieldMetadataId: companyArrFieldId,
            aggregateOperation: AggregateOperations.AVG,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // PIE chart: Companies by LinkedIn (Customer Overview)
    isDefined(companyIdFieldId) && isDefined(companyLinkedinLinkFieldId)
      ? ({
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
          configuration: {
            configurationType: WidgetConfigurationType.PIE_CHART,
            aggregateFieldMetadataId: companyIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            groupByFieldMetadataId: companyLinkedinLinkFieldId,
            orderBy: GraphOrderBy.VALUE_DESC,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: companyObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,

    // PIE chart: Contact Roles (Team Metrics)
    isDefined(personIdFieldId) && isDefined(personJobTitleFieldId)
      ? ({
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
            configurationType: WidgetConfigurationType.PIE_CHART,
            aggregateFieldMetadataId: personIdFieldId,
            aggregateOperation: AggregateOperations.COUNT,
            groupByFieldMetadataId: personJobTitleFieldId,
            orderBy: GraphOrderBy.VALUE_DESC,
            displayDataLabel: true,
            timezone: 'UTC',
            firstDayOfTheWeek: CalendarStartDay.MONDAY,
          },
          objectMetadataId: personObject?.id ?? null,
        } satisfies SeederFlatPageLayoutWidget)
      : null,
  ].filter(isDefined);
};
