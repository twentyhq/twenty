import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { deleteOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/delete-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { restoreOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/restore-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

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

  it('should soft delete and restore a page layout widget', async () => {
    const { data: createData } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Widget To Delete',
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      },
    });

    const widgetId = createData.createPageLayoutWidget.id;

    const { data: deleteData } = await deleteOnePageLayoutWidget({
      expectToFail: false,
      input: { id: widgetId },
    });

    expect(deleteData.deletePageLayoutWidget.deletedAt).not.toBeNull();

    const { data: restoreData } = await restoreOnePageLayoutWidget({
      expectToFail: false,
      input: { id: widgetId },
    });

    expect(restoreData.restorePageLayoutWidget.deletedAt).toBeNull();

    await destroyOnePageLayoutWidget({
      expectToFail: false,
      input: { id: widgetId },
    });
  });

  it('should hard delete a page layout widget', async () => {
    const { data: createData } = await createOnePageLayoutWidget({
      expectToFail: false,
      input: {
        title: 'Widget To Destroy',
        pageLayoutTabId: testPageLayoutTabId,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      },
    });

    const { data: destroyData } = await destroyOnePageLayoutWidget({
      expectToFail: false,
      input: { id: createData.createPageLayoutWidget.id },
    });

    expect(destroyData.destroyPageLayoutWidget).toBe(true);
  });
});
