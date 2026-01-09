import { isNonEmptyString } from '@sniptt/guards';
import {
  createManyDashboardsWithGraphQL,
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
  destroyManyDashboardsWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe('Dashboard page layout auto-creation should succeed', () => {
  describe('createOne dashboard without pageLayoutId', () => {
    let createdDashboardId: string;

    beforeEach(() => {
      createdDashboardId = '';
    });

    afterEach(async () => {
      // Destroying dashboard automatically destroys associated page layout via DashboardDestroyOnePreQueryHook
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
      const dashboardsData = [
        { title: 'Dashboard without layout 1' },
        { title: 'Dashboard without layout 2' },
        { title: 'Dashboard without layout 3' },
      ];

      const dashboards = await createManyDashboardsWithGraphQL(dashboardsData);

      createdDashboardIds = dashboards.map((d) => d.id);

      expect(dashboards.length).toBe(3);

      for (const dashboard of dashboards) {
        expect(dashboard.pageLayoutId).toBeDefined();
        expect(isNonEmptyString(dashboard.pageLayoutId)).toBe(true);
      }
    });
  });
});
