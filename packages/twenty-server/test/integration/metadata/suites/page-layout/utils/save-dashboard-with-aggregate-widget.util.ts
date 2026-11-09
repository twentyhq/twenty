import gql from 'graphql-tag';
import { PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/constants/page-layout-with-dashboard-filter-bindings-gql-fields.constant';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import {
  AggregateOperations,
  type ChartFilter,
  type PageLayoutFilter,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';

export const saveDashboardWithAggregateWidget = async ({
  pageLayoutId,
  pageLayoutType = PageLayoutType.DASHBOARD,
  tabId,
  widgetId,
  objectMetadataId,
  aggregateFieldMetadataId,
  filters,
  chartFilter,
  dashboardFilterBindings,
  expectToFail = false,
}: {
  pageLayoutId: string;
  pageLayoutType?: PageLayoutType;
  tabId: string;
  widgetId: string;
  objectMetadataId: string;
  aggregateFieldMetadataId: string;
  filters?: PageLayoutFilter[] | null;
  chartFilter?: ChartFilter;
  dashboardFilterBindings: unknown;
  expectToFail?: boolean;
}): CommonResponseBody<{
  updatePageLayoutWithTabsAndWidgets: PageLayoutDTO;
}> => {
  const response = await makeMetadataApiRequest({
    query: gql`
      mutation UpdatePageLayoutWithTabsAndWidgets($id: String!, $input: UpdatePageLayoutWithTabsInput!) {
        updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
          ${PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS}
        }
      }
    `,
    variables: {
      id: pageLayoutId,
      input: {
        name: 'Dashboard With Filter Bindings',
        type: pageLayoutType,
        objectMetadataId: null,
        filters,
        tabs: [
          {
            id: tabId,
            title: 'Tab 1',
            position: 0,
            widgets: [
              {
                id: widgetId,
                pageLayoutTabId: tabId,
                title: 'Companies',
                type: WidgetType.GRAPH,
                objectMetadataId,
                position: {
                  layoutMode: PageLayoutTabLayoutMode.GRID,
                  row: 0,
                  column: 0,
                  rowSpan: 2,
                  columnSpan: 2,
                },
                configuration: {
                  configurationType: WidgetConfigurationType.AGGREGATE_CHART,
                  aggregateFieldMetadataId,
                  aggregateOperation: AggregateOperations.COUNT,
                  filter: chartFilter,
                  dashboardFilterBindings,
                },
              },
            ],
          },
        ],
      },
    },
  });

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Dashboard save should have failed but did not',
    });
  } else {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Dashboard save has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
