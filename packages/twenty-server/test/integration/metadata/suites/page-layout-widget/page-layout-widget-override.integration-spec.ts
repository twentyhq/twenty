import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { findPageLayoutWidgets } from 'test/integration/metadata/suites/page-layout-widget/utils/find-page-layout-widgets.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';

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
  let seededWidgetId: string;
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

    const { data: tabsData } = await findPageLayoutTabs({
      expectToFail: false,
      input: { pageLayoutId: recordPageLayout!.id },
    });

    expect(tabsData.getPageLayoutTabs.length).toBeGreaterThanOrEqual(1);

    const firstTabId = tabsData.getPageLayoutTabs[0].id;

    const { data: widgetsData } = await findPageLayoutWidgets({
      expectToFail: false,
      input: { pageLayoutTabId: firstTabId },
      gqlFields: WIDGET_OVERRIDE_GQL_FIELDS,
    });

    expect(widgetsData.getPageLayoutWidgets.length).toBeGreaterThanOrEqual(1);

    const firstWidget = widgetsData.getPageLayoutWidgets[0];

    seededWidgetId = firstWidget.id;
    seededWidgetOriginalTitle = firstWidget.title;
  });

  afterAll(async () => {
    await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: seededWidgetId,
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
