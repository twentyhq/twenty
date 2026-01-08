import { isNonEmptyString } from '@sniptt/guards';
import {
  createManyDashboardsWithGraphQL,
  createTestDashboardWithGraphQL,
  deleteDashboardWithGraphQL,
  deleteManyDashboardsWithGraphQL,
  destroyDashboardWithGraphQL,
  destroyManyDashboardsWithGraphQL,
  restoreDashboardWithGraphQL,
  restoreManyDashboardsWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';
import { restoreOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/restore-one-page-layout.util';

describe('Dashboard to Page Layout sync should succeed', () => {
  describe('deleteOne dashboard', () => {
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

    it('should soft delete linked page layout when dashboard is soft deleted', async () => {
      const dashboard = await createTestDashboardWithGraphQL({
        title: 'Dashboard for Delete Test',
      });

      dashboardId = dashboard.id;
      pageLayoutId = dashboard.pageLayoutId ?? '';

      expect(pageLayoutId).toBeDefined();
      expect(isNonEmptyString(pageLayoutId)).toBe(true);

      const { data: beforeData } = await findOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });

      expect(beforeData.getPageLayout).toBeDefined();

      await deleteDashboardWithGraphQL(dashboardId);

      const { errors } = await findOnePageLayout({
        expectToFail: true,
        input: { id: pageLayoutId },
      });

      expect(errors).toBeDefined();
    });
  });

  describe('deleteMany dashboards', () => {
    let dashboardIds: string[] = [];
    let pageLayoutIds: string[] = [];

    beforeEach(() => {
      dashboardIds = [];
      pageLayoutIds = [];
    });

    afterEach(async () => {
      for (const pageLayoutId of pageLayoutIds) {
        if (isNonEmptyString(pageLayoutId)) {
          await destroyOnePageLayout({
            expectToFail: false,
            input: { id: pageLayoutId },
          });
        }
      }
    });

    it('should soft delete all linked page layouts when multiple dashboards are soft deleted', async () => {
      const dashboardsData = [
        { title: 'Dashboard 1 for Delete Many Test' },
        { title: 'Dashboard 2 for Delete Many Test' },
      ];

      const dashboards = await createManyDashboardsWithGraphQL(dashboardsData);

      dashboardIds = dashboards.map((d) => d.id);
      pageLayoutIds = dashboards
        .map((d) => d.pageLayoutId)
        .filter(isNonEmptyString);

      expect(pageLayoutIds.length).toBe(dashboardsData.length);

      for (const pageLayoutId of pageLayoutIds) {
        const { data } = await findOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });

        expect(data.getPageLayout).toBeDefined();
      }

      await deleteManyDashboardsWithGraphQL({
        id: { in: dashboardIds },
      });

      for (const pageLayoutId of pageLayoutIds) {
        const { errors } = await findOnePageLayout({
          expectToFail: true,
          input: { id: pageLayoutId },
        });

        expect(errors).toBeDefined();
      }
    });
  });

  describe('restoreOne dashboard', () => {
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

    it('should restore linked page layout when dashboard is restored', async () => {
      const dashboard = await createTestDashboardWithGraphQL({
        title: 'Dashboard for Restore Test',
      });

      dashboardId = dashboard.id;
      pageLayoutId = dashboard.pageLayoutId ?? '';

      expect(pageLayoutId).toBeDefined();

      await deleteDashboardWithGraphQL(dashboardId);

      const { errors: deleteErrors } = await findOnePageLayout({
        expectToFail: true,
        input: { id: pageLayoutId },
      });

      expect(deleteErrors).toBeDefined();

      await restoreDashboardWithGraphQL(dashboardId);

      const { data } = await findOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });

      expect(data.getPageLayout).toBeDefined();
    });
  });

  describe('restoreMany dashboards', () => {
    let dashboardIds: string[] = [];
    let pageLayoutIds: string[] = [];

    beforeEach(() => {
      dashboardIds = [];
      pageLayoutIds = [];
    });

    afterEach(async () => {
      if (dashboardIds.length > 0) {
        await destroyManyDashboardsWithGraphQL({
          id: { in: dashboardIds },
        });
      }

      for (const pageLayoutId of pageLayoutIds) {
        if (isNonEmptyString(pageLayoutId)) {
          await destroyOnePageLayout({
            expectToFail: false,
            input: { id: pageLayoutId },
          });
        }
      }
    });

    it('should restore all linked page layouts when multiple dashboards are restored', async () => {
      const dashboardsData = [
        { title: 'Dashboard 1 for Restore Many Test' },
        { title: 'Dashboard 2 for Restore Many Test' },
      ];

      const dashboards = await createManyDashboardsWithGraphQL(dashboardsData);

      dashboardIds = dashboards.map((d) => d.id);
      pageLayoutIds = dashboards
        .map((d) => d.pageLayoutId)
        .filter(isNonEmptyString);

      expect(pageLayoutIds.length).toBe(dashboardsData.length);

      await deleteManyDashboardsWithGraphQL({
        id: { in: dashboardIds },
      });

      for (const pageLayoutId of pageLayoutIds) {
        const { errors } = await findOnePageLayout({
          expectToFail: true,
          input: { id: pageLayoutId },
        });

        expect(errors).toBeDefined();
      }

      await restoreManyDashboardsWithGraphQL({
        id: { in: dashboardIds },
      });

      for (const pageLayoutId of pageLayoutIds) {
        const { data } = await findOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });

        expect(data.getPageLayout).toBeDefined();
      }
    });
  });

  describe('destroyOne dashboard', () => {
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

    it('should hard delete linked page layout when dashboard is destroyed', async () => {
      const dashboard = await createTestDashboardWithGraphQL({
        title: 'Dashboard for Destroy Test',
      });

      pageLayoutId = dashboard.pageLayoutId ?? '';

      expect(pageLayoutId).toBeDefined();

      const { data: beforeData } = await findOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });

      expect(beforeData.getPageLayout).toBeDefined();

      await destroyDashboardWithGraphQL(dashboard.id);

      const { errors } = await findOnePageLayout({
        expectToFail: true,
        input: { id: pageLayoutId },
      });

      expect(errors).toBeDefined();

      const { errors: restoreErrors } = await restoreOnePageLayout({
        expectToFail: true,
        input: { id: pageLayoutId },
      });

      expect(restoreErrors).toBeDefined();

      pageLayoutId = '';
    });
  });

  describe('destroyMany dashboards', () => {
    let pageLayoutIds: string[] = [];

    beforeEach(() => {
      pageLayoutIds = [];
    });

    afterEach(async () => {
      for (const pageLayoutId of pageLayoutIds) {
        if (isNonEmptyString(pageLayoutId)) {
          await destroyOnePageLayout({
            expectToFail: false,
            input: { id: pageLayoutId },
          });
        }
      }
      pageLayoutIds = [];
    });

    it('should hard delete all linked page layouts when multiple dashboards are destroyed', async () => {
      const dashboardsData = [
        { title: 'Dashboard 1 for Destroy Many Test' },
        { title: 'Dashboard 2 for Destroy Many Test' },
      ];

      const dashboards = await createManyDashboardsWithGraphQL(dashboardsData);

      const dashboardIds = dashboards.map((d) => d.id);

      pageLayoutIds = dashboards
        .map((d) => d.pageLayoutId)
        .filter(isNonEmptyString);

      expect(pageLayoutIds.length).toBe(dashboardsData.length);

      for (const pageLayoutId of pageLayoutIds) {
        const { data } = await findOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });

        expect(data.getPageLayout).toBeDefined();
      }

      await destroyManyDashboardsWithGraphQL({
        id: { in: dashboardIds },
      });

      for (const pageLayoutId of pageLayoutIds) {
        const { errors } = await findOnePageLayout({
          expectToFail: true,
          input: { id: pageLayoutId },
        });

        expect(errors).toBeDefined();

        const { errors: restoreErrors } = await restoreOnePageLayout({
          expectToFail: true,
          input: { id: pageLayoutId },
        });

        expect(restoreErrors).toBeDefined();
      }

      pageLayoutIds = [];
    });
  });
});
