import { isNonEmptyString } from '@sniptt/guards';
import {
  createManyDashboardsWithGraphQL,
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
  destroyManyDashboardsWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';

describe('Dashboard to Page Layout sync should succeed', () => {
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

      expect(isNonEmptyString(pageLayoutId)).toBe(true);

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
      }

      pageLayoutIds = [];
    });
  });
});
