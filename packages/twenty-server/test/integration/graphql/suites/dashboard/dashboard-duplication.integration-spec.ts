import gql from 'graphql-tag';
import { TEST_NOT_EXISTING_DASHBOARD_ID } from 'test/integration/constants/test-dashboard-ids.constants';
import {
  TEST_IFRAME_CONFIG,
  TEST_PIE_CHART_CONFIG,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import {
  cleanupDashboardRecords,
  createTestDashboardWithGraphQL,
} from 'test/integration/graphql/utils/dashboard-graphql.util';
import { duplicateDashboardOperationFactory } from 'test/integration/graphql/utils/duplicate-dashboard-operation-factory.util';
import {
  assertGraphQLErrorResponse,
  assertGraphQLSuccessfulResponse,
} from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { findPageLayoutWithGraphQL } from 'test/integration/graphql/utils/page-layout-graphql.util';
import {
  createTestPageLayoutTabWithGraphQL,
  findPageLayoutTabsWithGraphQL,
  updateTestPageLayoutTabWithGraphQL,
} from 'test/integration/graphql/utils/page-layout-tab-graphql.util';
import { createTestPageLayoutWidgetWithGraphQL } from 'test/integration/graphql/utils/page-layout-widget-graphql.util';
import { cleanupPageLayoutRecords } from 'test/integration/utils/page-layout-test.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import {
  DashboardExceptionMessageKey,
  generateDashboardExceptionMessage,
} from 'src/modules/dashboard/exceptions/dashboard.exception';

describe('Dashboard Duplication', () => {
  afterAll(async () => {
    await cleanupDashboardRecords();
    await cleanupPageLayoutRecords();
  });

  beforeEach(async () => {
    await cleanupDashboardRecords();
    await cleanupPageLayoutRecords();
  });

  describe('duplicateDashboard mutation', () => {
    it('should duplicate a dashboard with page layout, tabs, and widgets', async () => {
      const originalDashboard = await createTestDashboardWithGraphQL({
        title: 'Original Dashboard',
        position: 1,
      });

      expect(originalDashboard.pageLayoutId).toBeDefined();

      const pageLayout = await findPageLayoutWithGraphQL(
        originalDashboard.pageLayoutId as string,
      );

      const existingTabs = await findPageLayoutTabsWithGraphQL(pageLayout.id);
      const existingTab = existingTabs[0];

      const tab1 = await updateTestPageLayoutTabWithGraphQL(existingTab.id, {
        title: 'Tab 1',
        position: 0,
      });

      const tab2 = await createTestPageLayoutTabWithGraphQL({
        title: 'Tab 2',
        position: 1,
        pageLayoutId: pageLayout.id,
      });

      await createTestPageLayoutWidgetWithGraphQL({
        title: 'Widget 1',
        type: WidgetType.GRAPH,
        pageLayoutTabId: tab1.id,
        gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
        configuration: TEST_PIE_CHART_CONFIG,
      });

      await createTestPageLayoutWidgetWithGraphQL({
        title: 'Widget 2',
        type: WidgetType.IFRAME,
        pageLayoutTabId: tab2.id,
        gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 2 },
        configuration: TEST_IFRAME_CONFIG,
      });

      const operation = duplicateDashboardOperationFactory({
        dashboardId: originalDashboard.id,
      });

      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLSuccessfulResponse(response);

      const duplicatedDashboard = response.body.data.duplicateDashboard;

      expect(duplicatedDashboard).toBeDefined();
      expect(duplicatedDashboard.id).not.toBe(originalDashboard.id);
      expect(duplicatedDashboard.title).toBe('Original Dashboard (Copy)');
      expect(duplicatedDashboard.pageLayoutId).not.toBe(pageLayout.id);
      expect(duplicatedDashboard.pageLayoutId).toBeDefined();
      expect(duplicatedDashboard.position).toBe(originalDashboard.position);

      const getPageLayoutOperation = {
        query: gql`
          query GetPageLayout($id: String!) {
            getPageLayout(id: $id) {
              id
              name
              type
              tabs {
                id
                title
                position
                widgets {
                  id
                  title
                  type
                  gridPosition {
                    row
                    column
                    rowSpan
                    columnSpan
                  }
                  configuration {
                    ... on PieChartConfiguration {
                      graphType
                      aggregateFieldMetadataId
                      aggregateOperation
                      groupByFieldMetadataId
                      orderBy
                      displayDataLabel
                      displayLegend
                      showCenterMetric
                      color
                      description
                      filter
                    }
                    ... on IframeConfiguration {
                      url
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          id: duplicatedDashboard.pageLayoutId,
        },
      };

      const pageLayoutResponse = await makeGraphqlAPIRequest(
        getPageLayoutOperation,
      );

      assertGraphQLSuccessfulResponse(pageLayoutResponse);

      const newPageLayout = pageLayoutResponse.body.data.getPageLayout;

      expect(newPageLayout).toBeDefined();
      expect(newPageLayout.id).not.toBe(pageLayout.id);
      expect(newPageLayout.name).toBe(pageLayout.name);
      expect(newPageLayout.type).toBe(PageLayoutType.DASHBOARD);
      expect(newPageLayout.tabs).toHaveLength(2);

      const sortedTabs = [...newPageLayout.tabs].sort(
        (tabA, tabB) => tabA.position - tabB.position,
      );

      expect(sortedTabs[0].title).toBe('Tab 1');
      expect(sortedTabs[0].widgets).toHaveLength(1);
      expect(sortedTabs[0].widgets[0].title).toBe('Widget 1');
      expect(sortedTabs[0].widgets[0].type).toBe(WidgetType.GRAPH);
      expect(sortedTabs[0].widgets[0].configuration).toEqual(
        TEST_PIE_CHART_CONFIG,
      );

      expect(sortedTabs[1].title).toBe('Tab 2');
      expect(sortedTabs[1].widgets).toHaveLength(1);
      expect(sortedTabs[1].widgets[0].title).toBe('Widget 2');
      expect(sortedTabs[1].widgets[0].type).toBe(WidgetType.IFRAME);
      expect(sortedTabs[1].widgets[0].gridPosition).toEqual({
        row: 0,
        column: 0,
        rowSpan: 2,
        columnSpan: 2,
      });
      expect(sortedTabs[1].widgets[0].configuration).toEqual(
        TEST_IFRAME_CONFIG,
      );
    });

    it('should throw error when dashboard does not exist', async () => {
      const operation = duplicateDashboardOperationFactory({
        dashboardId: TEST_NOT_EXISTING_DASHBOARD_ID,
      });

      const response = await makeGraphqlAPIRequest(operation);

      assertGraphQLErrorResponse(
        response,
        ErrorCode.NOT_FOUND,
        generateDashboardExceptionMessage(
          DashboardExceptionMessageKey.DASHBOARD_NOT_FOUND,
          TEST_NOT_EXISTING_DASHBOARD_ID,
        ),
      );
    });
  });
});
