import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { updateOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/update-one-page-layout-tab.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

const TAB_OVERRIDE_GQL_FIELDS = `
  id
  title
  position
  icon
  pageLayoutId
  createdAt
  updatedAt
  deletedAt
`;

describe('Page layout tab override behavior', () => {
  let seededTabId: string;
  let seededTabOriginalTitle: string;
  let seededTabOriginalPosition: number;
  let seededTabOriginalIcon: string | null;
  let seededPageLayoutId: string;

  beforeAll(async () => {
    const { data: layoutsData } = await findPageLayouts({
      expectToFail: false,
      input: undefined,
    });

    const recordPageLayout = layoutsData.getPageLayouts.find(
      (layout) => layout.type === PageLayoutType.RECORD_PAGE,
    );

    expect(recordPageLayout).toBeDefined();

    seededPageLayoutId = recordPageLayout!.id;

    const { data: tabsData } = await findPageLayoutTabs({
      expectToFail: false,
      input: { pageLayoutId: seededPageLayoutId },
      gqlFields: TAB_OVERRIDE_GQL_FIELDS,
    });

    expect(tabsData.getPageLayoutTabs.length).toBeGreaterThanOrEqual(1);

    const firstTab = tabsData.getPageLayoutTabs[0];

    seededTabId = firstTab.id;
    seededTabOriginalTitle = firstTab.title;
    seededTabOriginalPosition = firstTab.position;
    seededTabOriginalIcon = firstTab.icon ?? null;
  });

  afterAll(async () => {
    await updateOnePageLayoutTab({
      expectToFail: false,
      input: {
        id: seededTabId,
        title: seededTabOriginalTitle,
        position: seededTabOriginalPosition,
        icon: seededTabOriginalIcon,
      },
      gqlFields: TAB_OVERRIDE_GQL_FIELDS,
    });
  });

  it('should override a seeded tab title and return the overridden value', async () => {
    const overriddenTitle = `Override Test ${Date.now()}`;

    const { data } = await updateOnePageLayoutTab({
      expectToFail: false,
      input: {
        id: seededTabId,
        title: overriddenTitle,
      },
      gqlFields: TAB_OVERRIDE_GQL_FIELDS,
    });

    expect(data.updatePageLayoutTab.title).toBe(overriddenTitle);
  });

  it('should return the overridden title when querying the tab', async () => {
    const { data: tabsData } = await findPageLayoutTabs({
      expectToFail: false,
      input: { pageLayoutId: seededPageLayoutId },
      gqlFields: TAB_OVERRIDE_GQL_FIELDS,
    });

    const tab = tabsData.getPageLayoutTabs.find(
      (tabItem) => tabItem.id === seededTabId,
    );

    expect(tab).toBeDefined();
    expect(tab!.title).not.toBe(seededTabOriginalTitle);
  });

  it('should implicitly restore when updating title back to original value', async () => {
    const { data } = await updateOnePageLayoutTab({
      expectToFail: false,
      input: {
        id: seededTabId,
        title: seededTabOriginalTitle,
      },
      gqlFields: TAB_OVERRIDE_GQL_FIELDS,
    });

    expect(data.updatePageLayoutTab.title).toBe(seededTabOriginalTitle);
  });

  it('should override position on a seeded tab', async () => {
    const overriddenPosition = 999;

    const { data } = await updateOnePageLayoutTab({
      expectToFail: false,
      input: {
        id: seededTabId,
        position: overriddenPosition,
      },
      gqlFields: TAB_OVERRIDE_GQL_FIELDS,
    });

    expect(data.updatePageLayoutTab.position).toBe(overriddenPosition);

    await updateOnePageLayoutTab({
      expectToFail: false,
      input: {
        id: seededTabId,
        position: seededTabOriginalPosition,
      },
      gqlFields: TAB_OVERRIDE_GQL_FIELDS,
    });
  });

  it('should override icon on a seeded tab', async () => {
    const overriddenIcon = 'IconStar';

    const { data } = await updateOnePageLayoutTab({
      expectToFail: false,
      input: {
        id: seededTabId,
        icon: overriddenIcon,
      },
      gqlFields: TAB_OVERRIDE_GQL_FIELDS,
    });

    expect(data.updatePageLayoutTab.icon).toBe(overriddenIcon);

    await updateOnePageLayoutTab({
      expectToFail: false,
      input: {
        id: seededTabId,
        icon: seededTabOriginalIcon,
      },
      gqlFields: TAB_OVERRIDE_GQL_FIELDS,
    });
  });
});
