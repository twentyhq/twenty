import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/constants/page-layout-with-filters-gql-fields.constant';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import {
  type PageLayoutFilter,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

const PERIOD_FILTER: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

describe('Installed application dashboard filters', () => {
  const applicationUniversalIdentifier = v4();
  const roleUniversalIdentifier = v4();
  const dashboardUniversalIdentifier = v4();
  const tabUniversalIdentifier = v4();

  const syncInstalledDashboard = (name: string) =>
    syncApplication({
      expectToFail: false,
      manifest: buildBaseManifest({
        appId: applicationUniversalIdentifier,
        roleId: roleUniversalIdentifier,
        overrides: {
          pageLayouts: [
            {
              universalIdentifier: dashboardUniversalIdentifier,
              name,
              type: PageLayoutType.DASHBOARD,
              tabs: [
                {
                  universalIdentifier: tabUniversalIdentifier,
                  title: 'Tab 1',
                  position: 0,
                },
              ],
            },
          ],
        },
      }),
    });

  const findInstalledDashboard = async () => {
    const { data } = await findPageLayouts({
      expectToFail: false,
      input: undefined,
      gqlFields: `${PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS} name universalIdentifier tabs { id title position }`,
    });

    const installedDashboard = data.getPageLayouts.find(
      ({ universalIdentifier }) =>
        universalIdentifier === dashboardUniversalIdentifier,
    );

    jestExpectToBeDefined(installedDashboard);

    return installedDashboard;
  };

  const findStoredFilters = async (pageLayoutId: string) => {
    const [{ filters }] = await globalThis.testDataSource.query(
      `SELECT filters FROM core."pageLayout" WHERE id = $1`,
      [pageLayoutId],
    );

    return filters;
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier,
      name: 'Dashboard Filters Application',
      description: 'App shipping a dashboard',
      sourcePath: 'test-dashboard-filters',
    });

    await syncInstalledDashboard('Installed Dashboard');
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
  });

  it('should read the built-in Date range filter on a freshly installed dashboard', async () => {
    const installedDashboard = await findInstalledDashboard();

    expect(installedDashboard.filters).toEqual([DASHBOARD_DATE_RANGE_FILTER]);
    expect(await findStoredFilters(installedDashboard.id)).toBeNull();
  });

  it('should keep the default range the workspace set when the application syncs again', async () => {
    const installedDashboard = await findInstalledDashboard();

    const { data } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      gqlFields: PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS,
      input: {
        id: installedDashboard.id,
        name: 'Installed Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        filters: [PERIOD_FILTER],
        tabs: (installedDashboard.tabs ?? []).map(
          ({ id, title, position }) => ({ id, title, position, widgets: [] }),
        ),
      },
    });

    expect(data.updatePageLayoutWithTabsAndWidgets.filters).toEqual([
      PERIOD_FILTER,
    ]);

    await syncInstalledDashboard('Installed Dashboard Renamed');

    const resyncedDashboard = await findInstalledDashboard();

    expect(resyncedDashboard.name).toBe('Installed Dashboard Renamed');
    expect(resyncedDashboard.filters).toEqual([PERIOD_FILTER]);
    expect(await findStoredFilters(installedDashboard.id)).toEqual([
      PERIOD_FILTER,
    ]);
  });
});
