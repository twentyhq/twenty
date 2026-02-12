import { isNonEmptyString } from '@sniptt/guards';
import {
  createManyDashboardsWithGraphQL,
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
  destroyManyDashboardsWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe('Dashboard page layout auto-creation should succeed', () => {
  describe('createOne dashboard without pageLayoutId', () => {
    let createdDashboardId: string;

    beforeEach(() => {
      createdDashboardId = '';
    });

    afterEach(async () => {
      if (isNonEmptyString(createdDashboardId)) {
        await destroyDashboardWithGraphQL(createdDashboardId);
      }
    });

    it('should auto-create page layout and tab for dashboard without pageLayoutId', async () => {
      const title = 'Test Dashboard';
      const dashboard = await createTestDashboardWithGraphQL({ title });

      createdDashboardId = dashboard.id;

      expect(dashboard.id).toBeDefined();
      expect(dashboard.title).toBe(title);
      expect(dashboard.pageLayoutId).toBeDefined();
      expect(isNonEmptyString(dashboard.pageLayoutId)).toBe(true);

      const { data: pageLayoutData } = await findOnePageLayout({
        expectToFail: false,
        input: { id: dashboard.pageLayoutId! },
      });

      expect(pageLayoutData.getPageLayout).toBeDefined();
      expect(pageLayoutData.getPageLayout?.type).toBe(PageLayoutType.DASHBOARD);

      const { data: tabsData } = await findPageLayoutTabs({
        expectToFail: false,
        input: { pageLayoutId: dashboard.pageLayoutId! },
      });

      expect(tabsData.getPageLayoutTabs).toBeDefined();
      expect(tabsData.getPageLayoutTabs.length).toBeGreaterThanOrEqual(1);
      expect(tabsData.getPageLayoutTabs[0].title).toBe('Tab 1');
    });
  });

  describe('createMany dashboards without pageLayoutId', () => {
    let createdDashboardIds: string[] = [];

    beforeEach(() => {
      createdDashboardIds = [];
    });

    afterEach(async () => {
      if (createdDashboardIds.length > 0) {
        await destroyManyDashboardsWithGraphQL({
          id: { in: createdDashboardIds },
        });
      }
    });

    it('should auto-create separate page layouts for each dashboard in createMany', async () => {
      const dashboardsData = [
        { title: 'Dashboard 1' },
        { title: 'Dashboard 2' },
        { title: 'Dashboard 3' },
      ];

      const dashboards = await createManyDashboardsWithGraphQL(dashboardsData);

      createdDashboardIds = dashboards.map((d) => d.id);

      expect(dashboards.length).toBe(dashboardsData.length);

      const pageLayoutIds = new Set(
        dashboards.map((d) => d.pageLayoutId).filter(isNonEmptyString),
      );

      expect(pageLayoutIds.size).toBe(dashboardsData.length);

      for (const dashboard of dashboards) {
        expect(dashboard.pageLayoutId).toBeDefined();
        expect(isNonEmptyString(dashboard.pageLayoutId)).toBe(true);

        const { data: pageLayoutData } = await findOnePageLayout({
          expectToFail: false,
          input: { id: dashboard.pageLayoutId! },
        });

        expect(pageLayoutData.getPageLayout).toBeDefined();
        expect(pageLayoutData.getPageLayout?.type).toBe(
          PageLayoutType.DASHBOARD,
        );

        const { data: tabsData } = await findPageLayoutTabs({
          expectToFail: false,
          input: { pageLayoutId: dashboard.pageLayoutId! },
        });

        expect(tabsData.getPageLayoutTabs).toBeDefined();
        expect(tabsData.getPageLayoutTabs.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should use provided pageLayoutId for some dashboards and auto-create for others', async () => {
      const { data: pageLayoutData } = await createOnePageLayout({
        input: {
          name: 'Pre-existing page layout',
          type: PageLayoutType.DASHBOARD,
        },
        expectToFail: false,
      });

      const existingPageLayoutId = pageLayoutData.createPageLayout.id;

      expect(existingPageLayoutId).toBeDefined();

      const dashboardsData = [
        {
          title: 'Dashboard with provided layout',
          pageLayoutId: existingPageLayoutId,
        },
        { title: 'Dashboard without layout 1' },
        { title: 'Dashboard without layout 2' },
      ];

      const dashboards = await createManyDashboardsWithGraphQL(dashboardsData);

      createdDashboardIds = dashboards.map((d) => d.id);

      expect(dashboards.length).toBe(3);

      const dashboardWithProvidedLayout = dashboards.find(
        (d) => d.title === 'Dashboard with provided layout',
      );
      const dashboardsWithAutoCreatedLayout = dashboards.filter(
        (d) => d.title !== 'Dashboard with provided layout',
      );

      expect(dashboardWithProvidedLayout?.pageLayoutId).toBe(
        existingPageLayoutId,
      );

      for (const dashboard of dashboardsWithAutoCreatedLayout) {
        expect(dashboard.pageLayoutId).toBeDefined();
        expect(isNonEmptyString(dashboard.pageLayoutId)).toBe(true);
        expect(dashboard.pageLayoutId).not.toBe(existingPageLayoutId);
      }

      await destroyOnePageLayout({
        input: { id: existingPageLayoutId },
        expectToFail: false,
      });
    });
  });
});
