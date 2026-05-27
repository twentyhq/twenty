import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { findPageLayoutWidgets } from 'test/integration/metadata/suites/page-layout-widget/utils/find-page-layout-widgets.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

const WIDGET_OVERRIDE_GQL_FIELDS = `
  id
  title
  type
  pageLayoutTabId
  conditionalDisplay
  createdAt
  updatedAt
  deletedAt
`;

describe('Page layout widget override behavior', () => {
  let seededPageLayoutId: string;
  let seededWidgetId: string;
  let seededWidgetOriginalPageLayoutTabId: string;
  let seededWidgetOriginalTabLayoutMode: PageLayoutTabLayoutMode;
  let seededWidgetOriginalTitle: string;

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
      gqlFields: `
        id
        title
        position
        layoutMode
        pageLayoutId
      `,
    });

    expect(tabsData.getPageLayoutTabs.length).toBeGreaterThanOrEqual(1);

    const firstTabId = tabsData.getPageLayoutTabs[0].id;

    seededWidgetOriginalTabLayoutMode = tabsData.getPageLayoutTabs[0]
      .layoutMode as PageLayoutTabLayoutMode;

    const { data: widgetsData } = await findPageLayoutWidgets({
      expectToFail: false,
      input: { pageLayoutTabId: firstTabId },
      gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
    });

    expect(widgetsData.getPageLayoutWidgets.length).toBeGreaterThanOrEqual(1);

    const firstWidget = widgetsData.getPageLayoutWidgets[0];

    seededWidgetId = firstWidget.id;
    seededWidgetOriginalPageLayoutTabId = firstWidget.pageLayoutTabId;
    seededWidgetOriginalTitle = firstWidget.title;
  });

  afterAll(async () => {
    await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: seededWidgetId,
        pageLayoutTabId: seededWidgetOriginalPageLayoutTabId,
        title: seededWidgetOriginalTitle,
      },
      gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
    });
  });

  it('should override a seeded widget title and return the overridden value', async () => {
    const overriddenTitle = `Widget Override ${Date.now()}`;

    const { data } = await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: seededWidgetId,
        title: overriddenTitle,
      },
      gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
    });

    expect(data.updatePageLayoutWidget.title).toBe(overriddenTitle);
  });

  it('should move a seeded widget to another tab through an override', async () => {
    let destinationTabId: string | undefined;

    try {
      const { data: tabData } = await createOnePageLayoutTab({
        expectToFail: false,
        input: {
          title: `Widget Move Override ${Date.now()}`,
          pageLayoutId: seededPageLayoutId,
          layoutMode: seededWidgetOriginalTabLayoutMode,
        },
      });

      destinationTabId = tabData.createPageLayoutTab.id;

      const { data } = await updateOnePageLayoutWidget({
        expectToFail: false,
        input: {
          id: seededWidgetId,
          pageLayoutTabId: destinationTabId,
        },
        gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
      });

      expect(data.updatePageLayoutWidget.pageLayoutTabId).toBe(
        destinationTabId,
      );

      const { data: originalTabWidgetsData } = await findPageLayoutWidgets({
        expectToFail: false,
        input: { pageLayoutTabId: seededWidgetOriginalPageLayoutTabId },
        gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
      });

      expect(
        originalTabWidgetsData.getPageLayoutWidgets.map((widget) => widget.id),
      ).not.toContain(seededWidgetId);

      const { data: destinationTabWidgetsData } = await findPageLayoutWidgets({
        expectToFail: false,
        input: { pageLayoutTabId: destinationTabId },
        gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
      });

      expect(
        destinationTabWidgetsData.getPageLayoutWidgets.map(
          (widget) => widget.id,
        ),
      ).toContain(seededWidgetId);
    } finally {
      await updateOnePageLayoutWidget({
        expectToFail: false,
        input: {
          id: seededWidgetId,
          pageLayoutTabId: seededWidgetOriginalPageLayoutTabId,
        },
        gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
      });

      if (destinationTabId !== undefined) {
        await destroyOnePageLayoutTab({
          expectToFail: false,
          input: { id: destinationTabId },
        });
      }
    }
  });

  it('should return the overridden title when querying the widget', async () => {
    const { data: tabsData } = await findPageLayoutTabs({
      expectToFail: false,
      input: {
        pageLayoutId: (
          await findPageLayouts({
            expectToFail: false,
            input: undefined,
          })
        ).data.getPageLayouts.find(
          (layout) => layout.type === PageLayoutType.RECORD_PAGE,
        )!.id,
      },
    });

    const { data: widgetsData } = await findPageLayoutWidgets({
      expectToFail: false,
      input: { pageLayoutTabId: tabsData.getPageLayoutTabs[0].id },
      gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
    });

    const widget = widgetsData.getPageLayoutWidgets.find(
      (widgetItem) => widgetItem.id === seededWidgetId,
    );

    expect(widget).toBeDefined();
    expect(widget!.title).not.toBe(seededWidgetOriginalTitle);
  });

  it('should implicitly restore when updating title back to original value', async () => {
    const { data } = await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: seededWidgetId,
        title: seededWidgetOriginalTitle,
      },
      gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
    });

    expect(data.updatePageLayoutWidget.title).toBe(seededWidgetOriginalTitle);
  });

  it('should override conditionalDisplay independently from title', async () => {
    const overriddenTitle = `Multi Override ${Date.now()}`;
    const overriddenConditionalDisplay = {
      fieldMetadataId: '00000000-0000-0000-0000-000000000001',
      operator: 'is',
      value: 'test',
    };

    const { data: titleData } = await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: seededWidgetId,
        title: overriddenTitle,
      },
      gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
    });

    expect(titleData.updatePageLayoutWidget.title).toBe(overriddenTitle);

    const { data: conditionalData } = await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: seededWidgetId,
        conditionalDisplay: overriddenConditionalDisplay,
      },
      gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
    });

    expect(conditionalData.updatePageLayoutWidget.title).toBe(overriddenTitle);
    expect(conditionalData.updatePageLayoutWidget.conditionalDisplay).toEqual(
      overriddenConditionalDisplay,
    );

    await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: seededWidgetId,
        title: seededWidgetOriginalTitle,
        conditionalDisplay: null,
      },
      gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
    });
  });
});
