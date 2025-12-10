import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { duplicateOneDashboard } from 'test/integration/metadata/suites/dashboard/utils/duplicate-one-dashboard.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

type TestContext = {
  dashboardId: string | (() => Promise<string>);
  cleanupDashboardId?: boolean;
};

type GlobalTestContext = {
  dashboardWithDeletedPageLayoutId?: string;
};

const globalTestContext: GlobalTestContext = {};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when dashboard does not exist',
    context: {
      dashboardId: '7f7b4ae6-ebe4-4d7b-91a9-0043dffd5837',
    },
  },
  {
    title: 'when dashboard page layout was deleted',
    context: {
      dashboardId: async () => {
        const dashboard = await createTestDashboardWithGraphQL({
          id: '8cbbc499-5a23-473d-ad0b-eaa92d4c9831',
          title: 'Dashboard With Deleted Page Layout',
        });

        globalTestContext.dashboardWithDeletedPageLayoutId = dashboard.id;

        if (isDefined(dashboard.pageLayoutId)) {
          await destroyOnePageLayout({
            expectToFail: false,
            input: { id: dashboard.pageLayoutId },
          });
        }

        return dashboard.id;
      },
      cleanupDashboardId: true,
    },
  },
];

describe('Dashboard duplication should fail', () => {
  afterEach(async () => {
    if (isDefined(globalTestContext.dashboardWithDeletedPageLayoutId)) {
      await destroyDashboardWithGraphQL(
        globalTestContext.dashboardWithDeletedPageLayoutId,
      );
      globalTestContext.dashboardWithDeletedPageLayoutId = undefined;
    }
  });

  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context }) => {
      const dashboardId =
        typeof context.dashboardId === 'function'
          ? await context.dashboardId()
          : context.dashboardId;

      const { errors } = await duplicateOneDashboard({
        expectToFail: true,
        input: { id: dashboardId },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
