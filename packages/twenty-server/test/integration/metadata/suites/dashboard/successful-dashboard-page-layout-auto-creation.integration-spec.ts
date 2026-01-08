import { isNonEmptyString } from '@sniptt/guards';
import {
  createManyDashboardsWithGraphQL,
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
  destroyManyDashboardsWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

describe('Dashboard page layout auto-creation should succeed', () => {
  describe('createOne dashboard without pageLayoutId', () => {
    let createdDashboardId: string;
    let createdPageLayoutId: string;

    beforeEach(() => {
      createdDashboardId = '';
      createdPageLayoutId = '';
    });

    afterEach(async () => {
      if (isNonEmptyString(createdDashboardId)) {
        await destroyDashboardWithGraphQL(createdDashboardId);
      }

      if (isNonEmptyString(createdPageLayoutId)) {
        await destroyOnePageLayout({
          expectToFail: false,
          input: { id: createdPageLayoutId },
        });
      }
    });

    it('should auto-create page layout and tab for dashboard without pageLayoutId', async () => {
      const title = 'Test Dashboard';
      const dashboard = await createTestDashboardWithGraphQL({ title });

      createdDashboardId = dashboard.id;
      createdPageLayoutId = dashboard.pageLayoutId ?? '';

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
    let createdPageLayoutIds: string[] = [];

    beforeEach(() => {
      createdDashboardIds = [];
      createdPageLayoutIds = [];
    });

    afterEach(async () => {
      if (createdDashboardIds.length > 0) {
        await destroyManyDashboardsWithGraphQL({
          id: { in: createdDashboardIds },
        });
      }

      for (const pageLayoutId of createdPageLayoutIds) {
        if (isNonEmptyString(pageLayoutId)) {
          await destroyOnePageLayout({
            expectToFail: false,
            input: { id: pageLayoutId },
          });
        }
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
      createdPageLayoutIds = dashboards
        .map((d) => d.pageLayoutId)
        .filter(isNonEmptyString);

      expect(dashboards.length).toBe(dashboardsData.length);

      const pageLayoutIds = new Set(createdPageLayoutIds);

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

    it('should not create page layouts for dashboards with existing pageLayoutId', async () => {
      const existingDashboard = await createTestDashboardWithGraphQL({
        title: 'Existing Dashboard',
      });

      createdDashboardIds.push(existingDashboard.id);
      createdPageLayoutIds.push(existingDashboard.pageLayoutId ?? '');

      const existingPageLayoutId = existingDashboard.pageLayoutId;

      expect(existingPageLayoutId).toBeDefined();

      const dashboardsData = [
        {
          title: 'Dashboard with existing layout',
          pageLayoutId: existingPageLayoutId ?? undefined,
        },
        { title: 'Dashboard without layout 1' },
        { title: 'Dashboard without layout 2' },
      ];

      const dashboards = await createManyDashboardsWithGraphQL(dashboardsData);

      createdDashboardIds.push(...dashboards.map((d) => d.id));

      const newPageLayoutIds = dashboards
        .map((d) => d.pageLayoutId)
        .filter(
          (id): id is string =>
            isNonEmptyString(id) && id !== existingPageLayoutId,
        );

      createdPageLayoutIds.push(...newPageLayoutIds);

      expect(dashboards.length).toBe(3);

      const dashboardWithExistingLayout = dashboards.find(
        (d) => d.pageLayoutId === existingPageLayoutId,
      );

      expect(dashboardWithExistingLayout).toBeDefined();
      expect(dashboardWithExistingLayout?.pageLayoutId).toBe(
        existingPageLayoutId,
      );

      const dashboardsWithNewLayouts = dashboards.filter(
        (d) => d.pageLayoutId !== existingPageLayoutId,
      );

      expect(dashboardsWithNewLayouts.length).toBe(2);

      for (const dashboard of dashboardsWithNewLayouts) {
        expect(dashboard.pageLayoutId).toBeDefined();
        expect(dashboard.pageLayoutId).not.toBe(existingPageLayoutId);
      }
    });
  });
});
