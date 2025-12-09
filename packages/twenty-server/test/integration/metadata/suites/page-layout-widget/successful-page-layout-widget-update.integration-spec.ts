import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';

describe('Page layout widget update should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;
  let testPageLayoutWidgetId: string;

  beforeAll(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widget Updates' },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widget Updates',
        pageLayoutId: testPageLayoutId,
      },
    });

    testPageLayoutTabId = tabData.createPageLayoutTab.id;
  });

  afterAll(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testPageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  beforeEach(async () => {
    const { data } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Original Widget Title',
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      },
    });

    testPageLayoutWidgetId = data.createPageLayoutWidget.id;
  });

  afterEach(async () => {
    await destroyOnePageLayoutWidget({
      expectToFail: false,
      input: { id: testPageLayoutWidgetId },
    });
  });

  it('should update page layout widget title', async () => {
    const { data } = await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: testPageLayoutWidgetId,
        title: 'Updated Widget Title',
      },
    });

    expect(data.updatePageLayoutWidget).toMatchObject({
      id: testPageLayoutWidgetId,
      title: 'Updated Widget Title',
    });
  });

  it('should update page layout widget type', async () => {
    const { data } = await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: testPageLayoutWidgetId,
        type: WidgetType.GRAPH,
      },
    });

    expect(data.updatePageLayoutWidget).toMatchObject({
      id: testPageLayoutWidgetId,
      type: WidgetType.GRAPH,
    });
  });

  it('should update page layout widget grid position', async () => {
    const { data } = await updateOnePageLayoutWidget({
      expectToFail: false,
      input: {
        id: testPageLayoutWidgetId,
        gridPosition: {
          row: 2,
          column: 3,
          rowSpan: 2,
          columnSpan: 4,
        },
      },
    });

    expect(data.updatePageLayoutWidget).toMatchObject({
      id: testPageLayoutWidgetId,
      gridPosition: {
        row: 2,
        column: 3,
        rowSpan: 2,
        columnSpan: 4,
      },
    });
  });
});
