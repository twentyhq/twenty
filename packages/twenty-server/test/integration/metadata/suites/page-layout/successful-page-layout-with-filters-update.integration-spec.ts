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
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '4a3d3a52-6f0f-4c55-9a0e-7d1b8e2f6c01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

const CLOSE_DATE_FILTER: PageLayoutFilter = {
  id: '4a3d3a52-6f0f-4c55-9a0e-7d1b8e2f6c02',
  label: 'Close date',
  type: PageLayoutFilterType.DATE,
  position: 1,
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

  it('should save filters and read them back', async () => {
    const { data } = await saveDashboard({
      pageLayoutId,
      tabId,
      filters: [PERIOD_FILTER, CLOSE_DATE_FILTER],
    });

    expect(data.updatePageLayoutWithTabsAndWidgets.filters).toEqual([
      PERIOD_FILTER,
      CLOSE_DATE_FILTER,
    ]);
    expect(await findPageLayoutFilters(pageLayoutId)).toEqual([
      PERIOD_FILTER,
      CLOSE_DATE_FILTER,
    ]);
  });

  it('should default an omitted default value to null', async () => {
    const { defaultValue: _defaultValue, ...filterWithoutDefaultValue } =
      PERIOD_FILTER;

    await saveDashboard({
      pageLayoutId,
      tabId,
      filters: [filterWithoutDefaultValue],
    });

    expect(await findPageLayoutFilters(pageLayoutId)).toEqual([
      { ...PERIOD_FILTER, defaultValue: null },
    ]);
  });

  it('should keep the filters when a save omits them', async () => {
    await saveDashboard({ pageLayoutId, tabId, filters: [PERIOD_FILTER] });
    await saveDashboard({ pageLayoutId, tabId });

    expect(await findPageLayoutFilters(pageLayoutId)).toEqual([PERIOD_FILTER]);
  });

  it('should clear the filters when a save sends null', async () => {
    await saveDashboard({ pageLayoutId, tabId, filters: [PERIOD_FILTER] });
    await saveDashboard({ pageLayoutId, tabId, filters: null });

    expect(await findPageLayoutFilters(pageLayoutId)).toBeNull();
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
