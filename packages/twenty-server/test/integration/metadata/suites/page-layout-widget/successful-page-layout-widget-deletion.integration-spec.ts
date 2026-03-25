import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

describe('Page layout widget deletion should succeed', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;

  beforeAll(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widget Deletions' },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widget Deletions',
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

  it('should hard delete a page layout widget', async () => {
    const { data: createData } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Widget To Destroy',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.IFRAME,
        configuration: {
          configurationType: WidgetConfigurationType.IFRAME,
        },
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      },
    });

    const widgetId = createData.createPageLayoutWidget.id;

    const { data: destroyData } = await destroyOnePageLayoutWidget({
      expectToFail: false,
      input: { id: widgetId },
    });

    expect(destroyData.destroyPageLayoutWidget).toBe(true);
  });
});
