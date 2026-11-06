import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { duplicateOneDashboard } from 'test/integration/metadata/suites/dashboard/utils/duplicate-one-dashboard.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/constants/page-layout-with-filters-gql-fields.constant';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  type PageLayoutFilter,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';

const PERIOD_FILTER: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

const QUARTER_FILTER: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
      { operand: ViewFilterOperand.IS_BEFORE, value: '2026-04-01' },
    ],
  },
};

const createDashboardPageLayoutWithTab = async () => {
  const { data: layoutData } = await createOnePageLayout({
    expectToFail: false,
    input: { name: 'Dashboard With Filters', type: PageLayoutType.DASHBOARD },
  });

  const pageLayoutId = layoutData.createPageLayout.id;

  const { data: tabData } = await createOnePageLayoutTab({
    expectToFail: false,
    input: { title: 'Tab 1', pageLayoutId },
  });

  return { pageLayoutId, tabId: tabData.createPageLayoutTab.id };
};

const saveDashboard = ({
  pageLayoutId,
  tabId,
  filters,
}: {
  pageLayoutId: string;
  tabId: string;
  filters?: UpdatePageLayoutWithTabsInput['filters'];
}) =>
  updateOnePageLayoutWithTabsAndWidgets({
    expectToFail: false,
    gqlFields: PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS,
    input: {
      id: pageLayoutId,
      name: 'Dashboard With Filters',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      filters,
      tabs: [{ id: tabId, title: 'Tab 1', position: 0, widgets: [] }],
    },
  });

const findPageLayoutFilters = async (pageLayoutId: string) => {
  const { data } = await findOnePageLayout({
    expectToFail: false,
    gqlFields: PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS,
    input: { id: pageLayoutId },
  });

  return data.getPageLayout?.filters;
};

const findStoredPageLayoutFilters = async (pageLayoutId: string) => {
  const [{ filters }] = await globalThis.testDataSource.query(
    `SELECT filters FROM core."pageLayout" WHERE id = $1`,
    [pageLayoutId],
  );

  return filters;
};

describe('Page layout with filters update should succeed', () => {
  let pageLayoutId: string;
  let tabId: string;

  beforeEach(async () => {
    ({ pageLayoutId, tabId } = await createDashboardPageLayoutWithTab());
  });

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it('should read the built-in Date range filter while nothing is stored', async () => {
    expect(await findPageLayoutFilters(pageLayoutId)).toEqual([
      DASHBOARD_DATE_RANGE_FILTER,
    ]);
    expect(await findStoredPageLayoutFilters(pageLayoutId)).toBeNull();
  });

  it('should save a default range and read it back', async () => {
    const { data } = await saveDashboard({
      pageLayoutId,
      tabId,
      filters: [QUARTER_FILTER],
    });

    expect(data.updatePageLayoutWithTabsAndWidgets.filters).toEqual([
      QUARTER_FILTER,
    ]);
    expect(await findPageLayoutFilters(pageLayoutId)).toEqual([QUARTER_FILTER]);
  });

  it('should store the built-in label and position whatever the input says', async () => {
    await saveDashboard({
      pageLayoutId,
      tabId,
      filters: [{ ...PERIOD_FILTER, label: 'Period', position: 4 }],
    });

    expect(await findStoredPageLayoutFilters(pageLayoutId)).toEqual([
      PERIOD_FILTER,
    ]);
  });

  it('should store nothing when the built-in filter is saved without a default value', async () => {
    const { defaultValue: _defaultValue, ...filterWithoutDefaultValue } =
      PERIOD_FILTER;

    const { data } = await saveDashboard({
      pageLayoutId,
      tabId,
      filters: [filterWithoutDefaultValue],
    });

    expect(data.updatePageLayoutWithTabsAndWidgets.filters).toEqual([
      DASHBOARD_DATE_RANGE_FILTER,
    ]);
    expect(await findStoredPageLayoutFilters(pageLayoutId)).toBeNull();
  });

  it('should keep the filters when a save omits them', async () => {
    await saveDashboard({ pageLayoutId, tabId, filters: [PERIOD_FILTER] });
    await saveDashboard({ pageLayoutId, tabId });

    expect(await findPageLayoutFilters(pageLayoutId)).toEqual([PERIOD_FILTER]);
  });

  it.each([
    ['null', null],
    [
      'the built-in filter without a default value',
      [DASHBOARD_DATE_RANGE_FILTER],
    ],
  ])(
    'should clear the default range when a save sends %s',
    async (_input, filters) => {
      await saveDashboard({ pageLayoutId, tabId, filters: [PERIOD_FILTER] });
      await saveDashboard({ pageLayoutId, tabId, filters });

      expect(await findStoredPageLayoutFilters(pageLayoutId)).toBeNull();
      expect(await findPageLayoutFilters(pageLayoutId)).toEqual([
        DASHBOARD_DATE_RANGE_FILTER,
      ]);
    },
  );
});

