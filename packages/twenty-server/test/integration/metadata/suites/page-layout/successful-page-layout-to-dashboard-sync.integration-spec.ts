import { isNonEmptyString } from '@sniptt/guards';
import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
  findDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { deleteOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/delete-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { restoreOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/restore-one-page-layout.util';

describe('Page Layout to Dashboard sync should succeed', () => {
  describe('delete DASHBOARD-type page layout', () => {
    let dashboardId: string;
    let pageLayoutId: string;

    beforeEach(() => {
      dashboardId = '';
      pageLayoutId = '';
    });

    afterEach(async () => {
      if (isNonEmptyString(pageLayoutId)) {
        await destroyOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });
      }
    });

    it('should soft delete linked dashboard when DASHBOARD-type page layout is soft deleted', async () => {
      const dashboard = await createTestDashboardWithGraphQL({
        title: 'Dashboard for Page Layout Delete Test',
      });

      dashboardId = dashboard.id;
      pageLayoutId = dashboard.pageLayoutId ?? '';

      expect(pageLayoutId).toBeDefined();
      expect(isNonEmptyString(pageLayoutId)).toBe(true);

      const dashboardBefore = await findDashboardWithGraphQL(dashboardId);

      expect(dashboardBefore).toBeDefined();

      await deleteOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });

      const dashboardAfter = await findDashboardWithGraphQL(dashboardId);

      expect(dashboardAfter).toBeNull();
    });
  });

  describe('restore DASHBOARD-type page layout', () => {
    let dashboardId: string;
    let pageLayoutId: string;

    beforeEach(() => {
      dashboardId = '';
      pageLayoutId = '';
    });

    afterEach(async () => {
      if (isNonEmptyString(dashboardId)) {
        await destroyDashboardWithGraphQL(dashboardId);
      }

      if (isNonEmptyString(pageLayoutId)) {
        await destroyOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });
      }
    });

    it('should restore linked dashboard when DASHBOARD-type page layout is restored', async () => {
      const dashboard = await createTestDashboardWithGraphQL({
        title: 'Dashboard for Page Layout Restore Test',
      });

      dashboardId = dashboard.id;
      pageLayoutId = dashboard.pageLayoutId ?? '';

      expect(pageLayoutId).toBeDefined();

      await deleteOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });

      const dashboardAfterDelete = await findDashboardWithGraphQL(dashboardId);

      expect(dashboardAfterDelete).toBeNull();

      await restoreOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });

      const dashboardAfterRestore = await findDashboardWithGraphQL(dashboardId);

      expect(dashboardAfterRestore).toBeDefined();
    });
  });

  describe('destroy DASHBOARD-type page layout', () => {
    let pageLayoutId: string;

    beforeEach(() => {
      pageLayoutId = '';
    });

    afterEach(async () => {
      if (isNonEmptyString(pageLayoutId)) {
        await destroyOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });
        pageLayoutId = '';
      }
    });

    it('should hard delete linked dashboard when DASHBOARD-type page layout is destroyed', async () => {
      const dashboard = await createTestDashboardWithGraphQL({
        title: 'Dashboard for Page Layout Destroy Test',
      });

      const dashboardId = dashboard.id;

      pageLayoutId = dashboard.pageLayoutId ?? '';

      expect(pageLayoutId).toBeDefined();

      const dashboardBefore = await findDashboardWithGraphQL(dashboardId);

      expect(dashboardBefore).toBeDefined();

      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });

      pageLayoutId = '';

      const dashboardAfter = await findDashboardWithGraphQL(dashboardId);

      expect(dashboardAfter).toBeNull();
    });
  });
});
