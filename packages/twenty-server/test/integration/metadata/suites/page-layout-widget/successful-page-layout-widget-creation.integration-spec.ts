import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';

describe('Page layout widget creation should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;
  let createdPageLayoutWidgetId: string;

  beforeAll(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widgets' },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widgets',
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

  afterEach(async () => {
    if (createdPageLayoutWidgetId) {
      await destroyOnePageLayoutWidget({
        expectToFail: false,
        input: { id: createdPageLayoutWidgetId },
      });
    }
  });

  it('should create a page layout widget', async () => {
    const { data } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Test Widget',
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      },
    });

    createdPageLayoutWidgetId = data?.createPageLayoutWidget?.id;

    expect(data.createPageLayoutWidget).toMatchObject({
      id: expect.any(String),
      title: 'Test Widget',
      type: WidgetType.VIEW,
      pageLayoutTabId: testPageLayoutTabId,
    });
  });

  it('should create a page layout widget with specific type', async () => {
    const { data } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Graph Widget',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.GRAPH,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 2,
          columnSpan: 2,
        },
      },
    });

    createdPageLayoutWidgetId = data?.createPageLayoutWidget?.id;

    expect(data.createPageLayoutWidget).toMatchObject({
      id: expect.any(String),
      title: 'Graph Widget',
      type: WidgetType.GRAPH,
    });
  });
});