describe('Page layout turned into a dashboard', () => {
  let pageLayoutId: string;

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it('should store nothing when it is saved as a dashboard with the built-in filter', async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Record Page', type: PageLayoutType.RECORD_PAGE },
    });

    pageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: { title: 'Tab 1', pageLayoutId },
    });

    const { data } = await saveDashboard({
      pageLayoutId,
      tabId: tabData.createPageLayoutTab.id,
      filters: [DASHBOARD_DATE_RANGE_FILTER],
    });

    expect(data.updatePageLayoutWithTabsAndWidgets.filters).toEqual([
      DASHBOARD_DATE_RANGE_FILTER,
    ]);
    expect(await findStoredPageLayoutFilters(pageLayoutId)).toBeNull();
  });
});

describe('Dashboard duplication should copy the page layout filters', () => {
  const dashboardId = '4a3d3a52-6f0f-4c55-9a0e-7d1b8e2f6c10';
  let duplicatedDashboardId: string | undefined;

  afterEach(async () => {
    await destroyDashboardWithGraphQL(dashboardId);

    if (isDefined(duplicatedDashboardId)) {
      await destroyDashboardWithGraphQL(duplicatedDashboardId);
    }
  });

  it('should copy the filters to the duplicated page layout', async () => {
    const { pageLayoutId, tabId } = await createDashboardPageLayoutWithTab();

    await saveDashboard({ pageLayoutId, tabId, filters: [PERIOD_FILTER] });
    await createTestDashboardWithGraphQL({
      id: dashboardId,
      title: 'Dashboard With Filters',
      pageLayoutId,
    });

    const { data } = await duplicateOneDashboard({
      expectToFail: false,
      input: { id: dashboardId },
    });

    duplicatedDashboardId = data.duplicateDashboard.id;

    const duplicatedPageLayoutId = data.duplicateDashboard.pageLayoutId;

    jestExpectToBeDefined(duplicatedPageLayoutId);
    expect(duplicatedPageLayoutId).not.toBe(pageLayoutId);
    expect(await findPageLayoutFilters(duplicatedPageLayoutId)).toEqual([
      PERIOD_FILTER,
    ]);
  });
});

describe('Standard dashboard filters update should succeed', () => {
  let standardDashboardId: string;
  let standardDashboardTabs: UpdatePageLayoutWithTabsInput['tabs'];

  const saveStandardDashboard = (
    filters: UpdatePageLayoutWithTabsInput['filters'],
  ) =>
    updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      gqlFields: PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS,
      input: {
        id: standardDashboardId,
        name: 'My First Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        filters,
        tabs: standardDashboardTabs,
      },
    });

  beforeAll(async () => {
    const { data } = await findPageLayouts({
      expectToFail: false,
      input: undefined,
      gqlFields: 'id universalIdentifier',
    });

    const standardDashboard = data.getPageLayouts.find(
      ({ universalIdentifier }) =>
        universalIdentifier ===
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard
          .universalIdentifier,
    );

    jestExpectToBeDefined(standardDashboard);
    standardDashboardId = standardDashboard.id;

    const tabs = await globalThis.testDataSource.query(
      `SELECT id, title, position, icon, "layoutMode" FROM core."pageLayoutTab"
       WHERE "pageLayoutId" = $1 AND "deletedAt" IS NULL AND "isActive"`,
      [standardDashboardId],
    );

    const widgets = await globalThis.testDataSource.query(
      `SELECT id, "pageLayoutTabId", title, type, "objectMetadataId", position,
       configuration, "conditionalDisplay", "conditionalAvailabilityExpression"
       FROM core."pageLayoutWidget"
       WHERE "pageLayoutTabId" = ANY($1) AND "deletedAt" IS NULL AND "isActive"`,
      [tabs.map(({ id }: { id: string }) => id)],
    );

    standardDashboardTabs = tabs.map((tab: { id: string }) => ({
      ...tab,
      widgets: widgets.filter(
        ({ pageLayoutTabId }: { pageLayoutTabId: string }) =>
          pageLayoutTabId === tab.id,
      ),
    }));
  });

  afterAll(async () => {
    await saveStandardDashboard(null);
  });

  it('should let the workspace set filters on the standard dashboard', async () => {
    const { data } = await saveStandardDashboard([PERIOD_FILTER]);

    expect(data.updatePageLayoutWithTabsAndWidgets.filters).toEqual([
      PERIOD_FILTER,
    ]);
    expect(await findPageLayoutFilters(standardDashboardId)).toEqual([
      PERIOD_FILTER,
    ]);
  });
});
