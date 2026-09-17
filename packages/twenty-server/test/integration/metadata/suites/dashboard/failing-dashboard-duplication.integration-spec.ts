import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { duplicateOneDashboardQueryFactory } from 'test/integration/metadata/suites/dashboard/utils/duplicate-one-dashboard-query-factory.util';
import { duplicateOneDashboard } from 'test/integration/metadata/suites/dashboard/utils/duplicate-one-dashboard.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
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

describe('Dashboard duplication should follow the caller role', () => {
  const DASHBOARD_ID = '3d1f2a52-6c5e-4b9a-8f1e-2c4d6e8f0a1b';
  const DASHBOARD_TITLE = 'Dashboard Out Of Reach';
  let dashboardObjectMetadataId: string;
  let memberRoleId: string;

  const setMemberDashboardPermissions = ({
    canReadObjectRecords,
    canUpdateObjectRecords,
  }: {
    canReadObjectRecords: boolean;
    canUpdateObjectRecords: boolean;
  }) =>
    upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: memberRoleId,
        objectPermissions: [
          {
            objectMetadataId: dashboardObjectMetadataId,
            canReadObjectRecords,
            canUpdateObjectRecords,
            canSoftDeleteObjectRecords: canUpdateObjectRecords,
            canDestroyObjectRecords: canUpdateObjectRecords,
          },
        ],
      },
    });

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: 'id nameSingular',
    });
    const dashboardObject = objects.find(
      (object) => object.nameSingular === 'dashboard',
    );

    jestExpectToBeDefined(dashboardObject);

    dashboardObjectMetadataId = dashboardObject.id;
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await createTestDashboardWithGraphQL({
      id: DASHBOARD_ID,
      title: DASHBOARD_TITLE,
    });
  });

  afterAll(async () => {
    await setMemberDashboardPermissions({
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
    });
    await destroyDashboardWithGraphQL(DASHBOARD_ID);
  });

  it.each([
    {
      title: 'read dashboards',
      permissions: {
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
      },
    },
    {
      title: 'create dashboards',
      permissions: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
      },
    },
  ])(
    'should refuse a member whose role cannot $title',
    async ({ permissions }) => {
      await setMemberDashboardPermissions(permissions);

      const response = await makeMetadataAPIRequestWithMemberRole(
        duplicateOneDashboardQueryFactory({ input: { id: DASHBOARD_ID } }),
      );

      expect(response.body.data?.duplicateDashboard ?? null).toBeNull();
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');

      const copies = await makeGraphqlAPIRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'dashboard',
          objectMetadataPluralName: 'dashboards',
          gqlFields: 'id',
          filter: { title: { eq: `${DASHBOARD_TITLE} (Copy)` } },
        }),
      );

      expect(copies.body.errors).toBeUndefined();
      expect(copies.body.data.dashboards.edges).toEqual([]);
    },
  );
});
