import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/constants/page-layout-with-filters-gql-fields.constant';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '9c1e5b7a-3d2f-4e6a-8b9c-0d1e2f3a4b01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

type TestContext = {
  pageLayoutType: PageLayoutType;
  filters: PageLayoutFilter[];
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when filters are set on a record page layout',
    context: {
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      filters: [PERIOD_FILTER],
    },
  },
  {
    title: 'when two filters share an id',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [PERIOD_FILTER, { ...PERIOD_FILTER, label: 'Close date' }],
    },
  },
  {
    title: 'when a filter label is blank',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [{ ...PERIOD_FILTER, label: '   ' }],
    },
  },
  {
    title: 'when a default value uses an operand date fields do not support',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [
        {
          ...PERIOD_FILTER,
          defaultValue: {
            conditions: [
              { operand: ViewFilterOperand.CONTAINS, value: '2026' },
            ],
          },
        },
      ],
    },
  },
  {
    title: 'when a default value holds the object form of a relative date',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [
        {
          ...PERIOD_FILTER,
          defaultValue: {
            conditions: [
              {
                operand: ViewFilterOperand.IS_RELATIVE,
                value: JSON.stringify({
                  direction: 'PAST',
                  amount: 1,
                  unit: 'MONTH',
                }),
              },
            ],
          },
        },
      ],
    },
  },
  {
    title: 'when a default value holds a date with a time',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [
        {
          ...PERIOD_FILTER,
          defaultValue: {
            conditions: [
              {
                operand: ViewFilterOperand.IS_AFTER,
                value: '2026-01-01T10:00',
              },
            ],
          },
        },
      ],
    },
  },
];

describe('Page layout with filters update should fail', () => {
  let pageLayoutId: string;

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context: { pageLayoutType, filters } }) => {
      const { data: layoutData } = await createOnePageLayout({
        expectToFail: false,
        input: { name: 'Layout With Invalid Filters', type: pageLayoutType },
      });

      pageLayoutId = layoutData.createPageLayout.id;

      const { data: tabData } = await createOnePageLayoutTab({
        expectToFail: false,
        input: { title: 'Tab 1', pageLayoutId },
      });

      const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: true,
        gqlFields: PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS,
        input: {
          id: pageLayoutId,
          name: 'Layout With Invalid Filters',
          type: pageLayoutType,
          objectMetadataId: null,
          filters,
          tabs: [
            {
              id: tabData.createPageLayoutTab.id,
              title: 'Tab 1',
              position: 0,
              widgets: [],
            },
          ],
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});

describe('Installed application dashboard filters update should fail', () => {
  const applicationUniversalIdentifier = v4();
  const dashboardUniversalIdentifier = v4();

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier,
      name: 'Dashboard Filters Application',
      description: 'App shipping a dashboard with filters',
      sourcePath: 'test-dashboard-filters',
    });

    await syncApplication({
      expectToFail: false,
      manifest: buildBaseManifest({
        appId: applicationUniversalIdentifier,
        roleId: v4(),
        overrides: {
          pageLayouts: [
            {
              universalIdentifier: dashboardUniversalIdentifier,
              name: 'Installed Dashboard',
              type: PageLayoutType.DASHBOARD,
              filters: [PERIOD_FILTER],
              tabs: [
                { universalIdentifier: v4(), title: 'Tab 1', position: 0 },
              ],
            },
          ],
        },
      }),
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
  });

  it('when the workspace changes the filters of an installed dashboard', async () => {
    const { data } = await findPageLayouts({
      expectToFail: false,
      input: undefined,
      gqlFields: 'id universalIdentifier tabs { id title position }',
    });

    const installedDashboard = data.getPageLayouts.find(
      ({ universalIdentifier }) =>
        universalIdentifier === dashboardUniversalIdentifier,
    );

    jestExpectToBeDefined(installedDashboard);

    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      gqlFields: PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS,
      input: {
        id: installedDashboard.id,
        name: 'Installed Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        filters: [{ ...PERIOD_FILTER, label: 'Quarter' }],
        tabs: (installedDashboard.tabs ?? []).map(
          ({ id, title, position }) => ({ id, title, position, widgets: [] }),
        ),
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: (message) =>
        message.replace(installedDashboard.id, '<pageLayoutId>'),
    });
  });
});
