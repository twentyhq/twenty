import { isNonEmptyString } from '@sniptt/guards';
import { TEST_IFRAME_CONFIG } from 'test/integration/constants/widget-configuration-test-data.constants';
import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { duplicateOneDashboard } from 'test/integration/metadata/suites/dashboard/utils/duplicate-one-dashboard.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

type TestContext = {
  id: string;
  title: string;
  withTabs?: boolean;
  withWidgets?: boolean;
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'duplicate a basic dashboard with page layout',
    context: {
      id: 'a69899ef-ad51-4abc-8105-45e8e6de85ac',
      title: 'Basic Dashboard',
    },
  },
  {
    title: 'duplicate a dashboard with page layout and tabs',
    context: {
      id: '8da0a29d-b459-4b09-af3e-9490d9b644b4',
      title: 'Dashboard With Tabs',
      withTabs: true,
    },
  },
  {
    title: 'duplicate a dashboard with page layout, tabs and widgets',
    context: {
      id: 'a13e58f9-c5db-4e1d-a7fb-c282774c5053',
      title: 'Dashboard With Widgets',
      withTabs: true,
      withWidgets: true,
    },
  },
];

describe('Dashboard duplication should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;
  let testPageLayoutWidgetId: string;
  let testDashboardId: string;
  let duplicatedDashboardId: string;
  let duplicatedPageLayoutId: string;
  let currentTestContextId: string;

  const cleanup = async () => {
    if (isNonEmptyString(duplicatedDashboardId)) {
      await destroyDashboardWithGraphQL(duplicatedDashboardId);
      duplicatedDashboardId = '';
    }

    if (isNonEmptyString(duplicatedPageLayoutId)) {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: duplicatedPageLayoutId },
      });
      duplicatedPageLayoutId = '';
    }

    if (isNonEmptyString(testPageLayoutWidgetId)) {
      await destroyOnePageLayoutWidget({
        expectToFail: false,
        input: { id: testPageLayoutWidgetId },
      });
      testPageLayoutWidgetId = '';
    }

    if (isNonEmptyString(testPageLayoutTabId)) {
      await destroyOnePageLayoutTab({
        expectToFail: false,
        input: { id: testPageLayoutTabId },
      });
      testPageLayoutTabId = '';
    }

    if (isNonEmptyString(testDashboardId)) {
      await destroyDashboardWithGraphQL(testDashboardId);
      testDashboardId = '';
    }

    if (isNonEmptyString(currentTestContextId)) {
      await destroyDashboardWithGraphQL(currentTestContextId);
      currentTestContextId = '';
    }

    if (isNonEmptyString(testPageLayoutId)) {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: testPageLayoutId },
      });
      testPageLayoutId = '';
    }
  };

  beforeEach(async () => {
    testPageLayoutId = '';
    testPageLayoutTabId = '';
    testPageLayoutWidgetId = '';
    testDashboardId = '';
    duplicatedDashboardId = '';
    duplicatedPageLayoutId = '';
    currentTestContextId = '';
  });

  afterEach(async () => {
    await cleanup();
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { id, title, withTabs, withWidgets } }) => {
      currentTestContextId = id;

      const { data: pageLayoutData } = await createOnePageLayout({
        expectToFail: false,
        input: {
          name: `Page Layout for ${title}`,
          type: PageLayoutType.DASHBOARD,
        },
      });

      testPageLayoutId = pageLayoutData.createPageLayout.id;

      if (withTabs) {
        const { data: tabData } = await createOnePageLayoutTab({
          expectToFail: false,
          input: {
            title: 'Test Tab',
            pageLayoutId: testPageLayoutId,
          },
        });

        testPageLayoutTabId = tabData.createPageLayoutTab.id;

        if (withWidgets) {
          const { data: widgetData } = await createOnePageLayoutWidget({
            expectToFail: false,
            input: {
              title: 'Test Widget',
              type: WidgetType.IFRAME,
              pageLayoutTabId: testPageLayoutTabId,
              gridPosition: {
                row: 0,
                column: 0,
                rowSpan: 1,
                columnSpan: 1,
              },
              configuration: TEST_IFRAME_CONFIG,
            },
          });

          testPageLayoutWidgetId = widgetData.createPageLayoutWidget.id;
        }
      }

      const dashboard = await createTestDashboardWithGraphQL({
        id,
        title,
        pageLayoutId: testPageLayoutId,
      });

      testDashboardId = dashboard.id;

      const { data } = await duplicateOneDashboard({
        expectToFail: false,
        input: { id: testDashboardId },
      });

      duplicatedDashboardId = data.duplicateDashboard.id;
      duplicatedPageLayoutId = data.duplicateDashboard.pageLayoutId ?? '';

      expect(data.duplicateDashboard).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.duplicateDashboard }),
      );

      expect(data.duplicateDashboard.id).not.toBe(testDashboardId);
      expect(data.duplicateDashboard.pageLayoutId).not.toBe(testPageLayoutId);
      expect(data.duplicateDashboard.title).toContain('(Copy)');
    },
  );
});
